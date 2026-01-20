# Database Communication Documentation

## Usage
**Step 1:** Health check
```bash
curl -i http://localhost/api/health # should retun 200
```
If it was not success - restart backend.

**Step 2:** Connect to database
```bash
docker exec -it postgres_dev psql -U transcendence -d transcendence
```

## Usful Commands
List all databases
```bash
\l
```

Connect to db transcendence
```bash
\c transcendence 
```

List database tables 
```bash
\dt
```

Inspect a specific table (for exmp `users`)
```bash
\d users 
```
```bash
SELECT * FROM users;
```

Exit
```bash
exit
```

## DB transcendence
### Tables:
#### Table "users"
| Column     | Type         | Constraints                               | Description                     |
|------------|--------------|-------------------------------------------|---------------------------------|
| id         | SERIAL       | PRIMARY KEY                               | Unique user identifier          |
| username   | VARCHAR(32)  | UNIQUE (non-null only)                    | Public username                 |
| email      | VARCHAR(32)  | UNIQUE (non-null only), NULLABLE          | User email address              |
| password   | VARCHAR(255) | NULLABLE                                  | Hashed user password            |
| user_type  | VARCHAR(16)  | NOT NULL, DEFAULT 'registered'            | registered \| visitor           |
| createdAt  | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                   | Account creation timestamp      |
| updatedAt  | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                   | Last update timestamp           |
Notes:
- Visitors require email/password NULL.
- Registered users require email/password NOT NULL.
Check stored date (not secure, only for dev stage)
