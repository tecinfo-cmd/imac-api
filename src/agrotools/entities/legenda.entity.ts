import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TerritorioEntity } from './territorio.entity';

@Entity({ schema: 'IMAC', name: 'TB_LEGENDA' })
export class LegendaEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  @Expose()
  id: number;

  @Column({ name: 'ID_TERRITORIO' })
  idTerritorio: number;

  @ManyToOne(() => TerritorioEntity, (territorio) => territorio.legendas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ID_TERRITORIO' })
  territorio: TerritorioEntity;

  @Expose()
  @ApiProperty()
  @Column({ name: 'DESCRICAO' })
  descricao: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'COR' })
  cor: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'TIPO' })
  tipo: string;
}
