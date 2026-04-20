export class ConsultaSimRequest {
  cpfCnpj: string;
  type: number;
  constructor(cpfCnpj: string, type: number) {
    this.cpfCnpj = cpfCnpj;
    this.type  = type;
  }

}
