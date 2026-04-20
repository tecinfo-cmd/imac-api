import { Expose, Transform } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated, JoinColumn,
  ManyToOne, OneToMany, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RetornoAgrotools } from './retorno-agrotools.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Cidade } from './cidade.entity';
import { Propriedade } from '../../propriedade-prem/entities/propriedade.entity';
import { PagamentoVoucher } from './pagamento-voucher.entity';

export enum StatusSolicitacaoEligibilidade {
  Pendente = 'PENDENTE',
  Aprovado = 'APROVADO',
  Recusado = 'RECUSADO',
  Consultado = 'CONSULTADO'
}

@Entity({ schema: 'IMAC', name: 'TB_SOLICITACOES_ELEGIBILIDADES' })
export class SolicitacaoElegibilidade {

  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'CAR_FEDERAL', length: 43 })
  @Transform(({ value }: { value: string }) => value?.replace(/[.]/g, ''), { toClassOnly: true })
  carFederal: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'TELEFONE', length: 13 })
  @Transform(({ value }: { value: string }) => value?.replace(/[^\d]/g, ''), { toClassOnly: true })
  telefone: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'EMAIL', length: 255 })
  email: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'STATUS', default: () => StatusSolicitacaoEligibilidade.Pendente })
  status: string;

  @ApiProperty()
  @Column({ name: 'TOKEN', type: 'uuid' })
  @Generated("uuid")
  token: string;


  @ApiProperty()
  @Column({ name: 'TRANSACTION_ID'})
  transactionId: string;

  @ApiProperty()
  @Column({ name: 'CONFIRMACAO_EMAIL'})
  confirmacaoEmail: string;

  @Expose()
  @ApiProperty()
  @ManyToOne(() => RetornoAgrotools)
  @JoinColumn({ name: 'ID_RETORNO_AGROTOOLS' })
  retornoAgrotools: RetornoAgrotools;

  @Expose()
  @ApiProperty()
  @Column({ name: 'NOME_PROPRIEDADE' })
  nomePropriedade: string;

  @ApiProperty()
  @Column({ name: 'CODIGO_MUNICIPIO' })
  codigoMunicipio?: number;

  @Expose()
  @ApiProperty()
  @ManyToOne(() => Cidade)
  @JoinColumn({ name: 'CODIGO_MUNICIPIO', referencedColumnName: 'codigo' })
  cidade: Cidade;

  @Expose()
  @ApiProperty({ type: () => Propriedade })
  @OneToOne(() => Propriedade, (propriedade) => propriedade.solicitacaoElegibilidade)
  propriedade: Propriedade


  @ApiProperty()
  @Column({ name: 'CPF_CNPJ', length: 255 })
  cpfCnpj: string;

  @CreateDateColumn({ name: 'DATA_CRIACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataCriacao: string;

  @UpdateDateColumn({ name: 'DATA_ATUALIZACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataAtualizacao: string;

  @Expose()
  carEstadual?: string;

}
