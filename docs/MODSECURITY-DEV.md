# ModSecurity WAF — Developer Guide

ModSecurity is a Web Application Firewall (WAF) embedded in the Nginx reverse proxy.
It inspects every request that reaches `/api/*` and blocks those that match attack patterns.
WebSocket (`/socket.io/`, `/rt/socket.io/`) and frontend (`/`) traffic bypass the WAF entirely.

## How it fits in the stack

```
Client
  │
  ▼
Nginx (port 8080 dev / 443 prod)
  ├─ /api/*        ──► ModSecurity ──► gateway:3002
  ├─ /socket.io/*  ──► game:3003          (no WAF)
  └─ /             ──► frontend           (no WAF)
```

## Key files


| File                                 | Purpose                                                                |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `nginx/Dockerfile`                   | Multi-stage build — compiles ModSecurity + nginx connector from source |
| `nginx/modsecurity/main.conf`        | Entry point — only includes `modsecurity.conf`                         |
| `nginx/modsecurity/modsecurity.conf` | Engine settings + all WAF rules                                        |
| `nginx/conf/nginx-dev.conf`          | Dev nginx config — loads module, enables WAF on `/api/`                |
| `nginx/conf/nginx-prod.conf`         | Prod nginx config — same, plus TLS                                     |


## Engine modes

Edit `nginx/modsecurity/modsecurity.conf` line 1 and rebuild:

```
SecRuleEngine On           # enforce — block matching requests (default)
SecRuleEngine DetectionOnly # log without blocking — use when writing new rules
SecRuleEngine Off           # completely disabled
```

After changing the mode:

```bash
make build-nginx   # rebuilds the nginx image
make dev           # or make prod — restarts containers
```

## Build note

The first `make build-nginx` takes **5–10 minutes** while ModSecurity compiles from source.
Subsequent builds use Docker layer cache and are fast unless the Dockerfile or source URLs change.

---

## Rules reference

All rules live in `nginx/modsecurity/modsecurity.conf`. IDs start at 900010 to avoid
collisions with future OWASP CRS imports. Add new custom rules above 900400.

### Phase 1 — Header inspection (runs before body is read)


| ID     | Action | Condition                                                                           | HTTP status |
| ------ | ------ | ----------------------------------------------------------------------------------- | ----------- |
| 900010 | deny   | `Host` header is absent                                                             | 400         |
| 900011 | deny   | HTTP method is not in `GET HEAD POST PUT PATCH DELETE OPTIONS`                      | 405         |
| 900012 | deny   | `Content-Length` is present but contains non-digit characters                       | 400         |
| 900020 | deny   | Request URI contains `/.` (dotfiles, hidden paths)                                  | 403         |
| 900021 | deny   | Request URI ends with a dangerous extension (`.php .asp .jsp .sh .env .git .sql` …) | 403         |


### Phase 2 — Argument and body inspection (runs after body is read)


| ID     | Attack class      | What it detects                                                                                             | HTTP status       |
| ------ | ----------------- | ----------------------------------------------------------------------------------------------------------- | ----------------- |
| 900030 | Path traversal    | `../`, `%2e%2e/`, URL-decoded variants                                                                      | 400               |
| 900100 | SQL injection     | `UNION … SELECT`                                                                                            | 400               |
| 900101 | SQL injection     | `DROP TABLE`, `INSERT INTO`, `DELETE FROM`, `UPDATE … SET`, `CREATE TABLE`, `ALTER TABLE`, `TRUNCATE TABLE` | 400               |
| 900102 | SQL injection     | SQL comment sequences (`--` `#` `/`*), dangerous built-ins (`xp_`, `exec(`, `char(`, `convert(`)            | 400               |
| 900200 | XSS               | `<script` tag                                                                                               | 400               |
| 900201 | XSS               | `javascript:` URI scheme                                                                                    | 400               |
| 900202 | XSS               | DOM event-handler attributes (`onerror=`, `onload=`, `onclick=`, …)                                         | 400               |
| 900300 | Command injection | Shell metacharacters followed by common OS commands (`; ls`, `                                              | cat`,` && rm`, …) |
| 900301 | Null byte         | `%00` or raw `\x00` in URI or parameters                                                                    | 400               |


Phase 2 rules inspect `ARGS` (URL query params and URL-encoded form fields) and `REQUEST_URI`.
JSON request bodies are **not** inspected — this avoids false positives on chat messages and game state.

---

## Testing all rules

The stack must be running (`make dev` or `make prod`). Replace `http://localhost:8080` with
your prod URL as needed. Each command shows the expected HTTP status in the comment.

### Confirm WAF is active

```bash
# Should return the normal API response (200 or 401), NOT a connection error.
# If nginx fails to start, check `make log-nginx` for module load errors.
curl -si http://localhost:8080/api/core/users | head -5
```

