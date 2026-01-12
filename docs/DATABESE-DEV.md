# Database Communication Documentation

### Connect to database
```bash
docker exec -it postgres_dev psql -U transcendence -d transcendence
```

### List all databases
```bash
\l
```

### Connect to db transcendence
```bash
\c transcendence 
```

### List database tables 
```bash
\dt
```


### Inspect a specific table (for exmp `users`)
```bash
\d users 
```