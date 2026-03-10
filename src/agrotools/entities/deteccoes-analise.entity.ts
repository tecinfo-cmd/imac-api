import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RetornoAnaliseEntity } from '../../agrotools/entities/retorno-analise.entity';
import { Expose } from 'class-transformer';

@Entity({ schema: 'IMAC', name: 'TB_AGROTOOLS_DETECCOES' })
export class DeteccoesAnaliseEntity {


  @Expose()
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id?: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'TIPO' })
  tipo: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'AREA_HA' })
  area_ha: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'ID_AGROTOOLS' })
  idAgrotools: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'WKT' })
  wkt?: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'AREA_A_REGENERAR'})
  areaARegenerar?: number;

  @Expose()
  @ManyToOne(() => RetornoAnaliseEntity, (retornoAnalises) => retornoAnalises.deteccoes)
  @JoinColumn({ name: 'ID_RETORNO_ANALISE' })
  retornoAnalises?: RetornoAnaliseEntity

  @Expose()
  @ApiProperty()
  @Column({ name: 'URL_CONTESTACAO' })
  urlContestacao: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'TIPO_DETECCAO'})
  tipoDeteccao?: number;



}
