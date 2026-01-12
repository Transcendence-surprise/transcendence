# Backend Development Documentation

## Usage

###
Start dev DB, run migrations, start NestJS dev
```bash
make dev-back
```


### Backend Health Check

After starting backend run server health check:
```bash
curl -i http://localhost:3000/api/health # should retun 200
```
### Backend run all tests
**ALWAYS** test all endpoits before merging a branch:
```bash
cd backend
npm run test:e2e
```

Optional (mostly no needed):
- start dev DB + run migrations only

```bash
make dev-migrate
```

- start dev DB only
```bash
make dev-db
```

### Clean after use
After using backend -  check and stop port 3000:
```bash
ss -ltnp | grep 3000
```
```bash
kill <pid>
```