import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AutenticacaoDeUsuarios1741713916045 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'IMAC.TB_USUARIOS',
        columns: [
          {
            name: 'ID',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'NOME_COMPLETO',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'CPF',
            type: 'varchar',
            length: '11',
            isNullable: false,
          },
          {
            name: 'EMAIL',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'SENHA',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'CONFIRMACAO_SENHA',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'ACEITOU_TERMOS',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'DATA_CRIACAO',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'DATA_ATUALIZACAO',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('IMAC.TB_USUARIOS');
  }
}
