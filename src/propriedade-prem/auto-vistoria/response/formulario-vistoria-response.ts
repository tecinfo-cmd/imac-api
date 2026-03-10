import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { QuestoesResponse } from './questoes-response';
import { QuizzesResponse } from './quizzes-response';
import { SolicitacaoElegibilidadeResponse } from '../../response/solicitacao-elegibilidade-response';

export class FormularioVistoriaResponse {

  @ApiProperty()
  @Expose()
  reportUrl: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  comments: string;

  @ApiProperty()
  @Expose()
  mobileImei: string;

  @ApiProperty({type: [QuizzesResponse] })
  @Type(()  => QuizzesResponse)
  @Expose()
  quizzes: QuizzesResponse[];

}