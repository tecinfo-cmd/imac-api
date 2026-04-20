import { CartaoRequest } from './cartao-request';
import { ApiProperty } from '@nestjs/swagger';

export class PagamentoRequest {
  @ApiProperty()
  installments: number;
  @ApiProperty()
  card: CartaoRequest;
}
