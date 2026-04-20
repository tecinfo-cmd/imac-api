import { ApiProperty } from '@nestjs/swagger';

export class AnaliseRequest {
  @ApiProperty()
  cdTerritory: string;
  @ApiProperty()
  protocol: number;
}