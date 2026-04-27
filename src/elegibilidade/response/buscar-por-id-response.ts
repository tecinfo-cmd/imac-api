import { Expose } from 'class-transformer';
import { RetornoAgrotoolsResponse } from './retorno-agrotools-response';
import { ApiProperty } from '@nestjs/swagger';

export class BuscarPorIdResponse {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  nomePropriedade: string;

  @ApiProperty()
  @Expose()
  telefone: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  dataCriacao: string;

  @ApiProperty({ type: RetornoAgrotoolsResponse })
  @Expose()
  retornoAgrotools: RetornoAgrotoolsResponse;
  response: any;
}
