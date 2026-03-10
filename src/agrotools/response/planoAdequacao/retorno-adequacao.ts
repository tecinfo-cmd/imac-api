import { ApiProperty } from '@nestjs/swagger';

export class RetornoAdequacao {
  @ApiProperty()
  contestationId:  string;
  @ApiProperty()
  createdAt: string;
}