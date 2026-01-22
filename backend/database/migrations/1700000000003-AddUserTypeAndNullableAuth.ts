import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserTypeAndNullableAuth1700000000003
  implements MigrationInterface
{
  name = 'AddUserTypeAndNullableAuth1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "user_type" VARCHAR(16) NOT NULL DEFAULT 'registered';
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "email" DROP NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "password" DROP NOT NULL,
      ALTER COLUMN "password" DROP DEFAULT;
    `);

    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_key";
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique_not_null"
      ON "users" ("email")
      WHERE "email" IS NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "users_auth_fields_check"
      CHECK (
        ("user_type" = 'registered' AND "email" IS NOT NULL AND "password" IS NOT NULL)
        OR ("user_type" = 'visitor' AND "email" IS NULL AND "password" IS NULL)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_auth_fields_check";
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "users_email_unique_not_null";
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "users_email_key" UNIQUE ("email");
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "email" SET NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "password" SET NOT NULL,
      ALTER COLUMN "password" SET DEFAULT '';
    `);

    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "user_type";
    `);
  }
}
