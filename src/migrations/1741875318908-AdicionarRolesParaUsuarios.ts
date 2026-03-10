import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AdicionarRolesParaUsuarios1741875318908
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'IMAC.TB_USUARIOS',
      new TableColumn({
        name: 'cargo',
        type: 'enum',
        enum: ['PRODUTOR', 'ADMIN', 'ANALISTA', 'GERENTE DE PROJETOS'],
        default: `'PRODUTOR'`,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('IMAC.TB_USUARIOS', 'cargo');
  }
}
