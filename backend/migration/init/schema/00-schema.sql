CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_type') THEN
    CREATE TYPE game_type AS ENUM ('SINGLE', 'MULTI');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_phase') THEN
    CREATE TYPE game_phase AS ENUM ('LOBBY', 'PLAY', 'END');
  END IF;
END$$;

