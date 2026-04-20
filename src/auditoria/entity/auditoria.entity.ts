import { ApiProperty } from "@nestjs/swagger";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from "typeorm";

@Entity({ schema: 'IMAC', name: 'TB_AUDITORIA' })
export class Auditoria {
  @ApiProperty()
  @PrimaryGeneratedColumn({ name: 'ID', type: 'bigint' })
  id: number;

  @ApiProperty()
  @Column({ name: 'ID_REQUEST', type: 'text', nullable: true })
  idRequest: string;

  @ApiProperty()
  @Column({ name: 'METODO', type: 'varchar', length: 10, nullable: true })
  metodo: string;

  @ApiProperty()
  @Column({ name: 'URL', type: 'text', nullable: true })
  url: string;

  @ApiProperty()
  @Column({ name: 'BASE_URL', type: 'text', nullable: true })
  baseUrl: string;

  @ApiProperty()
  @Column({ name: 'CAMINHO', type: 'text', nullable: true })
  caminho: string;

  @ApiProperty()
  @Column({ name: 'STATUS_HTTP', type: 'int', nullable: true })
  statusHttp: number;

  @ApiProperty()
  @Column({ name: 'IP_ORIGEM', type: 'varchar', length: 50, nullable: true })
  ipOrigem: string;

  @ApiProperty()
  @Column({ name: 'USER_AGENT', type: 'text', nullable: true })
  userAgent: string;

  @ApiProperty()
  @Column({ name: 'TIPO_CONTEUDO', type: 'varchar', length: 100, nullable: true })
  tipoConteudo: string;

  @ApiProperty()
  @Column({ name: 'AUTORIZACAO', type: 'text', nullable: true })
  autorizacao: string;

  @ApiProperty()
  @Column({ name: 'PARAMETROS_QUERY', type: 'jsonb', nullable: true })
  parametrosQuery: any;

  @ApiProperty()
  @Column({ name: 'PARAMETROS_ROTA', type: 'jsonb', nullable: true })
  parametrosRota: any;

  @ApiProperty()
  @Column({ name: 'CORPO_REQUISICAO', type: 'jsonb', nullable: true })
  corpoRequisicao: any;

  @ApiProperty()
  @Column({ name: 'CORPO_RESPOSTA', type: 'jsonb', nullable: true })
  corpoResposta: any;

  @ApiProperty()
  @Column({ name: 'ERRO', type: 'jsonb', nullable: true })
  erro: any;

  @ApiProperty()
  @Column({ name: 'DURACAO_MS', type: 'int', nullable: true })
  duracaoMs: number;

  @ApiProperty()
  @Column({ name: 'DATA_HORA', type: 'timestamp', nullable: true })
  dataHora: Date;
}
