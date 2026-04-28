// src/migrations/1779400000004-AddBadgeProgressAndConditions.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBadgeProgressAndConditions1779400000004 implements MigrationInterface {
  name = 'AddBadgeProgressAndConditions1779400000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 🔹 badges table updates
    await queryRunner.query(`
      ALTER TABLE "badges"
      ADD COLUMN "condition_type" character varying(32) NOT NULL DEFAULT 'games'
    `);

    await queryRunner.query(`
      ALTER TABLE "badges"
      ADD COLUMN "condition_value" integer NOT NULL DEFAULT 1
    `);

    // 🔹 user_badges table updates
    await queryRunner.query(`
      ALTER TABLE "user_badges"
      ADD COLUMN "progress" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "user_badges"
      ADD COLUMN "completed" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // reverse user_badges
    await queryRunner.query(`
      ALTER TABLE "user_badges" DROP COLUMN "completed"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_badges" DROP COLUMN "progress"
    `);

    // reverse badges
    await queryRunner.query(`
      ALTER TABLE "badges" DROP COLUMN "condition_value"
    `);

    await queryRunner.query(`
      ALTER TABLE "badges" DROP COLUMN "condition_type"
    `);
  }
}