export class ItensResponse {

  id: number;

  rId: number;

  numeroCompleto: string;

  numeroReciboFedederal: string;

  situacao: string;

  propriedadeNome: string;

  municipioTexto: string;

  dataUltimoEnvio: string;

  situacaoCompleta: string;

  dinamizadoId: number;

  dinamizadoSituacao: string;

  dinamizadoDataProcessamento: string;
}

export class PropriedadeDto {

  quantidadeTotal: number;

  itens: ItensResponse[];
}
