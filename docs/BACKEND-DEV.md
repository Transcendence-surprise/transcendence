# Backend Development Documentation

## Usage
**NOTE**: to start all services

### **Step 0:** Run once to install dependencies for tests
```bash
make dev-install
```
This also installs the shared DB entities and database package dependencies.

### **Step 1:** Build and start the development stack
```bash
make dev-build
```

### **Step 2:** Run once for db migration to create tables
```bash
make dev-migrate
```

**Auth-service:**
```bash
curl -i http://localhost/api/auth/docs # should return Swagger UI
```

## Tests
```bash
# only for dev stage (not secure)
docker exec -i postgres-dev psql -U transcendence -d transcendence -c "SELECT * FROM users;"
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
