import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { SituacaoPlanoAdequacaoEnum } from "../enum/situacao-plano-adequacao.enum";
import { Documento } from "../../../shared/entity/documento.entity";
import { RetornoAnaliseEntity } from "../../../agrotools/entities/retorno-analise.entity";
import { ResponsavelTecnico } from "../../../responsavel-tecnico/entities/responsavel-tecnico.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

@Entity({ schema: 'IMAC', name: 'TB_PLANOS_ADEQUACAO' })
export class PlanoAdequacao {
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
  situacao: SituacaoPlanoAdequacaoEnum;

  @Expose()
  @ApiProperty()
  @Column({ name: 'OBSERVACAO' })
  observacao?: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'WKT' })
  wkt?: string;

  @Expose()
  @ApiProperty()
  @ManyToMany(() => Documento, { cascade: true})
  @JoinTable(
    {
      name: 'TB_DOCUMENTOS_PLANOS_ADEQUACAO',
      joinColumn: { name: 'ID_PLANO_ADEQUACAO' },
      inverseJoinColumn: { name: 'ID_DOCUMENTO' }
    }
  )
  documentos?: Documento[];

  @Expose()
  @Column({ name: 'ID_ANALISE'})
  idAnalise: number;

  @Expose()
  @Column({ name: 'ID_RESPONSAVEL_TECNICO'})
  idResponsavelTecnico: number;

  @Expose()
  @ApiProperty()
  @ManyToOne(() => ResponsavelTecnico)
  @JoinColumn({ name: 'ID_RESPONSAVEL_TECNICO' })
  responsavelTecnico: ResponsavelTecnico;

  @Expose()
  @OneToOne(() => RetornoAnaliseEntity)
  @JoinColumn({ name: 'ID_ANALISE' })
  analiseSocioambiental: RetornoAnaliseEntity

  @Expose()
  @CreateDateColumn({ name: 'DATA_CRIACAO' })
  dataCriacao: Date;

  @Expose()
  @UpdateDateColumn({ name: 'DATA_ATUALIZACAO' })
  dataAtualizacao: Date;

  @Expose()
  @ApiProperty()
  @Column({ name: 'ADEQUACAO_ID' })
  adequacaoId?: string;
}