import { ApiProperty } from '@nestjs/swagger';
import { Endereco } from '../../endereco/entities/endereco.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity({ schema: 'IMAC', name: 'TB_RESPONSAVEL_TECNICO' })
export class ResponsavelTecnico {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn({
    name: 'ID'
  })
  id: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'NOME' })
  nome: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'CPF' })
  cpf: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'PROFISSAO' })
  profissao: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'REGISTRO_CREA' })
  registroCrea: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'TELEFONE' })
  telefone: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'EMAIL' })
  email: string;

  @Expose()
  @ApiProperty()
  @OneToOne(() => Endereco, { cascade: true })
  @JoinColumn({ name: 'ID_ENDERECO' })
  endereco: Endereco;

  @Expose()
  @Column({ name: 'DATA_CRIACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataCriacao: string;

  @Expose()
  @Column({ name: 'DATA_ATUALIZACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataAtualizacao: string;
}
