import { Expose } from 'class-transformer';

export class SolicitacaoElegibilidadeResponse {

  @Expose()
  id: number;

  @Expose()
  telefone: string;

  @Expose()
  email: string;

  @Expose()
  status: string;


}