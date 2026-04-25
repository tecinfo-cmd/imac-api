export class ItensCarResponse {
  Id: number;
  RId: number;
  NumeroCompleto: string;
  NumeroReciboFedederal: string;
  Situacao: string;
  PropriedadeNome: string;
  MunicipioTexto: string;
  DataUltimoEnvio: string;
  SituacaoCompleta: string;
  DinamizadoId: number;
  DinamizadoSituacao: string;
  DinamizadoDataProcessamento: string;
}

export class ConsultaCarResponse {
  QuantidadeTotal: number;
  Itens: ItensCarResponse[];
}
