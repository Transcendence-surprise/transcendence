# ModSecurity WAF — Guide

ModSecurity v3 is a Web Application Firewall (WAF) running as a dynamic nginx module. It sits in front of all `/api/*` traffic and inspects every request before it reaches any backend service. This document explains what it does, how to read its logs, how to write rules, and how to test it.

---

## What ModSecurity does

A WAF inspects raw HTTP requests (and optionally responses) against a set of rules before forwarding them. When a rule matches, ModSecurity can:

- **Log** the request (for monitoring without blocking)
- **Block** the request with a 403 response (before it ever reaches the backend)
- **Transform** the request (sanitize values, strip headers)

ModSecurity is not a replacement for input validation in the backend — it is a separate layer of defence. If an attacker finds a way to bypass the WAF, backend validation still protects the application. Both layers together are much harder to defeat than either alone.

### Categories of attack it can catch

| Category | Example payload |
|---|---|
| SQL injection | `?id=1 OR 1=1--`, `UNION SELECT`, `'; DROP TABLE` |
| Cross-site scripting (XSS) | `<script>alert(1)</script>`, `onerror=`, `javascript:` |
| Path / directory traversal | `/../etc/passwd`, `..%2F..%2F` |
| Command injection | `; cat /etc/passwd`, `| id`, `` `whoami` `` |
| Remote file inclusion | `?file=http://evil.com/shell.php` |
| HTTP protocol abuse | Oversized headers, malformed methods, request smuggling |
| Sensitive file probing | Requests for `.env`, `.git/config`, `wp-admin`, `phpinfo.php` |

---

## Architecture

```
Client
  │
  ▼
Nginx (port 80 → redirect, port 443 prod / 8080 dev)
  ├── /            → frontend static files   (no WAF)
  ├── /api/*       → gateway:3002            ← ModSecurity runs here
  └── /socket.io/* → game:3003              (no WAF — WebSocket upgrade)
```

ModSecurity only runs on `/api/*`. The frontend is static files — there is nothing to attack there. WebSocket traffic is excluded because ModSecurity does not support the WebSocket upgrade protocol.

---

## Current state

ModSecurity is **enabled and active in production** (`SecRuleEngine On`). It inspects every `/api/*` request and writes audit entries for rule matches.

The current ruleset is minimal — one rule logs requests missing a `Content-Type` header (pass/log only, no blocking). To actually block attacks you need to either write custom block rules or integrate the OWASP Core Rule Set. See the sections below.

In dev, the `modsecurity on` directive is commented out in `nginx-dev.conf`, so ModSecurity is completely inactive locally.

---

## File layout

```
nginx/
├── Dockerfile                     multi-stage build — compiles ModSecurity + nginx module
├── nginx-entrypoint.sh            selects nginx-prod.conf or nginx-dev.conf on startup
├── conf/
│   ├── nginx-prod.conf            modsecurity on + rules file loaded for /api/* (prod)
│   └── nginx-dev.conf             modsecurity directives commented out (dev)
└── modsecurity/
    ├── main.conf                  master include — lists all files to load in order
    └── modsecurity.conf           engine mode, body inspection, audit log settings, rules
```

---

## Enforcement modes

`SecRuleEngine` in `nginx/modsecurity/modsecurity.conf` controls behaviour:

| Mode | Directive | Effect |
|---|---|---|
| **Blocking** (prod) | `SecRuleEngine On` | Matching requests get a 403 — never reach the backend |
| **Detection only** | `SecRuleEngine DetectionOnly` | Violations are logged but all requests pass through |
| **Off** | `SecRuleEngine Off` | ModSecurity does nothing |

To switch modes, edit `modsecurity.conf` and restart nginx — no rebuild needed:

```bash
docker compose restart nginx
```

Use `DetectionOnly` when you first add new rules so you can verify the audit log before enabling blocking.

---

## Audit log

ModSecurity writes to `/var/log/modsecurity/audit.log` inside the nginx container.

```bash
# Stream live
docker exec nginx tail -f /var/log/modsecurity/audit.log

# Pretty-print last entry
docker exec nginx tail -1 /var/log/modsecurity/audit.log | jq .

# Show only blocked requests (action = denied)
docker exec nginx grep '"action":"denied"' /var/log/modsecurity/audit.log | jq .

# Show URI + rule message for every entry
docker exec nginx cat /var/log/modsecurity/audit.log \
  | jq '{uri: .request.uri, rule: .messages[].message}'
```

Key fields in each log entry:

| Field | Meaning |
|---|---|
| `request.uri` | Path that triggered the rule |
| `messages[].ruleId` | Rule ID that fired |
| `messages[].message` | Human-readable description |
| `response.status` | HTTP status returned to the client |
| `transaction.anomalyScoreIn` | Cumulative score (relevant when using CRS) |

