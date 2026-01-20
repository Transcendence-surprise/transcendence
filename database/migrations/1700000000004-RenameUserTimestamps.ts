import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUserTimestamps1700000000004
  implements MigrationInterface
{
  name = 'RenameUserTimestamps1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      RENAME COLUMN "createdAt" TO "created_at";
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      RENAME COLUMN "updatedAt" TO "updated_at";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      RENAME COLUMN "created_at" TO "createdAt";
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      RENAME COLUMN "updated_at" TO "updatedAt";
    `);
  }
}
