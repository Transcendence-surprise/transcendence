import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserTwoFactorEnabled1772138734903 implements MigrationInterface {
    name = 'AddUserTwoFactorEnabled1772138734903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "two_factor_enabled" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "two_factor_enabled"`);
    }

}
