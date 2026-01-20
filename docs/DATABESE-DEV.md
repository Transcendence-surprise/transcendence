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

Check the table:
```bash
 docker exec -i postgres_dev psql -U transcendence -d transcendence -c "SELECT * FROM users;"
 ```
| Column     | Type         | Constraints                               | Description                     |
|------------|--------------|-------------------------------------------|---------------------------------|
| id         | SERIAL       | PRIMARY KEY                               | Unique user identifier          |
| username   | VARCHAR(32)  | UNIQUE (non-null only)                    | Public username                 |
| email      | VARCHAR(254) | UNIQUE (non-null only), NULLABLE          | User email address              |
| password   | VARCHAR(255) | NULLABLE                                  | Hashed user password            |
| user_type  | VARCHAR(16)  | NOT NULL, DEFAULT 'registered'            | registered \| visitor           |
| created_at | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                   | Account creation timestamp      |
| updated_at | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                   | Last update timestamp           |
Notes:
- Visitors require email/password NULL.
- Registered users require email/password NOT NULL.
- Indexes: users_pkey, users_email_unique_not_null, users_username_key.

#### Table "games"

Check the table: 
```bash
 docker exec -i postgres_dev psql -U transcendence -d transcendence -c "SELECT * FROM games;"
 ```
| Column          | Type         | Constraints                                  | Description                     |
|-----------------|--------------|----------------------------------------------|---------------------------------|
| id              | SERIAL       | PRIMARY KEY                                  | Unique game identifier          |
| type            | VARCHAR(8)   | CHECK IN ('SINGLE','MULTI')                  | Game type                       |
| num_collectables| INTEGER      | NOT NULL                                     | Collectibles per game           |
| num_players     | INTEGER      | NOT NULL                                     | Number of players               |
| level           | SMALLINT     | CHECK IN (1, 2)                              | Level id                        |
| phase           | VARCHAR(8)   | CHECK IN ('LOBBY','PLAY','END')              | Game phase                      |
| board_size      | INTEGER      | NOT NULL                                     | Board size                      |
| host_user_id    | INTEGER      | FK → users(id)                               | Host user id                    |
| winner_user_id  | INTEGER      | FK → users(id), NULLABLE                     | Winner user id                  |
| started_at      | TIMESTAMPTZ  | NULLABLE                                     | Game start time                 |
| ended_at        | TIMESTAMPTZ  | NULLABLE                                     | Game end time                   |
| created_at      | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                      | Game creation time              |
| updated_at      | TIMESTAMPTZ  | NOT NULL, DEFAULT now()                      | Last update time                |

Notes:
- Player membership is stored in `game_players`.
- Indexes: games_pkey, games_host_user_id_idx, games_phase_idx, games_winner_user_id_idx.

#### Table "game_players"

Check the table:
```bash
 docker exec -i postgres_dev psql -U transcendence -d transcendence -c "SELECT * FROM game_players;"
```
| Column    | Type        | Constraints                                      | Description                     |
|-----------|-------------|--------------------------------------------------|---------------------------------|
| id        | SERIAL      | PRIMARY KEY                                      | Unique row identifier           |
| game_id   | INTEGER     | FK → games(id), NOT NULL                         | Game identifier                 |
| user_id   | INTEGER     | FK → users(id), NOT NULL                         | User identifier                 |
| joined_at | TIMESTAMPTZ | NOT NULL, DEFAULT now()                          | When user joined the game       |

Notes:
- Unique (game_id, user_id) ensures no duplicate players per game.
- Indexes: game_players_pkey, game_players_game_id_idx, game_players_game_user_unique, game_players_user_id_idx.

