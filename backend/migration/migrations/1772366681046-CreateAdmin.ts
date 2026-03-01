import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class CreateAdminUser1670000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const username = 'admin';
    const email = 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
      console.warn('ADMIN_PASSWORD not set — skipping admin user creation');
      return;
    }

    const hash = await bcrypt.hash(password, 10);

    await queryRunner.query(
      `INSERT INTO "users" ("username", "email","password","roles","created_at")
       SELECT $1::varchar, $2::varchar, $3::varchar, ARRAY['user','admin']::text[], now()
       WHERE NOT EXISTS (SELECT 1 FROM "users" WHERE "email" = $1::varchar)`,
      [username, email, hash]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const email = 'admin@example.com';
    await queryRunner.query(`DELETE FROM "users" WHERE "email" = $1`, [email]);
  }
}
