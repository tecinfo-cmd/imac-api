import { Expose, plainToInstance, Transform } from 'class-transformer';
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
import { Proprietario } from './proprietario.entity';
import { Endereco } from '../../endereco/entities/endereco.entity';
import { CicloProducao } from './ciclo-producao.entity';
import { AtividadePrincipal } from './atividade-principal.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Cidade } from '../../elegibilidade/entities/cidade.entity';
import { SolicitacaoElegibilidade } from '../../elegibilidade/entities/solicitacao-elegibilidade.entity';
import { Documento } from '../../shared/entity/documento.entity';
import { TerritorioEntity } from '../../agrotools/entities/territorio.entity';
import { RetornoAnaliseEntity } from '../../agrotools/entities/retorno-analise.entity';
import { Etapas, StatusEtapas } from '../enum/etapas-status-propriedade.const';
import { PagamentoMulta } from '../../cobranca/entities/pagamento-multa.entities';
import { VoucherEntity } from '../../frigorico/entities/voucher.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { DocumentoResponseDto } from '../dto/documento-response.dto';


@Entity({ schema: 'IMAC', name: 'TB_PROPRIEDADES' })
export class Propriedade {
  @Expose()
  @ApiProperty()
  @PrimaryGeneratedColumn({
    name: 'ID',
  })
  id: number;

  @ApiProperty()
  @Expose()
  @Column({
    name: 'CAR_FEDERAL',
    length: 43,
    unique: true,
  })
  @Transform(({ value }: { value: string }) => value?.replace(/[.]/g, ''), {
    toClassOnly: true,
  })
  carFederal: string;

  @ApiProperty()
  @Expose()
  @ManyToMany(() => Proprietario)
  @JoinTable({
    name: 'TB_PROPRIEDADE_PROPRIETARIOS_TB_PROPRIETARIOS',
    joinColumn: { name: 'ID_PROPRIEDADE' },
    inverseJoinColumn: { name: 'ID_PROPRIETARIO' },
  })
  proprietarios: Proprietario[];

  @ApiProperty()
  @Expose()
  @Column({ name: 'NOME_PROPRIEDADE' })
  nomePropriedade: string;

  @Column({ name: 'CODIGO_MUNICIPIO' })
  codigoMunicipio?: number;

  @ApiProperty()
  @Expose()
  @ManyToOne(() => Cidade)
  @JoinColumn({ name: 'CODIGO_MUNICIPIO', referencedColumnName: 'codigo' })
  cidade: Cidade;

  @ApiProperty()
  @Expose()
  @ManyToOne(() => Endereco, { cascade: true })
  @JoinColumn({ name: 'ID_ENDERECO' })
  endereco?: Endereco;

  @ApiProperty()
  @OneToOne(
    () => RetornoAnaliseEntity,
    (retornoAnalise) => retornoAnalise.propriedade,
  )
  analise?: RetornoAnaliseEntity;

  @Column({ name: 'ID_SOLICITACAO' })
  idSolicitacaoElegibilidade?: number;

  @Expose()
  @ApiProperty({ type: () => SolicitacaoElegibilidade })
  @ManyToOne(() => SolicitacaoElegibilidade)
  @JoinColumn({ name: 'ID_SOLICITACAO' })
  solicitacaoElegibilidade?: SolicitacaoElegibilidade;

  @Column({ name: 'ID_CICLO_PRODUCAO' })
  idClicloProducao?: number;

  @Column({ name: 'ID_ATIVIDADE_PRINCIPAL' })
  idAtividadePrincipal?: number;

  @Expose()
  @ApiProperty()
  @ManyToOne(() => CicloProducao)
  @JoinColumn({ name: 'ID_CICLO_PRODUCAO' })
  cicloProducao?: CicloProducao;

  @Expose()
  @ApiProperty()
  @ManyToOne(() => AtividadePrincipal)
  @JoinColumn({ name: 'ID_ATIVIDADE_PRINCIPAL' })
  atividadePrincipal?: AtividadePrincipal;

