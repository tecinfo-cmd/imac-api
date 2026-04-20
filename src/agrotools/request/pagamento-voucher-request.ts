import { ApiProperty } from '@nestjs/swagger';
import { CompradorVoucherRequest } from './comprador-voucher-request';
import { PagamentoVoucher } from '../../elegibilidade/entities/pagamento-voucher.entity';
import { PagamentoRequest } from './pagamento-request';

export class PagamentoVoucherRequest{
  @ApiProperty()
  buyer: CompradorVoucherRequest
  @ApiProperty()
  payment: PagamentoRequest
}
