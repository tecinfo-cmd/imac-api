import { Usuario } from '../../usuario/entities/usuario.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';

@Entity({ schema: 'IMAC', name: 'TB_TOKENS_REDEFINICAO_SENHA' })
export class TokenRedefinicaoSenha {
  @PrimaryGeneratedColumn({ name: "ID" })
  id: number;

  @Column({ name: 'TOKEN' })
  token: string;

  @Column({ name: 'EXPIRA_EM' })
  expiraEm: Date;

  @Column({ name: 'UTILIZADO', default: false })
  utilizado: boolean;


  @CreateDateColumn({ name: 'DATA_CRIACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataCriacao: Date;

  @UpdateDateColumn({ name: 'DATA_ATUALIZACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataAtualizacao: Date;
    
  @ManyToOne(() => Usuario, usuario => usuario.tokensRedefinicaoSenha, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'USUARIO_ID' })
  usuario: Usuario;
}