import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
export class CriarParecerContestacaoResponse {
  @Expose()
  @ApiProperty()
  id: number;
}
