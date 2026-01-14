import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordAndNullableUsername1700000000002
  implements MigrationInterface
{
  name = 'AddPasswordAndNullableUsername1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make username optional (nullable). Unique constraint still applies to non-null values.
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "username" DROP NOT NULL;
    `);

    // Add password column. Keep a default so existing inserts/tests that don't provide it won't break.
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "password" VARCHAR(255) NOT NULL DEFAULT '';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "password";
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "username" SET NOT NULL;
    `);
  }
}


