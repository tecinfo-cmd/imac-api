export enum TipoPessoa {
  PESSOA_FISICA = 'PESSOA_FISICA',
  PESSOA_JURIDICA = 'PESSOA_JURIDICA',
}


export class BeneficiarioRequest {
  cep:number;
  cidade:string;
  documento:string;
  logradouro:string;
  nome:string;
  numeroEndereco:number;
  tipoPessoa: TipoPessoa;
  uf:string;
}