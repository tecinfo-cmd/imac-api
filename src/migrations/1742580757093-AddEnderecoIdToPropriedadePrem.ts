import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddEnderecoIdToPropriedadePrem1742580757093
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'IMAC.TB_PROPRIEDADE_PREM',
      new TableColumn({
        name: 'ENDERECO_ID',
        type: 'int',
        isNullable: false,
      }),
    );

    await queryRunner.createForeignKey(
      'IMAC.TB_PROPRIEDADE_PREM',
      new TableForeignKey({
        columnNames: ['ENDERECO_ID'],
        referencedTableName: 'IMAC.TB_ENDERECOS',
        referencedColumnNames: ['ID'],
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('IMAC.TB_PROPRIEDADE_PREM');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('ENDERECO_ID') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey(
          'IMAC.TB_PROPRIEDADE_PREM',
          foreignKey,
        );
      }
      await queryRunner.dropColumn('IMAC.TB_PROPRIEDADE_PREM', 'ENDERECO_ID');
    }
  }
}
