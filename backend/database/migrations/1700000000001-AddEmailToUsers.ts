import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailToUsers1700000000001 implements MigrationInterface {
  name = 'AddEmailToUsers1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Add column (nullable first so existing rows don't break)
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "email" VARCHAR(32);
    `);

    // 2) Backfill any existing rows
    await queryRunner.query(`
      UPDATE "users"
      SET "email" = "username" || '@example.com'
      WHERE "email" IS NULL;
    `);

    // 3) Enforce NOT NULL
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "email" SET NOT NULL;
    `);

    // 4) Add unique constraint if missing
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'users_email_key'
        ) THEN
          ALTER TABLE "users"
          ADD CONSTRAINT "users_email_key" UNIQUE ("email");
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_key";
    `);
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "email";
    `);
  }
}


