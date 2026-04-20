import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CriarContestacaoAutorizacaoSupressaoResponse {
  @Expose()
  @ApiProperty()
  id: number;
}
