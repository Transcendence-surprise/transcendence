// src/migrations/1779400000002-AddDescriptionToBadges.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionToBadges1779400000002 implements MigrationInterface {
  name = 'AddDescriptionToBadges1779400000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "badges" ADD COLUMN "description" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "badges" DROP COLUMN "description"`,
    );
  }
}
