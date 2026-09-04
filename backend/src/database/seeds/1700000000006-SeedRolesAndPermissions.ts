import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Generic starter seed: two roles (ADMIN, USER) and a small permission set
 * covering the resources this starter ships with (user, role, permission,
 * profile). Add your own resources/permissions as your app grows.
 */
export class SeedRolesAndPermissions1700000000006 implements MigrationInterface {
  name = 'SeedRolesAndPermissions1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "roles" ("id", "name", "description", "is_active") VALUES
        (gen_random_uuid(), 'ADMIN', 'Administrador do sistema', true),
        (gen_random_uuid(), 'USER', 'Usuário padrão', true)
    `);

    await queryRunner.query(`
      INSERT INTO "permissions" ("id", "resource", "action", "description", "is_active") VALUES
        (gen_random_uuid(), 'dashboard:user', 'create', 'Create user', true),
        (gen_random_uuid(), 'dashboard:user', 'read',   'Read user', true),
        (gen_random_uuid(), 'dashboard:user', 'update', 'Update user', true),
        (gen_random_uuid(), 'dashboard:user', 'delete', 'Delete user', true),
        (gen_random_uuid(), 'dashboard:role', 'create', 'Create role', true),
        (gen_random_uuid(), 'dashboard:role', 'read',   'Read role', true),
        (gen_random_uuid(), 'dashboard:role', 'update', 'Update role', true),
        (gen_random_uuid(), 'dashboard:role', 'delete', 'Delete role', true),
        (gen_random_uuid(), 'dashboard:permission', 'create', 'Create permission', true),
        (gen_random_uuid(), 'dashboard:permission', 'read',   'Read permission', true),
        (gen_random_uuid(), 'dashboard:permission', 'update', 'Update permission', true),
        (gen_random_uuid(), 'dashboard:permission', 'delete', 'Delete permission', true),
        (gen_random_uuid(), 'dashboard:profile', 'read',   'Read own profile', true),
        (gen_random_uuid(), 'dashboard:profile', 'update', 'Update own profile', true)
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r, "permissions" p
      WHERE r.name = 'ADMIN'
    `);

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r, "permissions" p
      WHERE r.name = 'USER'
      AND (
        (p.resource = 'dashboard:user' AND p.action IN ('read', 'update'))
        OR
        (p.resource = 'dashboard:profile' AND p.action IN ('read', 'update'))
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "role_permissions"
      WHERE "role_id" IN (
        SELECT id FROM "roles" WHERE "name" IN ('ADMIN', 'USER')
      )
    `);

    await queryRunner.query(`
      DELETE FROM "permissions"
      WHERE ("resource", "action") IN (
        ('dashboard:user', 'create'), ('dashboard:user', 'read'), ('dashboard:user', 'update'), ('dashboard:user', 'delete'),
        ('dashboard:role', 'create'), ('dashboard:role', 'read'), ('dashboard:role', 'update'), ('dashboard:role', 'delete'),
        ('dashboard:permission', 'create'), ('dashboard:permission', 'read'), ('dashboard:permission', 'update'), ('dashboard:permission', 'delete'),
        ('dashboard:profile', 'read'), ('dashboard:profile', 'update')
      )
    `);

    await queryRunner.query(`
      DELETE FROM "roles" WHERE "name" IN ('ADMIN', 'USER')
    `);
  }
}
