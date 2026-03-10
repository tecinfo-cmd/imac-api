import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
export class CriarContestacaoLaudoResponse {
  @Expose()
  @ApiProperty()
  id: number;
}
