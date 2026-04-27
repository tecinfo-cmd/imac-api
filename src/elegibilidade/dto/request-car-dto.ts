export class RequestCarDto {
  cpf?: string | null;
  cnpj?: string | null;
  carFederal?: string | null;

  constructor(
    cpf?: string | null,
    cnpj?: string | null,
    carFederal?: string | null,
  ) {
    this.cpf = cpf;
    this.cnpj = cnpj;
    this.carFederal = carFederal;
  }
}
