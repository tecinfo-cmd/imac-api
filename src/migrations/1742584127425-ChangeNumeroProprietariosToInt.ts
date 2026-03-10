import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeNumeroProprietariosToInt1742584127425
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "IMAC"."TB_PROPRIEDADE_PREM"
      ALTER COLUMN "NUMERO_PROPRIETARIOS" TYPE integer USING "NUMERO_PROPRIETARIOS"::integer
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "IMAC"."TB_PROPRIEDADE_PREM"
      ALTER COLUMN "NUMERO_PROPRIETARIOS" TYPE varchar USING "NUMERO_PROPRIETARIOS"::varchar
    `);
  }
}
