import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QuestoesResponse {

  @ApiProperty()
  @Expose()
  question: string;

  @ApiProperty()
  @Expose()
  answer: string;

  @ApiProperty()
  @Expose()
  dateAnswered: string;
}