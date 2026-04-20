import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { SituacaoContestacaoEnum } from "../enum/situacao-contestacao.enum";
import { Documento } from "../../../shared/entity/documento.entity";
import { RetornoAnaliseEntity } from "../../../agrotools/entities/retorno-analise.entity";
import { ResponsavelTecnico } from "../../../responsavel-tecnico/entities/responsavel-tecnico.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

@Entity({ schema: 'IMAC', name: 'TB_CONTESTACOES_LAUDO' })
export class ContestacaoLaudo {
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
      name: 'TB_DOCUMENTOS_CONTESTACOES_LAUDO',
      joinColumn: { name: 'ID_CONTESTACAO_LAUDO' },
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
