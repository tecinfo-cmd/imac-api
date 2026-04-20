import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class ProprietariosCars1740010670918 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "IMAC.TB_PROPRIETARIOS_PROPRIEDADES",
            columns: [
                {
                    name: "PROPRIETARIO_ID",
                    type: "int",
                    isPrimary: true
                },
                {
                    name: "PROPRIEDADE_ID",
                    type: "int",
                    isPrimary: true
                }
            ],
            foreignKeys: [
                {
                    columnNames: ["PROPRIETARIO_ID"],
                    referencedTableName: "IMAC.TB_PROPRIETARIOS",
                    referencedColumnNames: ["ID"]
                },
                {
                    columnNames: ["PROPRIEDADE_ID"],
                    referencedTableName: "IMAC.TB_PROPRIEDADES",
                    referencedColumnNames: ["ID"]
                }
            ]
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("IMAC.TB_PROPRIETARIOS_PROPRIEDADES", true);
    }

}
