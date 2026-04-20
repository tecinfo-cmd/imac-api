import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DeteccosAgrotoolsResponse } from './deteccos-agrotools-response';

export class  RetornoAgrotoolsResponse {

  @Expose()
  @ApiProperty()
  isEligible: boolean;

  @Expose()
  @ApiProperty()
  errors: string;

  @ApiProperty({ isArray: true, type: DeteccosAgrotoolsResponse })
  @Expose()
  deteccoes: DeteccosAgrotoolsResponse[]

  @Expose()
  @ApiProperty()
  areas_desmatamento_total: number;

  @Expose()
  @ApiProperty()
  modulo_fiscal: string;

  @Expose()
  @ApiProperty()
  vlr_multa: number;

  @Expose()
  @ApiProperty()
  desconto_perc: number;

}