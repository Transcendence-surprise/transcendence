import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleAndUserTypeToGamePlayers1779100000000 implements MigrationInterface {
  name = 'AddRoleAndUserTypeToGamePlayers1779100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add role column
    await queryRunner.query(`
      ALTER TABLE "game_players"
      ADD COLUMN IF NOT EXISTS "role" "player_role" NOT NULL DEFAULT 'PLAYER';
    `);

    // Add user_type column
    await queryRunner.query(`
      ALTER TABLE "game_players"
      ADD COLUMN IF NOT EXISTS "user_type" "user_type" NOT NULL DEFAULT 'USER';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "game_players" DROP COLUMN IF EXISTS "role";`);
    await queryRunner.query(`ALTER TABLE "game_players" DROP COLUMN IF EXISTS "user_type";`);
  }
}