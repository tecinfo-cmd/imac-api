import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { SituacaoContestacaoEnum } from "../enum/situacao-contestacao.enum";
import { Documento } from "../../../shared/entity/documento.entity";
import { RetornoAnaliseEntity } from "../../../agrotools/entities/retorno-analise.entity";
import { ResponsavelTecnico } from "../../../responsavel-tecnico/entities/responsavel-tecnico.entity";
import { ApiProperty } from "@nestjs/swagger";
import { AutorizacaoSupressao } from "./autorizacao-supressao.entity";
import { Expose } from "class-transformer";

@Entity({ schema: 'IMAC', name: 'TB_CONTESTACOES_AUTORIZACAO_SUPRESSAO' })
export class ContestacaoAutorizacaoSupressao {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'MOTIVO' })
  motivo: string;
  
  @Expose()
  @ApiProperty()
  @Column({ name: 'SITUACAO' })
  situacao: SituacaoContestacaoEnum;

  @Expose()
  @ApiProperty()
  @Column({ name: 'OBSERVACAO' })
  observacao?: string;

  @Expose()
  @ApiProperty()
  @OneToMany(() => AutorizacaoSupressao, autorizacaoSupressao => autorizacaoSupressao.contestacaoAutorizacaoSupressao, { cascade: true })
  autorizacoesSupressoes: AutorizacaoSupressao[];
  
  @Expose()
  @Column({ name: 'ID_ANALISE'})
  idAnalise: number;

  @Expose()
  @OneToOne(() => RetornoAnaliseEntity)
  @JoinColumn({ name: 'ID_ANALISE' })
  analiseSocioambiental: RetornoAnaliseEntity

  @Expose()
  @Column({ name: 'ID_RESPONSAVEL_TECNICO'})
  idResponsavelTecnico: number;

  @Expose()
  @ApiProperty()
  @ManyToOne(() => ResponsavelTecnico)
  @JoinColumn({ name: 'ID_RESPONSAVEL_TECNICO' })
  responsavelTecnico: ResponsavelTecnico;

  @Expose()
  @ApiProperty()
  @ManyToMany(() => Documento, { cascade: true})
  @JoinTable(
    {
      name: 'TB_DOCUMENTOS_CONTESTACOES_AUTORIZACAO_SUPRESSAO',
      joinColumn: { name: 'ID_CONTESTACAO_AUTORIZACAO_SUPRESSAO' },
      inverseJoinColumn: { name: 'ID_DOCUMENTO' }
    }
  )
  documentos: Documento[];

  @Expose()
  @CreateDateColumn({ name: 'DATA_CRIACAO' })
  dataCriacao: Date;

  @Expose()
  @UpdateDateColumn({ name: 'DATA_ATUALIZACAO' })
  dataAtualizacao: Date;
}