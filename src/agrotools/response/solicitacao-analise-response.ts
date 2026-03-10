import { DeteccoesAnaliseResponse } from './deteccoes-analise-response';

export class SolicitacaoAnaliseResponse{
  reportUrl: string;
  deteccoes: DeteccoesAnaliseResponse [] = [];
  areas_desmatamento_total: number;
  modulo_fiscal: number;
  vlr_multa: number;
  desconto_perc: number;

}