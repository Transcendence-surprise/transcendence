# API Documentation

Swagger:
```bash
http://localhost/api/docs
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