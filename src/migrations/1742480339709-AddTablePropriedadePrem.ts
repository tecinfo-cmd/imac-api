import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddTablePropriedadePrem1740010670918
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'IMAC.TB_PROPRIEDADE_PREM',
        columns: [
          {
            name: 'PROPRIETARIO_ID',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'PROPRIEDADE_ID',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'NOME_PROPRIEDADE',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'ATIVIDADE_PRINCIPAL',
            type: 'enum',
            enum: ['AGRICULTURA', 'PECUARIA', 'AGROPECUARIA'],
          },
          {
            name: 'NUMERO_PROPRIETARIOS',
            type: 'varchar',
          },
          {
            name: 'BIOMA_PREDOMINANTE',
            type: 'varchar',
          },
          {
            name: 'CICLO_PREDOMINANTE',
            type: 'enum',
            enum: ['CRIA', 'RECRIA', 'ENGORDA', 'CORTE'],
          },
          {
            name: 'HECTARES',
            type: 'int',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['PROPRIETARIO_ID'],
            referencedTableName: 'IMAC.TB_PROPRIETARIOS',
            referencedColumnNames: ['ID'],
          },
          {
            columnNames: ['PROPRIEDADE_ID'],
            referencedTableName: 'IMAC.TB_PROPRIEDADES_CONSULTA',
            referencedColumnNames: ['ID'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('IMAC.TB_PROPRIETARIOS_PROPRIEDADES_CONSULTA', true);
  }
}
