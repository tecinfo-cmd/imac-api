import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class Propriedades1739845660678 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "IMAC.TB_PROPRIEDADES_CONSULTA",
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
                    length: "43"

                },
                {
                    name: "CAR_ESTADUAL",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "NOME_PROPRIEDADE",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "SITUACAO_CAR",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "MUNICIPIO_CODIGO",
                    type: "int",
                    isNullable: false
                },
                {
                    name: "GEOMETRY",
                    type: "polygon",
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

        await queryRunner.createIndex("IMAC.TB_PROPRIEDADES", new TableIndex({
            name: "IDX_CAR_FEDERAL",
            columnNames: ["CAR_FEDERAL"]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("IMAC.TB_PROPRIEDADES", "IDX_CAR_FEDERAL");

        await queryRunner.dropTable("IMAC.TB_PROPRIEDADES", true);
    }

}
