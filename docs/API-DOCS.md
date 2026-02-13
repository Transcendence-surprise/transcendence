# API Documentation

## Swagger Backend Documentation

```bash
http://localhost:8080/api/docs
```

### Login

Authenticate with username and password to receive a JWT access token.

**Endpoint:** `POST /api/auth/login`

**Example:**
```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"john_doe","password":"yourPassword"}'
```

### Using the JWT Token

Protected endpoints require the JWT token in the Authorization header:

```bash
curl -i http://localhost:8080/api/users/id/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
