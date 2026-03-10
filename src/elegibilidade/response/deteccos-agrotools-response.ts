import { ApiProperty } from '@nestjs/swagger';

export class DeteccosAgrotoolsResponse {

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  area_ha: string;

  @ApiProperty()
  idAgrotools: number;

}