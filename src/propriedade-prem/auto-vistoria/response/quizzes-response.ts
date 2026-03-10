import { QuestoesResponse } from './questoes-response';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class QuizzesResponse {

  @ApiProperty({type: [QuestoesResponse] })
  @Type(()  => QuestoesResponse)
  @Expose()
  questionAndAnswers: QuestoesResponse[];
}