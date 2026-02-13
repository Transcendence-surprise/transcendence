-- Schema-only bootstrap for Postgres.
-- Note: Postgres runs these init scripts only on FIRST init of the data volume.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_type') THEN
    CREATE TYPE game_type AS ENUM ('SINGLE', 'MULTI');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_phase') THEN
    CREATE TYPE game_phase AS ENUM ('LOBBY', 'PLAY', 'END');
  END IF;
END$$;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(32) UNIQUE,
  "email" VARCHAR(254),
  "password" VARCHAR(255),
  "roles" text[] NOT NULL DEFAULT ARRAY['user']::text[],
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique_not_null"
ON "users" ("email")
WHERE "email" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "hash" VARCHAR(255) NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "expires_at" timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_hash_unique"
ON "api_keys" ("hash");

CREATE TABLE IF NOT EXISTS "games" (
  "id" SERIAL PRIMARY KEY,
  "type" game_type NOT NULL,
  "num_collectables" INTEGER NOT NULL,
  "num_players" INTEGER NOT NULL,
  "level" SMALLINT NOT NULL,
  "phase" game_phase NOT NULL,
  "board_size" INTEGER NOT NULL,
  "host_user_id" INTEGER NOT NULL,
  "winner_user_id" INTEGER,
  "started_at" timestamptz,
  "ended_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "games_phase_idx" ON "games" ("phase");
CREATE INDEX IF NOT EXISTS "games_type_idx" ON "games" ("type");
CREATE INDEX IF NOT EXISTS "games_host_user_idx" ON "games" ("host_user_id");
CREATE INDEX IF NOT EXISTS "games_ended_at_idx" ON "games" ("ended_at");

CREATE TABLE IF NOT EXISTS "game_players" (
  "id" SERIAL PRIMARY KEY,
  "game_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "joined_at" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "game_players"
ADD CONSTRAINT "game_players_game_fk"
FOREIGN KEY ("game_id") REFERENCES "games" ("id")
ON DELETE CASCADE;

ALTER TABLE "game_players"
ADD CONSTRAINT "game_players_user_fk"
FOREIGN KEY ("user_id") REFERENCES "users" ("id")
ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "game_players_game_user_unique"
ON "game_players" ("game_id", "user_id");
CREATE INDEX IF NOT EXISTS "game_players_game_id_idx" ON "game_players" ("game_id");
CREATE INDEX IF NOT EXISTS "game_players_user_id_idx" ON "game_players" ("user_id");
