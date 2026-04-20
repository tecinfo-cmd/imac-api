import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class ConsultaElegibilidade1738798080509 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "IMAC.TB_SOLICITACOES_ELEGIBILIDADES",
            columns: [
                {
                    name: "ID",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "CAR_FEDERAL",
                    type: "varchar",
                    length: "43",
                    isNullable: false
                },
                {
                    name: "TELEFONE",
                    type: "varchar",
                    length: "13",
                    isNullable: false
                },
                {
                    name: "EMAIL",
                    type: "varchar",
                    length: "255",
                    isNullable: false
                },
                {
                    name: "STATUS",
                    type: "varchar",
                    length: "30",
                    isNullable: false
                },
                {
                    name: "DATA_CRIACAO",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "DATA_ATUALIZACAO",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("IMAC.TB_SOLICITACOES_ELEGIBILIDADES", true);
    }

}
