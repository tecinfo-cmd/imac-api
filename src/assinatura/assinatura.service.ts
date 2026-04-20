import { Inject } from "@nestjs/common";
import { IServicoAssinatura } from "./interfaces/servico-assinatura.interface";
import { DocumentoAssinatura } from "./interfaces/documento-assinatura.interface";
import { Signatario } from "./interfaces/signatario.interface";

export class AssinaturaService{
  constructor(
    @Inject('I_SERVICO_ASSINATURA')
    private readonly servicoAssinatura: IServicoAssinatura
  ) { }

  async enviarDocumentoParaAssinatura(documento: DocumentoAssinatura, signatarios: Signatario[]): Promise<string> {
    return this.servicoAssinatura.enviarDocumentoParaAssinatura(documento, signatarios);
  }

  async pegarLinkDocumentoAssinado(uuid: string): Promise<string> {
    return this.servicoAssinatura.pegarLinkDocumentoAssinado(uuid);
  }
}