import { DeteccoesResponse } from './deteccoes-response';
import { ApiProperty } from '@nestjs/swagger';


export class RetornoElegibilidadeResponse {

  @ApiProperty()
  transactionId: string;
  @ApiProperty()
  car: string;
  @ApiProperty()
  status: string;
  @ApiProperty()
  urlCheckout: string;
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  isEligible: boolean;
  @ApiProperty()
  hasDocuments: boolean;
  @ApiProperty()
  errors: string[];
  @ApiProperty()
  deteccoes: DeteccoesResponse[];
  @ApiProperty()
  areas_desmatamento_total: number;
  @ApiProperty()
  modulo_fiscal: number;
  @ApiProperty()
  vlr_multa: number;
  @ApiProperty()
  desconto_perc: number;



}
