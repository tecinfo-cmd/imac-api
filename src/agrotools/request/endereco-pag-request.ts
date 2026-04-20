import { ApiProperty } from '@nestjs/swagger';

export class EnderecoPagRequest{

  @ApiProperty()
  street: string;
  @ApiProperty()
  number: string;
  @ApiProperty()
  complement?: string;
  @ApiProperty()
  neighborhood?: string;
  @ApiProperty()
  city: string;
  @ApiProperty()
  state: string;
  @ApiProperty()
  zipCode: string;
  @ApiProperty()
  country: string;

}
