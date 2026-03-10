import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Proprietarios1740009837043 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "IMAC.TB_PROPRIETARIOS",
            columns: [
                {
                    name: "ID",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "CPF_CNPJ",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "NOME",
                    type: "varchar",
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
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("IMAC.TB_PROPRIETARIOS", true);
    }

}
