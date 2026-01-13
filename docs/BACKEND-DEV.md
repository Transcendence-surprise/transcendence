# Backend Development Documentation

## Usage
**NOTE:** to start all backend services at once run `Step 0` or follow steps from `Step 1` to `Step 4`

### **Step 0:** Start all backend serveces
```bash
make dev-back
```

### **Step 1:** Start dev DB
```bash
make dev-db
```

### **Step 1:** Start dev DB
```bash
make dev-db
```

### **Step 2:** Run migrations

```bash
make dev-migrate
```

### **Step 3 (Optional):** Add test users into db
```bash
make dev-seed
```

### **Step 4:** Start NestJS dev
```bash
make dev-back-serv
```

## Health check
After starting backend run server health check:
```bash
curl -i http://localhost:3000/api/health # should retun 200
```

## Tests
```bash
# only for dev stage (not secure)
docker exec -i postgres_dev psql -U transcendence -d transcendence -c "SELECT * FROM users;"
```

**ALWAYS** test all endpoits before merging a branch:
```bash
cd backend
npm run test:e2e
```

## Stop & Clean

Stop containers (keep volumes)
```bash
make dev-clean
```
Stop and remove dev DB volumes (full reset of dev DB)
```bash
make dev-fclean
```
Prune dangling images (full reset of dev stack)
```bash
make dev-prune
```

## Additional
Check is serever running
```bash
ss -ltnp | grep 3000
```
Stop server
```bash
kill <pid>
```