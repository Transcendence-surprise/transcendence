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
Check stored date (not secure, only for dev stage)
```bash
SELECT * FROM users;
```

Exit
```bash
exit
```