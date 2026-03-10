import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TerritorioResponse {

  @Expose()
  @ApiProperty()
  codigoTerritorio: string;

  @ApiProperty()
  @Expose()
  codigoAgents: string;

  @ApiProperty()
  @Expose()
  car: string;

  @ApiProperty()
  @Expose()
  geometry: string;

  @ApiProperty()
  @Expose()
  voucher: string;

  @ApiProperty()
  @Expose()
  imagemAdequacao: string;
}