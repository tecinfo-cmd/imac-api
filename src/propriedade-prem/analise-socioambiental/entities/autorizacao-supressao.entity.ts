import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TipoAutorizacaoSupressao } from "./tipo-autorizacao-supressao.entity";
import { OrgaoEmissorAutorizacaoSupressao } from "./orgao-emissor-autorizacao-supressao.entity";
import { Documento } from "../../../shared/entity/documento.entity";
import { ApiProperty } from "@nestjs/swagger";
import { ContestacaoAutorizacaoSupressao } from "./contestacao-autorizacao-supressao.entity";
import { Expose } from "class-transformer";

@Entity({ schema: 'IMAC', name: 'TB_AUTORIZACOES_SUPRESSOES' })
export class AutorizacaoSupressao {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'DATA_EMISSAO' })
  dataEmissao: Date;

  @Expose()
  @ApiProperty()
  @Column({ name: 'DATA_VALIDADE' })
  dataValidade: Date;

  @Expose()
  @ApiProperty()
  @ManyToOne(() => TipoAutorizacaoSupressao)
  @JoinColumn({name: 'ID_TIPO'})
  tipo: TipoAutorizacaoSupressao;

  @Expose()
  @ApiProperty()
  @Column({ name: 'ID_TIPO' })
  idTipo: number;
  
  @Expose()
  @ApiProperty()
  @ManyToOne(() => OrgaoEmissorAutorizacaoSupressao)
  @JoinColumn({ name: 'ID_ORGAO_EMISSOR' })
  orgaoEmissor: OrgaoEmissorAutorizacaoSupressao;

  @Expose()
  @Column({ name: 'ID_ORGAO_EMISSOR' })
  idOrgaoEmissor: number;

  @Expose()
  @ApiProperty()
  @Column('decimal', { name: 'AREA_AUTORIZADA_HA' })
  areaAutorizadaParaSupressaoHa: number;

  @Expose()
  @Column({ name: 'ID_CONTESTACAO_AUTORIZACAO_SUPRESSAO'})
  idContestacaoAutorizacaoSupressao: number;

  @Expose()
  @ManyToOne(() => ContestacaoAutorizacaoSupressao)
  @JoinColumn({ name: 'ID_CONTESTACAO_AUTORIZACAO_SUPRESSAO' })
  contestacaoAutorizacaoSupressao: ContestacaoAutorizacaoSupressao

  @Expose()
  @ApiProperty()
  @ManyToMany(() => Documento, { cascade: true })
  @JoinTable(
    {
      name: 'TB_DOCUMENTOS_AUTORIZACOES_SUPRESSOES',
      joinColumn: { name: 'ID_AUTORIZACAO_SUPRESSAO' },
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