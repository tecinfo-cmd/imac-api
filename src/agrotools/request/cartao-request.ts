import { ApiProperty } from '@nestjs/swagger';

export class CartaoRequest {
  @ApiProperty()
  holder_name: string
  @ApiProperty()
  number: string
  @ApiProperty()
  expiry_month: number
  @ApiProperty()
  expiry_year: number
  @ApiProperty()
  cvv: number;
}
