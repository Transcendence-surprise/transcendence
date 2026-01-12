-- Dev DB bootstrap: create users table (if needed) and insert a couple of test users.
-- Note: Postgres runs these init scripts only on FIRST init of the data volume.

CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "login" VARCHAR(32) NOT NULL UNIQUE,
  "email" VARCHAR(32) NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

INSERT INTO users (login, email)
VALUES ('user1', 'user1@example.com'), ('user2', 'user2@example.com')
ON CONFLICT DO NOTHING;