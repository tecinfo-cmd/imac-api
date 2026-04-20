export enum TypePost {
  DocumentoFinalizado = "1",
  DocumentoCancelado = "2",
  EmailNaoEnviado = "3",
  DocumentoAssinado = "4"
}

export class WebhookAssinaturaRequest {
  uuid: string;
  type_post: string;
  message: string;
  email?: string;
}