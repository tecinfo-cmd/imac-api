import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { CNPJValidator } from '../../elegibilidade/validators/cnpj';
import { RetornoAnaliseEntity } from '../../agrotools/entities/retorno-analise.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { VoucherEntity } from './voucher.entity';
import { Expose } from 'class-transformer';

export enum StatusFrigorifico{
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
}

@Entity({ schema: 'IMAC', name: 'TB_FRIGORIFICO' })
export class Frigorifico {

  @PrimaryGeneratedColumn({
    name: 'ID'
  })
  id: number;

  @ApiProperty()
  @Column({ name: 'RAZAO_SOCIAL' })
  razaoSocial: string;

  @ApiProperty()
  @Column({ name: 'NOME_FANTASIA' })
  nomeFantasia: string;

  @ApiProperty()
  @Column({ name: 'IE' })
  ie: string;

  @ApiProperty()
  @Column({ name: 'CNPJ' })
  @Validate(CNPJValidator)
  cnpj: string;

  @ApiProperty()
  @Column({ name: 'TELEFONE' })
  telefone: string;

  @ApiProperty()
  @Column({ name: 'DATA_CRIACAO' })
  dataCriacao: string;

  @ApiProperty()
  @Column({ name: 'CEP' })
  cep: string;

  @ApiProperty()
  @Column({ name: 'ENDERECO' })
  endereco: string;

  @ApiProperty()
  @Column({ name: 'MUNICIPIO_UF' })
  municipio: string;

  @ApiProperty()
  @Column({ name: 'STATUS' })
  status: string;

  @ApiProperty()
  @Column({ name: 'URL_TERMO_COOPERACAO' })
  urlTermoCooperacao: string;

  @ApiProperty()
  @Column({ name: 'QTD_VOUCHER' })
  quantidadeVoucher: number;

  @ApiProperty()
  @Column({ name: 'DATA_ATUALIZACAO' })
  dataAtualizacao: string;

  @ApiProperty()
  @Column({ name: 'EMAIL' })
  email: string;

  @ApiProperty()
  @Column({ name: 'DATA_INICIO_VIGENCIA' })
  dataInicioVigencia: string;

  @ApiProperty()
  @Column({ name: 'DATA_FIM_VIGENCIA' })
  dataFimVigencia: string;


  @ApiProperty()
  @OneToMany(() => Usuario, (usuario) => usuario.frigorifico)
  usuarios: Usuario[]

  @ApiProperty()
  @OneToMany(() => VoucherEntity, (voucher) => voucher.frigorifico)
  vouches: VoucherEntity[]

}
