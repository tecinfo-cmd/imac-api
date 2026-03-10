import { StatusVoucher } from '../entities/voucher.entity';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PropriedadeVoucherResponse } from './propriedade-voucher.response';

export class AcompanharVoucherResponse {

  @ApiProperty()
  @Expose()
  @Type(()  => PropriedadeVoucherResponse)
  propriedade: PropriedadeVoucherResponse;

  @ApiProperty()
  @Expose()
  status: StatusVoucher;
}