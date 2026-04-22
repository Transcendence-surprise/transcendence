import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFriendships1779400000003 implements MigrationInterface {
  name = 'CreateFriendships1779400000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "friendships_status_enum" AS ENUM (
        'pending',
        'accepted',
        'rejected',
        'blocked'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "friendships" (
        "id" SERIAL PRIMARY KEY,

        "requester_id" integer NOT NULL,
        "receiver_id" integer NOT NULL,
        "requested_by" integer NOT NULL,

        "status" "friendships_status_enum" NOT NULL DEFAULT 'pending',

        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

        CONSTRAINT "UQ_friendships_pair"
          UNIQUE ("requester_id", "receiver_id"),

        CONSTRAINT "FK_friendships_requester"
          FOREIGN KEY ("requester_id")
          REFERENCES "users"("id")
          ON DELETE CASCADE,

        CONSTRAINT "FK_friendships_receiver"
          FOREIGN KEY ("receiver_id")
          REFERENCES "users"("id")
          ON DELETE CASCADE,

        CONSTRAINT "FK_friendships_requested_by"
          FOREIGN KEY ("requested_by")
          REFERENCES "users"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_friendships_requester"
      ON "friendships" ("requester_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_friendships_receiver"
      ON "friendships" ("receiver_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_friendships_requested_by"
      ON "friendships" ("requested_by")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_friendships_requested_by"`);
    await queryRunner.query(`DROP INDEX "IDX_friendships_receiver"`);
    await queryRunner.query(`DROP INDEX "IDX_friendships_requester"`);

    await queryRunner.query(`DROP TABLE "friendships"`);

    await queryRunner.query(`DROP TYPE "friendships_status_enum"`);
  }
}