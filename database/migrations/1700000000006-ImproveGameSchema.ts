import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImproveGameSchema1700000000006 implements MigrationInterface {
  name = 'ImproveGameSchema1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "email" TYPE VARCHAR(254);
    `);

    await queryRunner.query(`
      ALTER TABLE "games"
      ADD COLUMN IF NOT EXISTS "created_at" timestamptz NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS "updated_at" timestamptz NOT NULL DEFAULT now();
    `);

    await queryRunner.query(`
      ALTER TABLE "games"
      DROP COLUMN IF EXISTS "players_id";
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "game_players" (
        "id" SERIAL PRIMARY KEY,
        "game_id" INTEGER NOT NULL,
        "user_id" INTEGER NOT NULL,
        "joined_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      ALTER TABLE "game_players"
      ADD CONSTRAINT "game_players_game_fk"
      FOREIGN KEY ("game_id") REFERENCES "games" ("id")
      ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE "game_players"
      ADD CONSTRAINT "game_players_user_fk"
      FOREIGN KEY ("user_id") REFERENCES "users" ("id")
      ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "game_players_game_user_unique"
      ON "game_players" ("game_id", "user_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "game_players_game_id_idx"
      ON "game_players" ("game_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "game_players_user_id_idx"
      ON "game_players" ("user_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "games_host_user_id_idx"
      ON "games" ("host_user_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "games_winner_user_id_idx"
      ON "games" ("winner_user_id");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "games_phase_idx"
      ON "games" ("phase");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "games_phase_idx";
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "games_winner_user_id_idx";
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "games_host_user_id_idx";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "game_players_user_id_idx";
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "game_players_game_id_idx";
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "game_players_game_user_unique";
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "game_players";
    `);

    await queryRunner.query(`
      ALTER TABLE "games"
      ADD COLUMN IF NOT EXISTS "players_id" INTEGER[];
    `);

    await queryRunner.query(`
      ALTER TABLE "games"
      DROP COLUMN IF EXISTS "updated_at",
      DROP COLUMN IF EXISTS "created_at";
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "email" TYPE VARCHAR(32);
    `);
  }
}
