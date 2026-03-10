import { PdfTemplateInterface } from "../interfaces/pdf-template.interface";

export interface DcsData{
  car: string;
  idPropriedade: number;
  nomePropriedade: string;
  cpfCnpj: string;
  dataAdesaoPrem: string;
  deteccoes: {
    tipo: string,
    areaHa: string
  }[]
}

export class DcsPdfTemplate implements PdfTemplateInterface<DcsData>{
  name: string = 'dcs';
  constructor(public data: DcsData){}
}