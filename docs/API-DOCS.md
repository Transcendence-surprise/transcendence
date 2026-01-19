# API Documentation

## Swagger Documentation

### Backend API
```bash
http://localhost/api/docs
```

### Auth Service API
```bash
http://localhost:3001/api/auth/docs
```

## Authentication

### Login

Authenticate with username and password to receive a JWT access token.

**Endpoint:** `POST /api/auth/login`

**Example:**
```bash
curl -i -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"yourPassword"}'
```

### Using the JWT Token

Protected endpoints require the JWT token in the Authorization header:

```bash
curl -i http://localhost:3000/api/users/id/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Users

### GET

1. Get all users from db
```bash
curl -i http://localhost:3000/api/users
```

2. Get user by username
```bash
curl -i http://localhost:3000/api/users/<username>
```

### DELETE

1. Delete user by username
```bash
curl -i -X DELETE http://localhost:3000/api/users/<username>
```
