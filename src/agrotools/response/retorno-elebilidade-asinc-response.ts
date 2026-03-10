import { ApiProperty } from '@nestjs/swagger';

export class RetornoElebilidadeAsincResponse {

  @ApiProperty()
  transactionId: string;
  @ApiProperty()
  status: string;
  @ApiProperty()
  createdAt: string;
}
