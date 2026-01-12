## NOTE!
If you do not whant ot delete all db data from your local machine **DO NOT** run those commands
```bash
docker compose down -v # -v remove volumes
docker volume rm transcendence_db_data_dev 
docker volume prune # remove complitely all data
docker system prune --volumes # removes unused volumes
```

Connect to database:
```bash
docker exec -it postgres_dev psql -U transcendence -d transcendence

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