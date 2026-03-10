import { PessoaResponse } from '../../pessoa/response/pessoa-response';
import { ProprietarioVoucherResponse } from './proprietario-voucher.response';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';



export class PropriedadeVoucherResponse {

  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  carFederal: string;

  @ApiProperty()
  @Expose()
  nomePropriedade: string;

  @ApiProperty()
  @Expose()
  @Type(()  => ProprietarioVoucherResponse)
  proprietario: ProprietarioVoucherResponse;

}