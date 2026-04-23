import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingUserBadgeColumns1779400000005 implements MigrationInterface {
  name = 'AddMissingUserBadgeColumns1779400000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add created_at column if it doesn't exist
    await queryRunner.query(`
      ALTER TABLE "user_badges"
      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    `);

    // Add progress column if it doesn't exist
    await queryRunner.query(`
      ALTER TABLE "user_badges"
      ADD COLUMN IF NOT EXISTS "progress" integer NOT NULL DEFAULT 0
    `);

    // Add completed column if it doesn't exist
    await queryRunner.query(`
      ALTER TABLE "user_badges"
      ADD COLUMN IF NOT EXISTS "completed" boolean NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_badges"
      DROP COLUMN IF EXISTS "completed"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_badges"
      DROP COLUMN IF EXISTS "progress"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_badges"
      DROP COLUMN IF EXISTS "created_at"
    `);
  }
}
