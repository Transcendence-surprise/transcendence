# Backend Development Documentation

## Usage
**NOTE**: (DOCKER) to start all backend services at once run `Step 0`

### **Step 0:** Build dev backend + frontend
```bash
make dev-build
```

### **Step 0:** Run dev backend + nginx 
```bash
make dev
```

**NOTE:** (NOT-DOCKER) to start all backend services at once run `Step 0` or follow steps from `Step 1` to `Step 5`

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

**Step 5:** Start auth-service (in another terminal)
```bash
make dev-back-auth
```

**Auth-service:**
```bash
curl -i http://localhost:3001/api/auth/docs # should return Swagger UI
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
