import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PessoaResponse } from '../../pessoa/response/pessoa-response';

export class ProprietarioMultaResponse {

  @ApiProperty({type: PessoaResponse })
  @Expose()
  @Type(()  => PessoaResponse)
  pessoa: PessoaResponse;

  @ApiProperty()
  @Expose()
  tipoProprietario: string;

  @ApiProperty()
  @Expose()
  telefone: string;

}