import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Propriedade } from '../../propriedade-prem/entities/propriedade.entity';
import { DeteccoesAnaliseEntity } from './deteccoes-analise.entity';
import { ContestacaoAutorizacaoSupressao } from '../../propriedade-prem/analise-socioambiental/entities/contestacao-autorizacao-supressao.entity';
import { ContestacaoLaudo } from '../../propriedade-prem/analise-socioambiental/entities/contestacao-laudo.entity';
import { PlanoAdequacao } from '../../propriedade-prem/analise-socioambiental/entities/plano-adequacao.entity';
import { Documento } from '../../shared/entity/documento.entity';

@Entity({
  schema: 'IMAC',
  name: 'TB_RETORNO_ANALISE',
  orderBy: {
    id: 'DESC',
  },
})
export class RetornoAnaliseEntity {
  @Expose()
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  @Expose()
  id: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'URL_RELATORIO' })
  urlRelatorio: string;

  @Column({ name: 'ID_PROPRIEDADE' })
  idPropriedade: number;

  @ManyToOne(() => Propriedade, (propriedade) => propriedade.retornoAnalises)
  @JoinColumn({ name: 'ID_PROPRIEDADE' })
  propriedade?: Propriedade;

  @Expose()
  @ApiProperty()
  @Column({ name: 'AREA_DESMATADA_TOTAL' })
  areaDesmatadaTotal: number;

  @Expose()
  @ApiProperty()
  @Column({
    name: 'AREA_A_REGENERAR',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  areaARegenerar?: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'MODULO_FISCAL' })
  moduloFiscal: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'VLR_MULTA' })
  valorMulta: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'DESCONTO_PERCENTUAL' })
  descontoPercentual: number;

  @Expose()
  @ApiProperty({
    type: DeteccoesAnaliseEntity,
    isArray: true,
  })
  @OneToMany(
    () => DeteccoesAnaliseEntity,
    (deteccoes) => deteccoes.retornoAnalises,
    { cascade: ['insert', 'update'] },
  )
  deteccoes: DeteccoesAnaliseEntity[];

  @Expose()
  @ApiProperty()
  @OneToOne(
    () => ContestacaoAutorizacaoSupressao,
    (contestacao) => contestacao.analiseSocioambiental,
  )
  contestacaoAutorizacaoSupressao?: ContestacaoAutorizacaoSupressao;

  @Expose()
  @ApiProperty()
  @OneToOne(
    () => ContestacaoLaudo,
    (contestacao) => contestacao.analiseSocioambiental,
  )
  contestacaoLaudo?: ContestacaoLaudo;

  @Expose()
  @ApiProperty()
  @OneToOne(
    () => PlanoAdequacao,
    (planoAdequacao) => planoAdequacao.analiseSocioambiental,
  )
  planoAdequacao?: PlanoAdequacao;

  @Expose()
  @ApiProperty()
  @ManyToMany(() => Documento, { cascade: true })
  @JoinTable({
    name: 'TB_DOCUMENTOS_RETORNOS_ANALISE',
    joinColumn: { name: 'ID_RETORNO_ANALISE' },
    inverseJoinColumn: { name: 'ID_DOCUMENTO' },
  })
  documentos?: Documento[];

  @Expose()
  @CreateDateColumn({
    name: 'DATA_CRIACAO',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dataCriacao: string;

  @Expose()
  @UpdateDateColumn({
    name: 'DATA_ATUALIZACAO',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dataAtualizacao: string;

  @ApiProperty()
  @Column({ name: 'CONTESTACAO_ID' })
  contestacaoId: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'ERRO_AGROTOOLS' })
  erroAgrotools: string;
}
