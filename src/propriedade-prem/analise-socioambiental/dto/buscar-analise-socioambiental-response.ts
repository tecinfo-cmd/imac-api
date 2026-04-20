import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponsavelTecnicoResponse } from '../../../responsavel-tecnico/dto/responsavel-tecnico-response';

export class DocumentoDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  nomeArquivo: string;

  @Expose()
  @ApiProperty()
  urlArquivo: string;

  @Expose()
  @ApiProperty()
  tipo: string;
}

export class DeteccoesAnaliseEntityDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  tipo: string;

  @Expose()
  @ApiProperty()
  area_ha: string;

  @Expose()
  @ApiProperty()
  idAgrotools: number;
}

export class TipoAutorizacaoSupressaoDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  nome: string;
}

export class OrgaoEmissorAutorizacaoSupressaoDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  nome: string;
}

export class AutorizacaoSupressaoDTO {
  @Expose()
  @ApiProperty({ type: TipoAutorizacaoSupressaoDTO })
  @Type(() => TipoAutorizacaoSupressaoDTO)
  tipo: TipoAutorizacaoSupressaoDTO;

  @Expose()
  @ApiProperty({ type: OrgaoEmissorAutorizacaoSupressaoDTO })
  @Type(() => OrgaoEmissorAutorizacaoSupressaoDTO)
  orgaoEmissor: OrgaoEmissorAutorizacaoSupressaoDTO;

  @Expose()
  @ApiProperty()
  dataEmissao: Date;

  @Expose()
  @ApiProperty()
  dataValidade: Date;

  @Expose()
  @ApiProperty()
  areaAutorizadaParaSupressaoHa: number;

  @Expose()
  @ApiProperty({ type: DocumentoDTO, isArray: true })
  @Type(() => DocumentoDTO)
  documentos: DocumentoDTO[];
}

export class ContestacaoAutorizacaoSupressaoDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  idAnalise: number;

  @Expose()
  @ApiProperty()
  @Type(() => ResponsavelTecnicoResponse)
  responsavelTecnico: ResponsavelTecnicoResponse;

  @Expose()
  @ApiProperty()
  motivo: string;

  @Expose()
  @ApiProperty()
  situacao: string;

  @Expose()
  @ApiProperty()
  observacao?: string;

  @Expose()
  @ApiProperty({ type: AutorizacaoSupressaoDTO, isArray: true })
  @Type(() => AutorizacaoSupressaoDTO)
  autorizacoesSupressoes: AutorizacaoSupressaoDTO[];

  @Expose()
  @ApiProperty({ type: DocumentoDTO, isArray: true })
  @Type(() => DocumentoDTO)
  documentos: DocumentoDTO[];
}

export class ContestacaoLaudoDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  idAnalise: number;

  @Expose()
  @ApiProperty()
  @Type(() => ResponsavelTecnicoResponse)
  responsavelTecnico: ResponsavelTecnicoResponse;

  @Expose()
  @ApiProperty()
  motivo: string;

  @Expose()
  @ApiProperty()
  situacao: string;

  @Expose()
  @ApiProperty()
  observacao?: string;

  @Expose()
  @ApiProperty({ type: DocumentoDTO, isArray: true })
  @Type(() => DocumentoDTO)
  documentos: DocumentoDTO[];
}

export class PlanoAdequacaoDTO {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  idAnalise: number;

  @Expose()
  @ApiProperty()
  @Type(() => ResponsavelTecnicoResponse)
  responsavelTecnico: ResponsavelTecnicoResponse;

  @Expose()
  @ApiProperty()
  motivo: string;

  @Expose()
  @ApiProperty()
  situacao: string;

  @Expose()
  @ApiProperty({ type: DocumentoDTO, isArray: true })
  @Type(() => DocumentoDTO)
  documentos: DocumentoDTO[];
}

export class BuscarAnaliseSocioambientalResponse {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  urlRelatorio: string;

  @Expose()
  @ApiProperty()
  idPropriedade: number;

  @Expose()
  @ApiProperty()
  areaDesmatadaTotal: number;

  @Expose()
  @ApiProperty()
  moduloFiscal: number;

  @Expose()
  @ApiProperty()
  valorMulta: number;

  @Expose()
  @ApiProperty()
  descontoPercentual: number;

  @Expose()
  @ApiProperty({ type: DeteccoesAnaliseEntityDTO, isArray: true })
  @Type(() => DeteccoesAnaliseEntityDTO)
  deteccoes: DeteccoesAnaliseEntityDTO[];

  @Expose()
  @ApiProperty({ type: ContestacaoAutorizacaoSupressaoDTO })
  @Type(() => ContestacaoAutorizacaoSupressaoDTO)
  contestacaoAutorizacaoSupressao: ContestacaoAutorizacaoSupressaoDTO;

  @Expose()
  @ApiProperty({ type: ContestacaoLaudoDTO })
  @Type(() => ContestacaoLaudoDTO)
  contestacaoLaudo: ContestacaoLaudoDTO;

  @Expose()
  @ApiProperty({ type: PlanoAdequacaoDTO })
  @Type(() => PlanoAdequacaoDTO)
  planoAdequacao: PlanoAdequacaoDTO;

  @Expose()
  @ApiProperty({ type: DocumentoDTO, isArray: true })
  @Type(() => DocumentoDTO)
  documentos: DocumentoDTO[];
}
