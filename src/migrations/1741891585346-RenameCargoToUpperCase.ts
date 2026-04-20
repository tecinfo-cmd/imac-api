import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCargoToUpperCase1710330000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "IMAC"."TB_USUARIOS"
      RENAME COLUMN "cargo" TO "CARGO";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "IMAC"."TB_USUARIOS"
      RENAME COLUMN "CARGO" TO "cargo";
    `);
  }
}
