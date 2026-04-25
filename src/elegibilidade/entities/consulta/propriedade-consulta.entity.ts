import { Exclude, Transform } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cidade } from '../cidade.entity';
import { ProprietarioConsulta } from './proprietario-consulta.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ schema: 'IMAC', name: 'TB_PROPRIEDADES_CONSULTA' })
export class PropriedadeConsulta {
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id?: number;

  @ApiProperty()
  @Column({
    name: 'CAR_FEDERAL',
    length: 43,
    unique: true,
  })
  @Transform(({ value }: { value: string }) => value?.replace(/[.]/g, ''), {
    toClassOnly: true,
  })
  carFederal: string;

  @ApiProperty()
  @Column({ name: 'CAR_ESTADUAL' })
  carEstadual: string;

  @ApiProperty()
  @Column({ name: 'NOME_PROPRIEDADE' })
  nomePropriedade: string;

  @Exclude()
  @Column({
    name: 'GEOMETRY',
    spatialFeatureType: 'Polygon',
    srid: 4326,
  })
  geometry?: string;

  @ApiProperty()
  @Column({ name: 'MODULO_FISCAL', type: 'numeric', precision: 10, scale: 2 })
  moduloFiscal?: number;

  @ApiProperty()
  proprietariosConsulta?: ProprietarioConsulta[];

  @Exclude()
  @Column({ name: 'DESC_PROPRIETARIOS' })
  proprietarios?: string;

  @Column({ name: 'CODIGO_MUNICIPIO' })
  codigoMunicipio?: number;

  @ApiProperty()
  @ManyToOne(() => Cidade)
  @JoinColumn({ name: 'CODIGO_MUNICIPIO', referencedColumnName: 'codigo' })
  cidade?: Cidade;

  @Exclude()
  @Column({ name: 'DATA_CRIACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataCriacao?: string;

  @Exclude()
  @Column({ name: 'DATA_ATUALIZACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataAtualizacao?: string;
}
