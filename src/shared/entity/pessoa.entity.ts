import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Entity({ schema: 'IMAC', name: 'TB_PESSOA' })
export class Pessoa {

  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'CPF_CNPJ' })
  cpfCnpj: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'NOME' })
  nome: string;

  @ApiProperty()
  @Column({ name: 'NOME_MAE' })
  nomeMae: string;

  @ApiProperty()
  @Column({ name: 'NOME_PAI' })
  nomePai: string;

  @ApiProperty()
  @Column({ name: 'SEXO' })
  sexo: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'DATA_NASCIMENTO' })
  dataNascimento: string;

  @ApiProperty()
  @Column({ name: 'NUMR_CELULAR' })
  telefone: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'EMAIL' })
  email: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'TIPO_PESSOA' })
  tipoPessoa: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'RG_INSCRICAO_SOCIAL' })
  rgInscricaoSocial: string;

  @ApiProperty()
  @Column({ name: 'ID_USUARIO_AGROTOOLS' })
  idUsuarioAgrotools: number;
}
