import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AdicionarCampoTokenSolicitacoesEligibilidade1740528469873 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

        await queryRunner.addColumn("IMAC.TB_SOLICITACOES_ELEGIBILIDADES", new TableColumn({
            name: "TOKEN",
            type: "uuid",
            isGenerated: true,
            generationStrategy: "uuid"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("IMAC.TB_SOLICITACOES_ELEGIBILIDADES", "TOKEN");

        await queryRunner.query('DROP EXTENSION IF EXISTS "uuid-ossp"');
    }

}
