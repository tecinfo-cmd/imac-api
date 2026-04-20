import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CidadeResponse } from '../../propriedade-prem/response/cidade-response';

export class PropriedadeMultaResponse {

  @ApiProperty()
  @Expose()
  carFederal: string;

  @ApiProperty()
  @Expose()
  nomePropriedade: string;

  @ApiProperty({type: CidadeResponse })
  @Expose()
  @Type(()  => CidadeResponse)
  cidade: CidadeResponse;

}