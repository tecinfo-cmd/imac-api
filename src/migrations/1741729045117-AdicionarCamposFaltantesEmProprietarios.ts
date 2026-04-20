import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AdicionarCamposFaltantesEmProprietarios1741729045117
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'IMAC.TB_PROPRIETARIOS',
      new TableColumn({
        name: 'RG_INSCRICAO_SOCIAL',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'IMAC.TB_PROPRIETARIOS',
      new TableColumn({
        name: 'DATA_NASCIMENTO',
        type: 'date',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'IMAC.TB_PROPRIETARIOS',
      new TableColumn({
        name: 'TELEFONE',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'IMAC.TB_PROPRIETARIOS',
      new TableColumn({
        name: 'TIPO_PROPRIETARIO',
        type: 'enum',
        enum: ['PRINCIPAL', 'SECUNDARIO'],
        isNullable: false,
        default: `'PRINCIPAL'`,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('IMAC.TB_PROPRIETARIOS', 'TIPO_PROPRIETARIO');
    await queryRunner.dropColumn('IMAC.TB_PROPRIETARIOS', 'TELEFONE');
    await queryRunner.dropColumn('IMAC.TB_PROPRIETARIOS', 'DATA_NASCIMENTO');
    await queryRunner.dropColumn(
      'IMAC.TB_PROPRIETARIOS',
      'RG_INSCRICAO_SOCIAL',
    );
  }
}
