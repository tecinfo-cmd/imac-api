import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddTableEndereco1742580647868 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'TB_ENDERECOS',
        columns: [
          {
            name: 'ID',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'CEP',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'LONGITUDE',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'LATITUDE',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'MUNICIPIO',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'ESTADO',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'CODIGO_POSTAL',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'LOGRADOURO',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'COMPLEMENTO',
            type: 'varchar',
            isNullable: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('IMAC.TB_ENDERECOS', true);
  }
}
