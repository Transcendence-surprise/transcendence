import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1771269423311 implements MigrationInterface {
    name = 'InitialSchema1771269423311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "api_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "hash" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expires_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_5c8a79801b44bd27b79228e1dad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_598a14447f592c12d1fe22ba91" ON "api_keys" ("hash") `);
        await queryRunner.query(`CREATE TYPE "public"."game_type" AS ENUM('SINGLE', 'MULTI')`);
        await queryRunner.query(`CREATE TYPE "public"."game_phase" AS ENUM('LOBBY', 'PLAY', 'END')`);
        await queryRunner.query(`CREATE TABLE "games" ("id" SERIAL NOT NULL, "type" "public"."game_type" NOT NULL, "num_collectables" integer NOT NULL, "num_players" integer NOT NULL, "level" smallint NOT NULL, "phase" "public"."game_phase" NOT NULL, "board_size" integer NOT NULL, "host_user_id" integer NOT NULL, "winner_user_id" integer, "started_at" TIMESTAMP WITH TIME ZONE, "ended_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "games_ended_at_idx" ON "games" ("ended_at") `);
        await queryRunner.query(`CREATE INDEX "games_host_user_idx" ON "games" ("host_user_id") `);
        await queryRunner.query(`CREATE INDEX "games_type_idx" ON "games" ("type") `);
        await queryRunner.query(`CREATE INDEX "games_phase_idx" ON "games" ("phase") `);
        await queryRunner.query(`CREATE TABLE "game_players" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "game_id" integer NOT NULL, CONSTRAINT "PK_a99af25a1c97122f04ba778197c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "game_players_game_user_unique" ON "game_players" ("game_id", "user_id") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying(32), "email" character varying(254), "password" character varying(255), "roles" text array NOT NULL DEFAULT '{user}', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "users_email_unique_not_null" ON "users" ("email") WHERE "email" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "game_players" ADD CONSTRAINT "FK_67b26bf4c76bd09a206d504824b" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_players" DROP CONSTRAINT "FK_67b26bf4c76bd09a206d504824b"`);
        await queryRunner.query(`DROP INDEX "public"."users_email_unique_not_null"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."game_players_game_user_unique"`);
        await queryRunner.query(`DROP TABLE "game_players"`);
        await queryRunner.query(`DROP INDEX "public"."games_phase_idx"`);
        await queryRunner.query(`DROP INDEX "public"."games_type_idx"`);
        await queryRunner.query(`DROP INDEX "public"."games_host_user_idx"`);
        await queryRunner.query(`DROP INDEX "public"."games_ended_at_idx"`);
        await queryRunner.query(`DROP TABLE "games"`);
        await queryRunner.query(`DROP TYPE "public"."game_phase"`);
        await queryRunner.query(`DROP TYPE "public"."game_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_598a14447f592c12d1fe22ba91"`);
        await queryRunner.query(`DROP TABLE "api_keys"`);
    }

}
