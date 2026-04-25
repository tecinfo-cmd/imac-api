export class FiltrosPesquisa {
  PROPRIETARIO_CNPJ?: string | null;
  PROPRIETARIO_CPF?: string | null;
  NUMERO_CAR_FERERAL?: string | null;

  constructor(cnpj?: string | null, cpf?: string | null, car?: string | null) {
    this.PROPRIETARIO_CNPJ = cnpj;
    this.PROPRIETARIO_CPF = cpf;
    this.NUMERO_CAR_FERERAL = car;
  }
}

export class RequestCarDto {
  Filtros: FiltrosPesquisa;
  ItensPorPagina: number = 100;
  Pagina: number = 1;
  IsOrdenarCrescente: boolean = true;
  ColunaOrdenar: string;
  Colunas: [] = [];

  constructor(filtro: FiltrosPesquisa) {
    this.Filtros = filtro;
  }
}
