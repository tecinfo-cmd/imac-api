import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Propriedade } from '../../propriedade-prem/entities/propriedade.entity';
import { LegendaEntity } from './legenda.entity';

@Entity({ schema: 'IMAC', name: 'TB_TERRITORIO' })
export class TerritorioEntity {
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  @Expose()
  id: number;

  @Column({ name: 'ID_PROPRIEDADE' })
  idPropriedade: number;

  @ManyToOne(() => Propriedade, (propriedade) => propriedade.territorios)
  @JoinColumn({ name: 'ID_PROPRIEDADE' })
  propriedade: Propriedade;

  @Expose()
  @ApiProperty()
  @Column({ name: 'CODIGO_TERRITORIO' })
  codigoTerritorio: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'CD_AGENTS' })
  codigoAgents: string;

  @ApiProperty()
  @Column({ name: 'CAR' })
  car: string;

  @ApiProperty()
  @Column({ name: 'GEOMETRY' })
  geometry: string;

  @ApiProperty()
  @Column({ name: 'VOUCHER' })
  voucher: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'IMAGEM_ANALISE' })
  imagemAnalise: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'IMAGEM_ADEQUACAO' })
  imagemAdequacao: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'IMAGEM_CONTESTACAO' })
  imagemContestacao: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'ERRO_AGROTOOLS' })
  erroAgrotools: string;

  @Expose()
  @OneToMany(() => LegendaEntity, (legenda) => legenda.territorio)
  legendas: LegendaEntity[];
}
