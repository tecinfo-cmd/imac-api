import { ApiProperty } from '@nestjs/swagger';
import { Documento } from '../../../shared/entity/documento.entity';
import { Expose } from 'class-transformer';

export class EnviarArquivosContestacaoAutorizacaoSupressaoResponse {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  documentos: Documento[];
}