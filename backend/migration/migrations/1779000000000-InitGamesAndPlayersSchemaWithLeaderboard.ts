import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitGamesAndPlayersSchemaWithLeaderboard1779000000000 implements MigrationInterface {
  name = 'InitGamesAndPlayersSchemaWithLeaderboard1779000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---- Create enum types safely ----
    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_type') THEN
        CREATE TYPE "game_type" AS ENUM('SINGLE', 'MULTI');
      END IF;
    END $$;`);

    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_phase') THEN
        CREATE TYPE "game_phase" AS ENUM('LOBBY', 'PLAY', 'END');
      END IF;
    END $$;`);

    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'player_role') THEN
        CREATE TYPE "player_role" AS ENUM('PLAYER', 'SPECTATOR');
      END IF;
    END $$;`);

    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
        CREATE TYPE "user_type" AS ENUM('USER', 'GUEST', 'ADMIN');
      END IF;
    END $$;`);

    // ---- Create games table ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "games" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "type" "game_type" NOT NULL,
        "phase" "game_phase" NOT NULL,
        "host_user_id" varchar NOT NULL,
        "state" jsonb NOT NULL,
        "winner_user_id" varchar,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "ended_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_games_id" PRIMARY KEY ("id")
      )
    `);

    // ---- Indexes for games ----
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "games_phase_idx" ON "games" ("phase")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "games_type_idx" ON "games" ("type")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "games_host_user_idx" ON "games" ("host_user_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "games_winner_idx" ON "games" ("winner_user_id")`);

    // Partial index for leaderboard (only END + MULTI games)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "games_leaderboard_idx"
      ON "games" ("winner_user_id")
      WHERE phase = 'END' AND type = 'MULTI'
    `);

    // ---- Create game_players table ----
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "game_players" (
        "id" SERIAL NOT NULL,
        "game_id" uuid NOT NULL,
        "user_id" varchar NOT NULL,
        "role" "player_role" NOT NULL,
        "user_type" "user_type" NOT NULL,
        "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_game_players_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_game_players_game" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE
      )
    `);

    // Unique + indexes for game_players
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "game_players_game_user_unique" ON "game_players" ("game_id", "user_id")
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "game_players_game_idx" ON "game_players" ("game_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "game_players_user_idx" ON "game_players" ("user_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "game_players_user_idx"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "game_players_game_idx"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "game_players_game_user_unique"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "game_players"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "games_leaderboard_idx"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "games_winner_idx"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "games_host_user_idx"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "games_type_idx"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "games_phase_idx"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "games"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "user_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "player_role"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "game_phase"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "game_type"`);
  }
}