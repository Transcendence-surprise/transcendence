// src/migrations/1779400000001-CreateBages.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBadgesAndUserBadges1779400000001 implements MigrationInterface {
  name = 'CreateBadgesAndUserBadges1779400000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. BADGES TABLE
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "badges" (
        "id" SERIAL NOT NULL,
        "key" character varying(64) NOT NULL,
        "name" character varying(128) NOT NULL,
        "image_url" character varying(255) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_badges_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_badges_key" UNIQUE ("key")
      )
    `);

    // 2. USER_BADGES TABLE
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_badges" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "badge_id" integer NOT NULL,
        "unlocked_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_badges_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_badges_user_badge" UNIQUE ("user_id", "badge_id"),
        CONSTRAINT "FK_user_badges_user"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_user_badges_badge"
          FOREIGN KEY ("badge_id")
          REFERENCES "badges"("id")
          ON DELETE CASCADE
      )
    `);

    // indexes (optional but good)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_badges_user_id"
      ON "user_badges" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_badges_badge_id"
      ON "user_badges" ("badge_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_badges"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "badges"`);
  }
}