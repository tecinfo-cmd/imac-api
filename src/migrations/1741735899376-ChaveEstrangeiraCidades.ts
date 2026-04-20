import { MigrationInterface, QueryRunner, TableForeignKey, TableUnique } from "typeorm";

export class ChaveEstrangeiraCidades1741735899376 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createUniqueConstraint('IMAC.TB_CIDADES', new TableUnique({
            name: 'codigo_unique_constraint',
            columnNames: ['codigo']
        }));

        await queryRunner.createForeignKey('IMAC.TB_PROPRIEDADES', new TableForeignKey(
            {
                name: 'codigo_municipio_fk',
                columnNames: ['MUNICIPIO_CODIGO'],
                referencedColumnNames: [ 'codigo'],
                referencedTableName: 'IMAC.TB_CIDADES'
            }
        ))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey("IMAC.TB_PROPRIEDADES", 'codigo_municipio_fk');
        await queryRunner.dropUniqueConstraint('IMAC.TB_CIDADES', 'codigo_unique_constraint');
    }

}
