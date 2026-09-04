import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesPermissionsTables1700000000002 implements MigrationInterface {
  name = 'CreateRolesPermissionsTables1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "name" VARCHAR NOT NULL,
        "description" VARCHAR,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "created_by" UUID,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_by" UUID,
        "deleted_at" TIMESTAMPTZ,
        "deleted_by" UUID,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "PK_roles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" UUID NOT NULL DEFAULT gen_random_uuid(),
        "resource" VARCHAR NOT NULL,
        "action" VARCHAR NOT NULL,
        "description" VARCHAR,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "created_by" UUID,
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_by" UUID,
        "deleted_at" TIMESTAMPTZ,
        "deleted_by" UUID,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "PK_permissions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_permissions_resource_action" UNIQUE ("resource", "action")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "user_id" UUID NOT NULL,
        "role_id" UUID NOT NULL,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("user_id", "role_id"),
        CONSTRAINT "FK_user_roles_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_roles_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id" UUID NOT NULL,
        "permission_id" UUID NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id"),
        CONSTRAINT "FK_role_permissions_role_id" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_role_permissions_permission_id" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
