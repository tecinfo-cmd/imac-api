import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Cidades1741735541007 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'IMAC.TB_CIDADES',
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: 'codigo',
                    type: 'int'
                },
                {
                    name: 'nome',
                    type: 'varchar'
                },
                {
                    name: 'uf',
                    type: 'char',
                    length: '2'
                }
            ]
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('IMAC.TB_CIDADES');
    }

}
