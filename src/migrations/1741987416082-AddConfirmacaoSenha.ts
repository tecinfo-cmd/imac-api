import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConfirmacaoSenhaField1680000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IMAC"."TB_USUARIOS" ADD COLUMN "CONFIRMACAO_SENHA" VARCHAR(100) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "IMAC"."TB_USUARIOS" DROP COLUMN "CONFIRMACAO_SENHA"`,
    );
  }
}
