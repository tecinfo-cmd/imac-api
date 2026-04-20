import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseUploadRequest } from '../../../shared/dto/base-upload-request.dto';
import { SituacaoContestacaoEnum } from '../enum/situacao-contestacao.enum';
import { Type } from 'class-transformer';

export class Poligono {
  @ApiProperty({
    name: 'poligono',
    required: true,
    type: String,
  })
  @IsString()
  poligono: string;

  @ApiProperty({
    name: 'idTad',
    required: true,
    type: Number,
  })
  @IsNumber()
  idTad: number;

  @ApiProperty({
    name: 'areaARegenerar',
    required: true,
    type: Number,
  })
  @IsNumber()
  areaARegenerar: number;

  @ApiProperty({
    name: 'tipo',
    required: true,
    enum: ['Contestação por laudo', 'Contestação de autorização de supressão'],
    type: String,
  })
  @IsString()
  tipo: 'Contestação por laudo' | 'Contestação de autorização de supressão';

  @ApiProperty({
    name: 'wkt',
    required: true,
    type: String,
  })
  @IsString()
  //@IsWktPolygon()
  wkt: string;

  @ApiProperty({
    name: 'tipoDeteccao',
    required: true,
    type: Number,
  })
  @IsNumber()
  tipoDeteccao?: number;
}

const statusValidosParaParecer = Object.values(SituacaoContestacaoEnum).filter(
  (status) => status !== SituacaoContestacaoEnum.EM_ANALISE,
);

export class CriarParecerContestacaoRequest extends BaseUploadRequest {
  @ApiProperty({
    name: 'status',
    required: true,
    enum: statusValidosParaParecer,
    enumName: 'SituacaoContestacaoEnum',
    type: String,
  })
  @IsString()
  status: SituacaoContestacaoEnum;

  @ApiProperty({
    name: 'poligonos',
    required: false,
    type: 'string',
    example:
      '[{"poligono": "Prodes 2009", "idTad": 1, "areaARegenerar": 10.5, "tipo": "Contestação por laudo", "wkt": "POLYGON(())", "tipoDeteccao": 2}]',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Poligono)
  poligonos?: Poligono[];

  @ApiProperty({
    name: 'valorMulta',
    required: false,
    type: Number,
  })
  @IsNumberString()
  @IsOptional()
  valorMulta?: number;

  @ApiProperty({
    name: 'descontoPercentual',
    required: false,
    type: Number,
  })
  @IsNumberString()
  @IsOptional()
  descontoPercentual?: number;
}
