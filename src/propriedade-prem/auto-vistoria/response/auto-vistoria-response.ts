import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { FormularioVistoriaResponse } from './formulario-vistoria-response';
import { PropriedadeVistoriaResponse } from './propriedade-vistoria.response';

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

export class AutoVistoriaResponse {

  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  dataInicio: string;

  @ApiProperty()
  @Expose()
  dataTermino: string;

  @ApiProperty()
  @Expose()
  statusVistoria: string;

  @ApiProperty()
  @Expose()
  vistoria: string;

  @ApiProperty({type: PropriedadeVistoriaResponse })
  @Expose()
  @Type(() => PropriedadeVistoriaResponse)
  propriedade: PropriedadeVistoriaResponse;

  @ApiProperty({type: FormularioVistoriaResponse })
  @Expose()
  @Type(() => FormularioVistoriaResponse)
  formularios: FormularioVistoriaResponse[];

  @Expose()
  @ApiProperty({ type: DocumentoDTO, isArray: true })
  @Type(() => DocumentoDTO)
  documentos: DocumentoDTO[];
}
