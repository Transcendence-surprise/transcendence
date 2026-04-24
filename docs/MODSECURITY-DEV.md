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

The stack must be running with ModSecurity enabled (`SecRuleEngine On` in `modsecurity.conf`,
`modsecurity on` uncommented in `nginx-prod.conf`, then `make build-nginx`).

The following endpoints return `200 OK` without authentication and accept query parameters —
confirmed against the running stack:

| Endpoint | Normal response |
|----------|----------------|
| `GET /api/users` | 200 OK |
| `GET /api/matches` | 200 OK |
| `GET /api/leaderboard/all-time` | 200 OK |
| `GET /api/badges` | 200 OK |
| `GET /api/images` | 200 OK |

Tests below use `/api/users`. Without WAF the phase 2 payloads all return **200 OK** (the
attack reaches the backend). With WAF enabled they must return the listed status.

### Confirm WAF is active

```bash
curl -si http://localhost:8080/api/users | head -1
# Expected: HTTP/1.1 200 OK
```

### Rule 900010 — Missing Host header

```bash
curl -si --header 'Host:' http://localhost:8080/api/users | head -1
# Expected: 400 Bad Request
```

### Rule 900011 — Disallowed HTTP method

```bash
curl -si -X TRACE http://localhost:8080/api/users | head -1
# Expected: 405 Method Not Allowed

curl -si -X FOOBAR http://localhost:8080/api/users | head -1
# Expected: 405 Method Not Allowed
```

### Rule 900012 — Non-numeric Content-Length

```bash
curl -si -X POST \
  -H 'Content-Length: 10; drop table users' \
  -H 'Content-Type: application/json' \
  -d '{}' \
  http://localhost:8080/api/users | head -1
# Expected: 400 Bad Request
```

### Rule 900020 — Dotfile / hidden path

```bash
curl -si http://localhost:8080/api/.env | head -1
# Expected: 403 Forbidden

curl -si http://localhost:8080/api/.git/HEAD | head -1
# Expected: 403 Forbidden
```

### Rule 900021 — Dangerous file extension in URI

```bash
curl -si http://localhost:8080/api/users.php | head -1
# Expected: 403 Forbidden

curl -si http://localhost:8080/api/users.sh | head -1
# Expected: 403 Forbidden
```

### Rule 900030 — Path traversal

```bash
curl -si "http://localhost:8080/api/users?file=../../etc/passwd" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)

curl -si "http://localhost:8080/api/users?path=..%2F..%2Fetc%2Fshadow" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)
```

### Rule 900100 — SQL injection: UNION SELECT

```bash
curl -si "http://localhost:8080/api/users?id=1+UNION+SELECT+username,password+FROM+users--" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)

curl -si "http://localhost:8080/api/users?q=foo+union+select+1,2,3" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)
```

### Rule 900101 — SQL injection: DML / DDL

```bash
curl -si "http://localhost:8080/api/users?q=1;DROP+TABLE+users" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)

curl -si "http://localhost:8080/api/users?q=INSERT+INTO+users+VALUES(1,'hacked')" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)
```

### Rule 900102 — SQL injection: comments and functions

```bash
curl -si "http://localhost:8080/api/users?id=1--" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)

curl -si "http://localhost:8080/api/users?id=1;exec(xp_cmdshell('whoami'))" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)
```

### Rule 900200 — XSS: script tag

```bash
curl -si "http://localhost:8080/api/users?name=<script>alert(1)</script>" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)

curl -si "http://localhost:8080/api/users?name=%3Cscript%3Ealert(1)%3C/script%3E" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)
```

### Rule 900201 — XSS: javascript: URI

```bash
curl -si "http://localhost:8080/api/users?url=javascript:alert(document.cookie)" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)
```

### Rule 900202 — XSS: event handler attributes

```bash
curl -si "http://localhost:8080/api/users?bio=test+onerror=steal()" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)

curl -si "http://localhost:8080/api/users?tag=onload=exfiltrate()" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)
```

### Rule 900300 — Command injection

```bash
curl -si "http://localhost:8080/api/users?file=x;cat+/etc/passwd" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)

curl -si "http://localhost:8080/api/users?cmd=hello|whoami" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)
```

### Rule 900301 — Null byte injection

```bash
curl -si "http://localhost:8080/api/users?file=image.png%00.php" | head -1
# Expected: 400 Bad Request  (without WAF: 200 OK)
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

