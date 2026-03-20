import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateImageEntity1773965037818 implements MigrationInterface {
  name = 'CreateImageEntity1773965037818'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "images" (
        "id" SERIAL NOT NULL,
        "url" character varying(1024) NOT NULL,
        "filename" character varying(255),
        "mime_type" character varying(100),
        "size" integer,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_images_id" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "images"`);
  }
}
