import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRemovalFields1781701906583 implements MigrationInterface {
  name = 'AddUserRemovalFields1781701906583';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "is_remove_permanent" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "remove_requested_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "remove_requested_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "is_remove_permanent"`,
    );
  }
}
