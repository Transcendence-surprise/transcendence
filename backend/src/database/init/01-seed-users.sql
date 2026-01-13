-- Dev DB bootstrap: create users table (if needed) and insert a couple of test users.
-- Note: Postgres runs these init scripts only on FIRST init of the data volume.

CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(32) UNIQUE,
  "email" VARCHAR(32) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

INSERT INTO users (username, email, password)
VALUES ('user1', 'user1@example.com', 'password1337'), ('user2', 'user2@example.com', 'password42')
ON CONFLICT DO NOTHING;