### Rule 900010 — Missing Host header

```bash
curl -si --header 'Host:' http://localhost:8080/api/core/users
# Expected: 400 Bad Request
```

### Rule 900011 — Disallowed HTTP method

```bash
curl -si -X TRACE http://localhost:8080/api/core/users
# Expected: 405 Method Not Allowed

curl -si -X CONNECT http://localhost:8080/api/core/users
# Expected: 405 Method Not Allowed
```

### Rule 900012 — Non-numeric Content-Length

```bash
curl -si -X POST \
  -H 'Content-Length: 10; drop table users' \
  -H 'Content-Type: application/json' \
  -d '{}' \
  http://localhost:8080/api/auth/login
# Expected: 400 Bad Request
```

### Rule 900020 — Dotfile / hidden path

```bash
curl -si http://localhost:8080/api/.env
# Expected: 403 Forbidden

curl -si http://localhost:8080/api/.git/HEAD
# Expected: 403 Forbidden
```

### Rule 900021 — Dangerous file extension in URI

```bash
curl -si http://localhost:8080/api/upload.php
# Expected: 403 Forbidden

curl -si "http://localhost:8080/api/run.sh"
# Expected: 403 Forbidden
```

### Rule 900030 — Path traversal

```bash
curl -si "http://localhost:8080/api/core/users?file=../../etc/passwd"
# Expected: 400 Bad Request

curl -si "http://localhost:8080/api/core/images?path=..%2F..%2Fetc%2Fshadow"
# Expected: 400 Bad Request
```

### Rule 900100 — SQL injection: UNION SELECT

```bash
curl -si "http://localhost:8080/api/core/users?id=1+UNION+SELECT+1,2,3--"
# Expected: 400 Bad Request

curl -si "http://localhost:8080/api/core/users?q=foo+union+select+username,password+from+users"
# Expected: 400 Bad Request
```

### Rule 900101 — SQL injection: DML / DDL

```bash
curl -si "http://localhost:8080/api/core/users?q=1;DROP+TABLE+users"
# Expected: 400 Bad Request

curl -si "http://localhost:8080/api/core/users?q=INSERT+INTO+users+VALUES(1,'hacked')"
# Expected: 400 Bad Request
```

### Rule 900102 — SQL injection: comments and functions

```bash
curl -si "http://localhost:8080/api/core/users?id=1--"
# Expected: 400 Bad Request

curl -si "http://localhost:8080/api/core/users?id=1;exec(xp_cmdshell('whoami'))"
# Expected: 400 Bad Request
```

### Rule 900200 — XSS: script tag

```bash
curl -si "http://localhost:8080/api/core/users?name=<script>alert(1)</script>"
# Expected: 400 Bad Request

curl -si "http://localhost:8080/api/core/users?bio=%3Cscript%3Ealert(1)%3C/script%3E"
# Expected: 400 Bad Request
```

### Rule 900201 — XSS: javascript: URI

```bash
curl -si "http://localhost:8080/api/core/users?url=javascript:alert(document.cookie)"
# Expected: 400 Bad Request
```

### Rule 900202 — XSS: event handler attributes

```bash
curl -si "http://localhost:8080/api/core/users?img=<img+onerror=alert(1)>"
# Expected: 400 Bad Request

curl -si "http://localhost:8080/api/core/users?tag=onload=steal()"
# Expected: 400 Bad Request
```

### Rule 900300 — Command injection

```bash

# Expected: 400 Bad Request

curl -si "http://localhost:8080/api/core/users?cmd=hello|whoami"
# Expected: 400 Bad Request
```

### Rule 900301 — Null byte injection

```bash
curl -si "http://localhost:8080/api/core/users?file=image.png%00.php"
# Expected: 400 Bad Request
```

---

## Reading the audit log

All blocked requests are written to the ModSecurity audit log inside the nginx container:

```bash
# Tail the audit log live
docker exec nginx-dev tail -f /var/log/modsecurity/audit.log

# Show last 50 lines
docker exec nginx-dev tail -50 /var/log/modsecurity/audit.log
```

Each entry contains the matched rule ID (`id`), the message (`msg`), the URI, and the full
request headers and parameters. Use this to diagnose false positives.

## Diagnosing false positives

If a legitimate API request is being blocked:

1. Check the audit log for the matching rule ID.
2. Switch to `DetectionOnly` mode, rebuild, and repeat the request — the log will still show
  what *would have* been blocked without actually blocking it.
3. Either adjust the offending rule's regex (keep IDs above 900100 to avoid gaps) or add a
  `SecRuleRemoveById <id>` exception in `modsecurity.conf` with a comment explaining why.

## Checking nginx config syntax

```bash
docker exec nginx-dev nginx -t
```

A successful output looks like:

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

