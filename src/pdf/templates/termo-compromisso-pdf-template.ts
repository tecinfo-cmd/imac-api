import { PdfTemplateInterface } from "../interfaces/pdf-template.interface";

export interface TermoCompromissoDTO{
  produtor: {
    nome: string;
    cpfCnpj: string;
    telefone: string;
    email: string;
    endereco: string;
    complemento: string;
    cidade: string;
    estado: string;
    representante: string;
    cpf: string;
    cargo: string;
  }
  areaArenegerar: number;
}

export class TermoCompromissoPdfTemplate implements PdfTemplateInterface<TermoCompromissoDTO>{
  name: string = 'termo-compromisso';
  constructor(public data: TermoCompromissoDTO){}
}