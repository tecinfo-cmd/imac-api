import { Expose } from 'class-transformer';

export class PropriedadeResponse {

  @Expose()
  carFederal: string;
  @Expose()
  carEstadual: string;
  @Expose()
  nomepropriedade: string;

}
