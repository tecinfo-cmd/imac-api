import { ApiProperty } from '@nestjs/swagger';

export class PagamentoRespose{

  @ApiProperty()
  transactionId: string;
  @ApiProperty()
  status: string;

}
