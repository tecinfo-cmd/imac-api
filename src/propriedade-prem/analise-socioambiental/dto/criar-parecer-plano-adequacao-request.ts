import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { BaseUploadRequest } from '../../../shared/dto/base-upload-request.dto';
import { SituacaoContestacaoEnum } from '../enum/situacao-contestacao.enum';
import { IsWktPolygon } from '../../../shared/decorators/is-wkt-polygon.decorator';

const statusValidosParaParecer = Object.values(SituacaoContestacaoEnum).filter(
  (status) => status !== SituacaoContestacaoEnum.EM_ANALISE
);

export class CriarParecerPlanoAdequacaoRequest extends BaseUploadRequest {
  @ApiProperty({
    name: 'status',
    required: true,
    enum: statusValidosParaParecer,
    enumName: 'SituacaoContestacaoEnum',
    type: String
  })
  @IsString()
  status: SituacaoContestacaoEnum;

  @ApiProperty({
    name: 'wkt',
    required: false,
    type: String
  })
  @IsString()
  @IsOptional()
  @IsWktPolygon()
  wkt?: string;
}

