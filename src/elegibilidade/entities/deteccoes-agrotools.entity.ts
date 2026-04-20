import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RetornoAgrotools } from './retorno-agrotools.entity';

@Entity({ schema: 'IMAC', name: 'TB_AGROTOOLS_DETECCOES' })
export class DeteccoesAgrotools {

  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id?: number;

  @ApiProperty()
  @Column({ name: 'TIPO' })
  tipo: string;

  @ApiProperty()
  @Column({ name: 'AREA_HA' })
  area_ha: string;

  @ApiProperty()
  @Column({ name: 'ID_AGROTOOLS' })
  idAgrotools: number;

  @ApiProperty()
  @ManyToOne(() => RetornoAgrotools, (retornoAgrotools) => retornoAgrotools.deteccoes)
  @JoinColumn({ name: 'ID_RETORNO_AGROTOOLS' })
  retornoAgrotools?: RetornoAgrotools


}
