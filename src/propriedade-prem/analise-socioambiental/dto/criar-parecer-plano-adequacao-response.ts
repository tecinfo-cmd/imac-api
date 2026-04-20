import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CriarParecerPlanoAdequacaoResponse {
  @Expose()
  @ApiProperty()
  id: number;
}
