import { DocumentoAssinatura } from "./documento-assinatura.interface";
import { Signatario } from "./signatario.interface";

export interface IServicoAssinatura {
  enviarDocumentoParaAssinatura(documento: DocumentoAssinatura, signatarios: Signatario[]): Promise<string>;
  pegarLinkDocumentoAssinado(uuid: string): Promise<string>;
}