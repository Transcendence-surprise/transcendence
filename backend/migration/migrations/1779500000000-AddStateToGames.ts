import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStateToGames1779500000000 implements MigrationInterface {
  name = 'AddStateToGames1779500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "games"
      ADD COLUMN IF NOT EXISTS "state" jsonb NOT NULL DEFAULT '{}'::jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "games" DROP COLUMN IF EXISTS "state";`);
  }
}
