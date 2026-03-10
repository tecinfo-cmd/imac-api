import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CidadeResponse{

  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  codigo: number;

  @ApiProperty()
  @Expose()
  nome: string;

  @ApiProperty()
  @Expose()
  uf: string;
}