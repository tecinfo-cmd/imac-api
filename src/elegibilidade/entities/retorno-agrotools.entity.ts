import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeteccoesAgrotools } from './deteccoes-agrotools.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ schema: 'IMAC', name: 'TB_RETORNO_AGROTOOLS' })
export class RetornoAgrotools {
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'URLCHECKOUT_AGROTOOLS'})
  urlCheckout: string;

  @Expose()
  @Column({ name: 'CREATED_URLACHECKOUT_AT'})
  createdAt: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'ISELEGIBLE' })
  isEligible: boolean;

  @Expose()
  @ApiProperty()
  @Column({ name: 'HASDOCMENTOS' })
  hasDocuments: boolean;

  @Expose()
  @ApiProperty()
  @Column({ name: 'ERRORS'})
  errors: string;

  @Expose()
  @OneToMany(() => DeteccoesAgrotools, (deteccoes) => deteccoes.retornoAgrotools,{ cascade: ['insert', 'update']})
  deteccoes: DeteccoesAgrotools[]

  @Expose()
  @ApiProperty()
  @Column('decimal', { name: 'AREAS_DESMATAMENTO_TOTAL' })
  areas_desmatamento_total: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'MODULO_FISCAL'})
  modulo_fiscal: string;

  @Expose()
  @ApiProperty()
  @Column('decimal', { name: 'VLR_MULTA'})
  vlr_multa: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'DESCONTO_PERC'})
  desconto_perc: number;

  @Expose()
  @CreateDateColumn({ name: 'DATA_CRIACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataCriacao: string;

  @Expose()
  @UpdateDateColumn({ name: 'DATA_ATUALIZACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataAtualizacao: string;
}
