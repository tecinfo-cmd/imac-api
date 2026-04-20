import { ApiProperty } from '@nestjs/swagger';
import { StatusVoucher } from '../entities/voucher.entity';

export class ConsultaVoucherRequest {

  @ApiProperty()
  nomeProdutor?: string;

  @ApiProperty()
  cpfCnpj?: string;

  @ApiProperty()
  numeroCar?: string;

  @ApiProperty()
  email?: string;

  @ApiProperty({ example: '2025-09-01', required: false })
  dataInicio?: string;

  @ApiProperty({ example: '2025-09-30', required: false })
  dataFim?: string;

  @ApiProperty()
  status?: StatusVoucher;
}
