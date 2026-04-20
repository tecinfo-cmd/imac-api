import { PessoaResponse } from '../../pessoa/response/pessoa-response';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ProprietarioVoucherResponse {

  @ApiProperty()
  @Expose()
  @Type(()  => PessoaResponse)
  pessoa: PessoaResponse
}