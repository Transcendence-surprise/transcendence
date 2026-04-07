import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGameDataForUser1774989859976 implements MigrationInterface {
    name = 'AddGameDataForUser1774989859976'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_image_id" integer`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_avatar_image"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "rank_number" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "win_streak" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "total_games" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "total_wins" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_avatar_image" FOREIGN KEY ("avatar_image_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_adae49d181d913e047f59e07223"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "total_wins"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "total_games"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "win_streak"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "rank_number"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_avatar_image" FOREIGN KEY ("avatar_image_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
