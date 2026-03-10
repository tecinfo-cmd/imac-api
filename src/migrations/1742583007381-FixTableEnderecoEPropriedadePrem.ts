import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class FixTableEnderecoEPropriedadePrem1742583007381
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableName = 'TB_PROPRIEDADE_PREM';
    const propriedadeTable = await queryRunner.getTable(tableName);
    if (!propriedadeTable) {
      throw new Error(`Table ${tableName} not found`);
    }

    const foreignKey = propriedadeTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('ENDERECO_ID') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey(tableName, foreignKey);
      await queryRunner.createForeignKey(
        tableName,
        new TableForeignKey({
          columnNames: ['ENDERECO_ID'],
          referencedTableName: 'TB_ENDERECOS',
          referencedColumnNames: ['ID'],
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableName = 'TB_PROPRIEDADE_PREM';
    const propriedadeTable = await queryRunner.getTable(tableName);
    if (!propriedadeTable) {
      throw new Error(`Table ${tableName} not found`);
    }
    const foreignKey = propriedadeTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('ENDERECO_ID') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey(tableName, foreignKey);
      await queryRunner.createForeignKey(
        tableName,
        new TableForeignKey({
          columnNames: ['ENDERECO_ID'],
          referencedTableName: 'IMAC.TB_ENDERECOS',
          referencedColumnNames: ['ID'],
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        }),
      );
    }
  }
}
