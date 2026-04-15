# ModSecurity WAF — Developer Guide

ModSecurity v3 with the OWASP Core Rule Set (CRS) sits in front of all `/api/*` traffic via the nginx container. This document covers day-to-day development, log reading, tuning, and adding exclusions.

---

## Architecture overview

```
Client
  │
  ▼
Nginx (port 80/8080 dev, 443 prod)
  ├── /         → frontend (no WAF)
  ├── /api/*    → gateway:3002   ← ModSecurity enforced here
  └── /socket.io/* → game:3003  ← no WAF (WebSocket upgrade)
```

ModSecurity runs as a dynamic nginx module (`ngx_http_modsecurity_module.so`) compiled against nginx 1.27.3. Rules load from `/etc/nginx/modsecurity/`.

---

## File layout

```
nginx/
├── Dockerfile                         multi-stage build (ModSecurity + CRS)
├── nginx-entrypoint.sh                sets SecRuleEngine mode, then starts nginx
├── conf/
│   ├── nginx-dev.conf                 modsecurity on (DetectionOnly in dev)
│   └── nginx-prod.conf                modsecurity on (blocking in prod)
└── modsecurity/
    ├── main.conf                      master include file (load order)
    ├── modsecurity.conf               engine settings, body limits, audit log
    ├── crs-config.conf                paranoia level, thresholds, allowed methods
    ├── custom-exclusions.conf         app-specific false-positive suppressions
    └── crs/
        ├── crs-setup.conf             CRS defaults (copied from .example at build)
        └── rules/                     OWASP CRS v4.3.0 rule files + data files
```

---

## Enforcement modes

The entrypoint (`nginx-entrypoint.sh`) patches `SecRuleEngine` based on `NODE_ENV`:

| `NODE_ENV`     | `SecRuleEngine` | Effect                              |
|----------------|-----------------|-------------------------------------|
| `production`   | `On`            | Matching requests blocked with 403  |
| anything else  | `DetectionOnly` | Violations logged, never blocked    |

Dev mode is always `DetectionOnly` — you cannot accidentally block yourself locally.

---

## Reading the audit log

The audit log is at `/var/log/modsecurity/audit.log` inside the nginx container, in JSON format.

```bash
# Stream live (dev or prod)
docker exec nginx tail -f /var/log/modsecurity/audit.log | jq .

# Show only blocked requests (prod)
docker exec nginx grep '"action":"denied"' /var/log/modsecurity/audit.log | jq .

# Show the rule ID and message for each entry
docker exec nginx cat /var/log/modsecurity/audit.log \
  | jq '{uri: .request.uri, score: .messages[].message}'
```

Each entry includes:
- `request.uri` — the path that triggered the rule
- `messages[].ruleId` — the CRS rule number
- `messages[].message` — human-readable explanation
- `response.status` — HTTP status sent to the client
- `transaction.anomalyScoreIn` — cumulative inbound score

---

## Tuning: adjusting the paranoia level

Paranoia level is set in `nginx/modsecurity/crs-config.conf`:

```
setvar:tx.paranoia_level=2
```

| Level | Coverage                      | False positive risk |
|-------|-------------------------------|---------------------|
| 1     | Critical attacks only         | Very low            |
| 2     | Common injection patterns     | Low (recommended)   |
| 3     | Strict, extended checks       | Moderate            |
| 4     | Very strict                   | High                |

After changing the file, rebuild the nginx container:

```bash
make build-nginx
```

---

## Tuning: adjusting anomaly score thresholds

Each matching rule adds to a request's anomaly score. The request is blocked when the score reaches the threshold. Settings are in `crs-config.conf`:

```
setvar:tx.inbound_anomaly_score_threshold=5
setvar:tx.outbound_anomaly_score_threshold=4
```

Lower value = block more aggressively. A single high-severity rule hit (e.g. SQL injection) scores 5 on its own, so the default threshold of 5 blocks it immediately. Multiple lower-severity hits can also accumulate to reach the threshold.

---

## Adding false-positive exclusions

When a legitimate request is blocked, find the rule ID from the audit log and add an exclusion to `nginx/modsecurity/custom-exclusions.conf`.

### Exclude a specific argument from a tag group

```
SecRule REQUEST_URI "@beginsWith /api/some/path" \
  "id:10003, \
   phase:1, \
   nolog, \
   pass, \
   t:none, \
   ctl:ruleRemoveTargetByTag=attack-sqli;ARGS:my_param"
```

### Disable a specific rule for an entire path

```
SecRule REQUEST_URI "@beginsWith /api/some/path" \
  "id:10004, \
   phase:1, \
   nolog, \
   pass, \
   t:none, \
   ctl:ruleRemoveById=942100"
```

### Disable a rule globally (last resort)

```
SecRuleRemoveById 942100
```

After editing `custom-exclusions.conf`, restart nginx — no full rebuild needed:

```bash
docker compose restart nginx
```

---

## Enabling response body inspection

Response scanning is off by default (`SecResponseBodyAccess Off`) to avoid overhead. To detect data leakage (SQL errors, stack traces, etc.) in responses, enable it in `modsecurity.conf`:

```
SecResponseBodyAccess On
SecResponseBodyLimit 524288
SecResponseBodyLimitAction ProcessPartial
```

Then rebuild:

```bash
make build-nginx
```

---

## Enabling debug logging

When a rule fires unexpectedly, raise the debug level in `modsecurity.conf`:

```
SecDebugLogLevel 3   # 0=off, 3=matches, 5=full trace
```

Then restart nginx and check the debug log:

```bash
docker compose restart nginx
docker exec nginx tail -f /var/log/modsecurity/debug.log
```

Set it back to `0` before committing.

---

## Rebuilding the nginx container

The ModSecurity library and CRS are compiled/downloaded at build time. A full rebuild is required when:

- Changing `Dockerfile` (e.g. upgrading CRS version)
- Adding new files to `modsecurity/` that are `COPY`'d in
- Changing nginx version

```bash
make build-nginx
```

A restart (no rebuild) is sufficient when:

- Editing `modsecurity.conf`, `crs-config.conf`, or `custom-exclusions.conf`
- Editing `nginx-prod.conf` or `nginx-dev.conf`

```bash
docker compose restart nginx
```

---

## Testing the WAF

### Confirm blocking is active (prod)

```bash
# Should return 403
curl -i 'https://valinor.ink/api/core/users?id=1%20OR%201=1'
```

### Confirm detection-only in dev

```bash
# Returns the real response (not blocked), but audit log records the hit
curl -i 'http://localhost:8080/api/core/users?id=1%20OR%201=1'
docker exec nginx tail -1 /var/log/modsecurity/audit.log | jq .
```

### Test XSS detection

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"<script>alert(1)</script>","password":"test"}'
```

### Test path traversal

```bash
curl -i 'http://localhost:8080/api/../etc/passwd'
```

---

## Upgrading the OWASP CRS

The CRS version is pinned in `nginx/Dockerfile`:

```dockerfile
RUN wget -O /opt/crs.tar.gz \
    https://github.com/coreruleset/coreruleset/archive/refs/tags/v4.3.0.tar.gz \
  && tar -xzf /opt/crs.tar.gz -C /opt \
  && mv /opt/coreruleset-4.3.0 /opt/coreruleset
```

To upgrade: change the tag and directory name, then run `make build-nginx`. Check the CRS changelog for new variables or rule ID shifts that may affect `crs-config.conf` or `custom-exclusions.conf`.
