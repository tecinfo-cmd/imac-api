import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DocumentoAssinatura } from '../interfaces/documento-assinatura.interface';
import { Signatario } from '../interfaces/signatario.interface';
import { IServicoAssinatura } from '../interfaces/servico-assinatura.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class D4Sign implements IServicoAssinatura {
  private readonly baseUrl: string;
  private readonly tokenApi: string;
  private readonly cryptKey: string;
  private readonly uuidSafe: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get('D4SIGN_BASE_URL')!;
    this.tokenApi = this.configService.get('D4SIGN_TOKEN_API')!;
    this.cryptKey = this.configService.get('D4SIGN_CRYPT_KEY')!;
    this.uuidSafe = this.configService.get('D4SIGN_UUID_SAFE')!;
  }

  async enviarDocumentoParaAssinatura(documento: DocumentoAssinatura, signatarios: Signatario[]): Promise<string> {
    const uuidDocumento = await this.enviarDocumento(documento);

    await this.enviarSignatarios(uuidDocumento, signatarios);

    try {
      const response = await fetch(`${this.baseUrl}/documents/${uuidDocumento}/sendtosigner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "tokenAPI": this.tokenApi,
          "cryptKey": this.cryptKey
        },
        body: JSON.stringify({
          skip_email: "0",
          workflow: "0"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return uuidDocumento;
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao enviar documento para assinatura `+error.message);
    }
  }

  async pegarLinkDocumentoAssinado(uuid: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/${uuid}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "tokenAPI": this.tokenApi,
          "cryptKey": this.cryptKey
        },
        body: JSON.stringify({
          type: 'PDF'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return data.url;
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao tentar pegar link de documento`+error.message);
    }
  }

  private async enviarDocumento(documento: DocumentoAssinatura): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/${this.uuidSafe}/uploadbinary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "tokenAPI": this.tokenApi,
          "cryptKey": this.cryptKey
        },
        body: JSON.stringify({
          base64_binary_file: documento.conteudo.toString('base64'),
          name: documento.nomeArquivo,
          mime_type: documento.mimeType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return data.uuid;
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao enviar documento para assinatura `+error.message);
    }
  }

  private async enviarSignatarios(uuidDocumento: string, signatarios: Signatario[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/${uuidDocumento}/createlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "tokenAPI": this.tokenApi,
          "cryptKey": this.cryptKey
        },
        body: JSON.stringify({
          signers:
            signatarios.map(s => (
              {
                email: s.email,
                act: "1",
                foreign: "0",
                certificadoicpbr: "0",
                assinatura_presencial: "0"
              }))
          }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }
    } catch (error) {
      throw new InternalServerErrorException(`Erro ao enviar signatários para o documento `+error.message);
    }
  }
}
