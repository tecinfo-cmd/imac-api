import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ schema: 'IMAC', name: 'TB_DOCUMENTOS_ORIENTATIVOS' })
export class DocumentoOrientativo {
  @ApiProperty()
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @ApiProperty()
  @Column({ name: 'TITULO', length: 255 })
  titulo: string;

  @ApiProperty()
  @Column({ name: 'DESCRICAO', type: 'text' })
  descricao: string;

  @ApiProperty()
  @Column({ name: 'TIPO', length: 100 })
  tipo: string;

  @ApiProperty()
  @Column({ name: 'URL_ARQUIVO', nullable: true })
  urlArquivo: string;

  @ApiProperty()
  @Column({ name: 'NOME_ARQUIVO', nullable: true })
  nomeArquivo: string;

  @ApiProperty()
  @Column({ name: 'NOME_ARQUIVO_ORIGINAL', nullable: true })
  nomeArquivoOriginal: string;

  @ApiProperty()
  @Column({ name: 'URL_CAPA_ARQUIVO' })
  urlCapaArquivo: string;

  @ApiProperty()
  @Column({ name: 'NOME_CAPA_ARQUIVO' })
  nomeCapaArquivo: string;

  @ApiProperty()
  @Column({ name: 'NOME_ORIGINAL_CAPA_ARQUIVO' })
  nomeOriginalCapaArquivo: string;

  @ApiProperty()
  @Column({ name: 'ATIVO', default: false })
  ativo: boolean;

  @ApiProperty()
  @Column({ name: 'CRIADO_POR' })
  criadoPor: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'DATA_CRIACAO', type: 'timestamp' })
  dataCriacao: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'DATA_ATUALIZACAO', type: 'timestamp' })
  dataAtualizacao: Date;
}