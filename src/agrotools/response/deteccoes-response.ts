import { ApiProperty } from '@nestjs/swagger';

export class DeteccoesResponse {

  @ApiProperty()
  id: number;

  @ApiProperty()
  tipo: string;

  @ApiProperty()
  area_ha: string;

}
