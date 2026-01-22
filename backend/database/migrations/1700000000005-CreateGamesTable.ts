import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGamesTable1700000000005 implements MigrationInterface {
  name = 'CreateGamesTable1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "games" (
        "id" SERIAL PRIMARY KEY,
        "type" VARCHAR(8) NOT NULL,
        "num_collectables" INTEGER NOT NULL,
        "num_players" INTEGER NOT NULL,
        "level" SMALLINT NOT NULL,
        "phase" VARCHAR(8) NOT NULL,
        "board_size" INTEGER NOT NULL,
        "host_user_id" INTEGER NOT NULL,
        "winner_user_id" INTEGER,
        "started_at" timestamptz,
        "ended_at" timestamptz,
        "players_id" INTEGER[]
      );
    `);

    await queryRunner.query(`
      ALTER TABLE "games"
      ADD CONSTRAINT "games_type_check" CHECK ("type" IN ('SINGLE', 'MULTI'));
    `);

    await queryRunner.query(`
      ALTER TABLE "games"
      ADD CONSTRAINT "games_phase_check" CHECK ("phase" IN ('LOBBY', 'PLAY', 'END'));
    `);

    await queryRunner.query(`
      ALTER TABLE "games"
      ADD CONSTRAINT "games_level_check" CHECK ("level" IN (1, 2));
    `);

    await queryRunner.query(`
      ALTER TABLE "games"
      ADD CONSTRAINT "games_host_user_fk"
      FOREIGN KEY ("host_user_id") REFERENCES "users" ("id")
      ON DELETE RESTRICT;
    `);

    await queryRunner.query(`
      ALTER TABLE "games"
      ADD CONSTRAINT "games_winner_user_fk"
      FOREIGN KEY ("winner_user_id") REFERENCES "users" ("id")
      ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "games" DROP CONSTRAINT IF EXISTS "games_winner_user_fk";
    `);
    await queryRunner.query(`
      ALTER TABLE "games" DROP CONSTRAINT IF EXISTS "games_host_user_fk";
    `);
    await queryRunner.query(`
      ALTER TABLE "games" DROP CONSTRAINT IF EXISTS "games_level_check";
    `);
    await queryRunner.query(`
      ALTER TABLE "games" DROP CONSTRAINT IF EXISTS "games_phase_check";
    `);
    await queryRunner.query(`
      ALTER TABLE "games" DROP CONSTRAINT IF EXISTS "games_type_check";
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "games";
    `);
  }
}
