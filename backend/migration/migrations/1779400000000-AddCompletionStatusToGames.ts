import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompletionStatusToGames1779400000000 implements MigrationInterface {
  name = 'AddCompletionStatusToGames1779400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'game_completion_status') THEN
        CREATE TYPE "game_completion_status" AS ENUM('FINISHED', 'ABANDONED');
      END IF;
    END $$;`);

    await queryRunner.query(`
      ALTER TABLE "games"
      ADD COLUMN IF NOT EXISTS "completion_status" "game_completion_status" NOT NULL DEFAULT 'FINISHED';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "games" DROP COLUMN IF EXISTS "completion_status";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "game_completion_status";`);
  }
}