  @Expose()
  @ApiProperty()
  @Column({
    name: 'GEOMETRY',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  geometry?: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'VOUCHER' })
  voucher: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'HECTARES' })
  tamanhoPropriedade: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'NUMERO_PROPRIETARIOS' })
  numeroProprietarios?: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'STATUS_VOUCHER' })
  statusVoucher: boolean;

  @Expose()
  @ApiProperty()
  @Column({ name: 'MODULO_FISCAL', type: 'numeric', precision: 10, scale: 2 })
  moduloFiscal: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'TERMO_ADEQUACAO_ACEITO' })
  termoAdequacaoAceito: boolean;

  @ApiProperty()
  @Column({ name: 'ID_TERMO_COMPROMISSO' })
  idTermoCompromisso?: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'URL_TERMO_COMPROMISSO' })
  urlTermoCompromisso?: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'ETAPA', default: Etapas.Credenciamento })
  etapa?: string;

  @Expose()
  @ApiProperty()
  @Column({
    name: 'STATUS',
    default: StatusEtapas.Credenciamento.VoucherPendente,
  })
  status?: string;

  @Column({ name: 'DATA_CRIACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataCriacao?: string;

  @Column({ name: 'DATA_ATUALIZACAO', default: () => 'CURRENT_TIMESTAMP' })
  dataAtualizacao?: string;

  @Expose()
  @ApiProperty({ type: () => [DocumentoResponseDto] })
  @ManyToMany(() => Documento)
  @JoinTable({
    name: 'TB_DOCUMENTOS_PROPRIEDADES',
    joinColumn: { name: 'ID_PROPRIEDADE' },
    inverseJoinColumn: { name: 'ID_DOCUMENTO' },
  })
  @Transform(({ value: documentos, obj }) => {
    if (!documentos) return [];
    const analistaId = obj.analista?.id;
    const documentosComFlag = documentos.map((doc) => ({
      ...doc,
      enviadoPorAnalista: doc.idUsuarioUpload === analistaId,
    }));
    return plainToInstance(DocumentoResponseDto, documentosComFlag, {
      excludeExtraneousValues: true,
    });
  })
  documentos: DocumentoResponseDto[];

  @Expose()
  @ApiProperty()
  @OneToMany(
    () => PagamentoMulta,
    (pagamentoMulta) => pagamentoMulta.propriedade,
  )
  pagamentoMultas: PagamentoMulta[];

  @Expose()
  @ApiProperty()
  @OneToMany(() => TerritorioEntity, (territorio) => territorio.propriedade)
  territorios: TerritorioEntity[];

  @Expose()
  @ApiProperty()
  @OneToMany(
    () => RetornoAnaliseEntity,
    (retornoAnalise) => retornoAnalise.propriedade,
  )
  retornoAnalises: RetornoAnaliseEntity[];

  @Expose()
  @ApiProperty()
  @OneToMany(() => VoucherEntity, (voucher) => voucher.propriedade)
  vouches: VoucherEntity[];

  @Expose()
  @ApiProperty()
  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'ID_USUARIO_ANALISTA' })
  analista: Usuario;

  @Column({ name: 'ID_USUARIO_ANALISTA' })
  idAnalista?: number;

  @Expose()
  @ApiProperty()
  @Column({ name: 'CAR_ESTADUAL' })
  carEstadual: string;

  @Expose()
  @ApiProperty()
  @Column({ name: 'CONTESTAR_DETECCOES' })
  contestarDeteccoes: boolean;

  @Expose()
  @ApiProperty()
  @Column({ name: 'CONFIRMAR_DETECCOES' })
  confirmarDeteccoes: boolean;

  @Expose()
  @ApiProperty()
  @Column({ name: 'TERMO_ASSINADO' })
  termoAssinado: boolean;

  @Expose()
  @ApiProperty()
  @Column({ name: 'PROPOR_NOVA_AREA' })
  proporNovaArea: boolean;

  @Expose()
  @ApiProperty()
  @Column({ name: 'CONFIRMAR_ESTRATEGIA' })
  confirmarEstrategia: boolean;
}
