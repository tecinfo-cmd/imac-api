import { ApiProperty } from '@nestjs/swagger';

export class BoletoPdf {

  @ApiProperty()
  pdf: string
}