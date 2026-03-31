import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAvatarImageForeignKey1778000000000 implements MigrationInterface {
  name = 'FixAvatarImageForeignKey1778000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_image_id" integer`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_avatar_image"`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_users_avatar_image" FOREIGN KEY ("avatar_image_id") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_avatar_image"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "avatar_image_id"`);
  }
}
