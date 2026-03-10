import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCicloPredominanteToCicloProducao1742651343868
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "IMAC"."TB_PROPRIEDADE_PREM"
      RENAME COLUMN "CICLO_PREDOMINANTE" TO "CICLO_PRODUCAO"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "IMAC"."TB_PROPRIEDADE_PREM"
      RENAME COLUMN "CICLO_PRODUCAO" TO "CICLO_PREDOMINANTE"
    `);
  }
}
