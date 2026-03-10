import { ApiProperty } from '@nestjs/swagger';

export class ElegibilidadeRequest {

  @ApiProperty()
  car: string;

}