---

## Writing rules

Rules go in `nginx/modsecurity/modsecurity.conf` (or separate files included from `main.conf`).

### Rule anatomy

```
SecRule TARGET OPERATOR "id:NNN, phase:N, ACTION, msg:'description'"
```

- **TARGET** — what to inspect: `REQUEST_URI`, `ARGS`, `REQUEST_HEADERS`, `REQUEST_BODY`, `REMOTE_ADDR`, etc.
- **OPERATOR** — how to match: `@contains`, `@rx` (regex), `@beginsWith`, `@ipMatch`, etc.
- **Phase** — when to evaluate: `1` = request headers received, `2` = request body received, `3` = response headers, `4` = response body
- **ACTION** — `deny,status:403` to block, `pass,log` to log only

### Example rules

```apache
# Block SQL injection patterns in query string
SecRule ARGS "@rx (?i)(union.+select|insert.+into|drop.+table|--|;--)" \
  "id:100001, phase:2, deny, status:403, log, msg:'SQL injection attempt'"

# Block XSS in any argument
SecRule ARGS "@rx (?i)(<script|javascript:|onerror\s*=|onload\s*=)" \
  "id:100002, phase:2, deny, status:403, log, msg:'XSS attempt'"

# Block path traversal in URI
SecRule REQUEST_URI "@rx (\.\./|\.\.\\\\)" \
  "id:100003, phase:1, deny, status:403, log, msg:'Path traversal attempt'"

# Block requests to sensitive paths
SecRule REQUEST_URI "@rx (?i)(\.env|\.git|phpinfo|wp-admin|\.ssh)" \
  "id:100004, phase:1, deny, status:403, log, msg:'Sensitive path probe'"

# Block suspicious User-Agent strings (scanners)
SecRule REQUEST_HEADERS:User-Agent "@rx (?i)(sqlmap|nikto|masscan|nmap|dirbuster|gobuster)" \
  "id:100005, phase:1, deny, status:403, log, msg:'Scanner detected'"

# Rate-limit: flag when IP hits a specific pattern repeatedly (log only)
SecRule REMOTE_ADDR "@ipMatch 0.0.0.0/0" \
  "id:100006, phase:1, pass, log, msg:'Catch-all logging rule'"
```

### Adding rules without a rebuild

Edit `modsecurity.conf`, then restart nginx:

```bash
docker compose restart nginx
```

A rebuild is only needed when changing the `Dockerfile` or adding new files that are `COPY`'d into the image.

---

## Manual testing

All tests below assume the prod environment (`https://valinor.ink`). For local dev, replace the URL with `http://localhost:8080` and note that ModSecurity is inactive in dev — requests will pass through and nothing will be logged.

### Confirm ModSecurity is loaded

```bash
# nginx -V output should list --add-dynamic-module=.../ModSecurity-nginx
docker exec nginx nginx -V 2>&1 | grep -i modsecurity
```

### Check the module is active in the running config

```bash
docker exec nginx nginx -T 2>&1 | grep modsecurity
# Expected: modsecurity on; and modsecurity_rules_file ...
```

### Activate the built-in test rule

Uncomment the test rule in `modsecurity.conf`:

```apache
SecRule REQUEST_URI "@contains /waf-test" \
  "id:900002, phase:1, deny, status:403, msg:'WAF test block'"
```

Then restart and confirm it blocks:

```bash
docker compose restart nginx
curl -i 'https://valinor.ink/api/waf-test'
# Expected: HTTP/1.1 403 Forbidden
```

Re-comment the rule and restart again when done.

---

### SQL injection

```bash
# Classic OR-based injection
curl -i 'https://valinor.ink/api/core/users?id=1+OR+1=1--'

# UNION-based
curl -i 'https://valinor.ink/api/core/users?id=1+UNION+SELECT+null,null,null--'

# Stacked query
curl -i "https://valinor.ink/api/core/users?id=1;DROP+TABLE+users--"

# Blind injection via boolean
curl -i "https://valinor.ink/api/core/users?id=1+AND+1=1"
curl -i "https://valinor.ink/api/core/users?id=1+AND+1=2"

# In POST body
curl -i -X POST https://valinor.ink/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin'\''--","password":"anything"}'
```

---

### Cross-site scripting (XSS)

