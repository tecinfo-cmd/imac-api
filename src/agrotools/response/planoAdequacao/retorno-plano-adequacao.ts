import { ApiProperty } from '@nestjs/swagger';

export class RetornoPlanoAdequacao {
  @ApiProperty()
  adequancyPlanId:  string;
  @ApiProperty()
  createdAt: string;
}