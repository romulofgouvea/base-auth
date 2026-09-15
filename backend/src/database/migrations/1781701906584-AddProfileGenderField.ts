import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileGenderField1781701906584 implements MigrationInterface {
  name = 'AddProfileGenderField1781701906584';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."profiles_gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD "gender" "public"."profiles_gender_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "profiles" DROP COLUMN "gender"`);
    await queryRunner.query(`DROP TYPE "public"."profiles_gender_enum"`);
  }
}
