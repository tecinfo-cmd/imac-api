import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SolicitacaoElegibilidadeResponse {

  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  telefone: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  status: string;


}