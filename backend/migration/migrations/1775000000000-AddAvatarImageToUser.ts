import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarImageToUser1775000000000 implements MigrationInterface {
  name = 'AddAvatarImageToUser1775000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "avatar_image_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_avatar_image" FOREIGN KEY ("avatar_image_id") REFERENCES "images"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_avatar_image"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "avatar_image_id"`,
    );
  }
}
