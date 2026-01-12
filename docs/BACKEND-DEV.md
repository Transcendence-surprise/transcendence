# Backend Development Documentation

## Usage

**Step 1:** If not started - Start dev DB, run migrations, start NestJS dev
```bash
make dev-back
```

**Step 2:** After starting backend run server health check:
```bash
curl -i http://localhost:3000/api/health # should retun 200
```

### Backend run all tests
**ALWAYS** test all endpoits before merging a branch:
```bash
npm run test:e2e
```

Optional (mostly no needed):
**NOTE:** the command is not tested yet!
- start dev DB + run migrations only
```bash
make dev-migrate
```

- start dev DB only
**NOTE:** the command is not tested yet!
```bash
make dev-db
```


