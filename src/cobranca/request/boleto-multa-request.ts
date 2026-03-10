import { BoletoRequest } from './boleto-request';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BoletoMultaRequest {

  @ApiProperty({ example:2, required: true })
  @Expose()
  parcela: number;

  @ApiProperty({ example:250.00, required: true })
  @Expose()
  valor: number;

  @ApiProperty({ required: true })
  @Expose()
  boleto: BoletoRequest;
}