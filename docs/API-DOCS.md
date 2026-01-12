# API Documentation

## Users

### GET

1. Get all users from db
```bash
curl -i http://localhost:3000/api/users 
```

2. Get user by login   
```bash
curl -i http://localhost:3000/api/users/<login>
```

### DELETE

1. Delete user by login
```bash
curl -i -X DELETE http://localhost:3000/api/users/<login>
```