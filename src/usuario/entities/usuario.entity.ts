import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pessoa } from '../../shared/entity/pessoa.entity';
import { Exclude, Expose } from 'class-transformer';
import { StatusUsuario } from '../enums/usuario-status';
import { TokenRedefinicaoSenha } from '../../auth/entities/token-redefinicao-senha.entity';
import { UsuarioTipo } from '../enums/usuario-tipo';
import { Role } from '../../role/entities/role.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Cidade } from '../../elegibilidade/entities/cidade.entity';
import { Frigorifico } from '../../frigorico/entities/frigorifico.entity';

@Entity({ schema: 'IMAC', name: 'TB_USUARIOS' })
export class Usuario {
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  @Expose()
  id: number;

  @ApiProperty()  
  @Expose()
  @OneToOne(() => Pessoa)
  @JoinColumn({ name: 'ID_PESSOA' })
  pessoa: Pessoa;

  @Exclude()
  @OneToMany(() => TokenRedefinicaoSenha, (token) => token.usuario)
  tokensRedefinicaoSenha: TokenRedefinicaoSenha[];

  @Expose()
  @Column({ name: 'EMAIL', length: 100 })
  email: string;

  @Exclude()
  @Column({ name: 'SENHA', length: 100 })
  senha: string;

  @Exclude()
  @Column({ name: 'CONFIRMACAO_SENHA', length: 100 })
  confirmacaoSenha: string;

  @Expose()
  @Column({ name: 'ACEITOU_TERMOS' })
  aceitouTermos: boolean;

  @Expose()
  @Column({ name: 'CARGO' })
  cargo: string;

  @Expose()
  @Column({ name: 'DATA_CRIACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataCriacao: string;

  @Column({ name: 'DATA_ATUALIZACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataAtualizacao: string;

  @Exclude()
  @Column({ name: 'CEP' })
  cep: string;

  @Exclude()
  @Column({ name: 'NUMERO' })
  numero: string;

  @Exclude()
  @Column({ name: 'LOGRADOURO' })
  logradouro: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: StatusUsuario,
    name: 'STATUS'
  })
  status?: StatusUsuario;

  @Column({ name: 'RGIE' })
  rgie: string;

  @Column({ name: 'PROFISSAO' })
  profissao: string;

  @ManyToMany(() => Role, { cascade: true, eager: true })
  @JoinTable({
    name: 'TB_USUARIO_ROLE',
    joinColumn: { name: 'ID_USUARIO', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'ID_ROLE', referencedColumnName: 'id' },
  })
  roles: Role[];

  @Column({
    type: 'enum',
    enum: UsuarioTipo,
    name: 'TIPO'
  })
  tipo?: UsuarioTipo;

  @ApiProperty()
  @Column({name: "ID_FRIGORIFICO"})
  idFrigorifico: number;

  @Column({ name: 'ERRO_INTEGRACAO' })
  erroIntegracao?: string;

  @ManyToOne(() => Frigorifico, (frigorifico) => frigorifico.usuarios)
  @JoinColumn({ name: 'ID_FRIGORIFICO' })
  frigorifico: Frigorifico;

  quantidadePropriedade?: number;
  usuarioAnalista?:  string;

}