```bash
# Script tag in query param
curl -i 'https://valinor.ink/api/core/users?search=<script>alert(1)</script>'

# URL-encoded
curl -i 'https://valinor.ink/api/core/users?search=%3Cscript%3Ealert%281%29%3C%2Fscript%3E'

# Event handler injection
curl -i 'https://valinor.ink/api/core/users?name=<img+src=x+onerror=alert(1)>'

# SVG-based
curl -i 'https://valinor.ink/api/core/users?bio=<svg/onload=alert(1)>'

# In POST body
curl -i -X POST https://valinor.ink/api/core/users \
  -H 'Content-Type: application/json' \
  -d '{"username":"<script>document.cookie</script>"}'
```

---

### Path and directory traversal

```bash
# Basic traversal
curl -i 'https://valinor.ink/api/../etc/passwd'

# URL-encoded dot-dot
curl -i 'https://valinor.ink/api/%2e%2e%2fetc%2fpasswd'

# Double-encoded
curl -i 'https://valinor.ink/api/%252e%252e%252fetc%252fpasswd'

# Windows-style
curl -i 'https://valinor.ink/api/..%5C..%5Cetc%5Cpasswd'

# Null byte injection
curl -i $'https://valinor.ink/api/file?name=../../etc/passwd\x00.jpg'
```

---

### Command injection

```bash
# Semicolon injection
curl -i 'https://valinor.ink/api/core/users?name=foo;id'

# Pipe injection
curl -i 'https://valinor.ink/api/core/users?name=foo|cat+/etc/passwd'

# Backtick injection
curl -i 'https://valinor.ink/api/core/users?name=`whoami`'

# $() subshell
curl -i 'https://valinor.ink/api/core/users?name=$(cat+/etc/passwd)'

# In JSON body
curl -i -X POST https://valinor.ink/api/core/users \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin; cat /etc/passwd"}'
```

---

### Sensitive file probing

```bash
# Common misconfig files
curl -i 'https://valinor.ink/api/.env'
curl -i 'https://valinor.ink/api/.git/config'
curl -i 'https://valinor.ink/api/.ssh/id_rsa'

# PHP / CMS fingerprinting
curl -i 'https://valinor.ink/api/phpinfo.php'
curl -i 'https://valinor.ink/api/wp-admin/'
curl -i 'https://valinor.ink/api/admin.php'

# Backup files
curl -i 'https://valinor.ink/api/backup.sql'
curl -i 'https://valinor.ink/api/dump.zip'
curl -i 'https://valinor.ink/api/config.bak'
```

---

### Scanner / tool fingerprint detection

```bash
# sqlmap User-Agent
curl -i 'https://valinor.ink/api/core/users' \
  -H 'User-Agent: sqlmap/1.7.8'

# Nikto
curl -i 'https://valinor.ink/api/core/users' \
  -H 'User-Agent: Nikto/2.1.6'

# Gobuster
curl -i 'https://valinor.ink/api/core/users' \
  -H 'User-Agent: gobuster/3.6'
```

---

### HTTP protocol abuse

```bash
# Oversized header
curl -i 'https://valinor.ink/api/core/users' \
  -H "X-Custom: $(python3 -c 'print("A"*8192)')"

# Invalid HTTP method
curl -i -X FAKEMETHOD 'https://valinor.ink/api/core/users'

# Host header injection
curl -i 'https://valinor.ink/api/core/users' \
  -H 'Host: evil.com'
```

---

## Extending with OWASP CRS

The OWASP Core Rule Set (CRS) is a large, maintained ruleset covering the attacks above and many more. It provides anomaly scoring — each matched rule adds points to a request's score, and the request is blocked when the total exceeds a threshold. This reduces false positives compared to hard-blocking on individual rules.

To integrate CRS:

1. Download CRS in the Dockerfile builder stage:
   ```dockerfile
   RUN wget -O /opt/crs.tar.gz \
       https://github.com/coreruleset/coreruleset/archive/refs/tags/v4.3.0.tar.gz \
     && tar -xzf /opt/crs.tar.gz -C /opt \
     && mv /opt/coreruleset-4.3.0 /opt/coreruleset \
     && cp /opt/coreruleset/crs-setup.conf.example /opt/coreruleset/crs-setup.conf
   ```
2. Copy CRS into the final image:
   ```dockerfile
   COPY --from=builder /opt/coreruleset /etc/nginx/modsecurity/crs
   ```
3. Update `main.conf` to include CRS:
   ```apache
   Include /etc/nginx/modsecurity/modsecurity.conf
   Include /etc/nginx/modsecurity/crs/crs-setup.conf
   Include /etc/nginx/modsecurity/crs/rules/*.conf
   ```
4. Rebuild nginx: `make build-nginx`

Start with paranoia level 1 (`tx.paranoia_level=1`) and `DetectionOnly` mode — review the audit log before switching to blocking to avoid false positives.
