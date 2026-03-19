import { Injectable } from '@nestjs/common';
import * as process from 'process';
import { BodyRequest } from './body-request';
import axios from 'axios';
import NegocioException from '../exception/negocio-exception';
import { CampaignRequest } from './campaign-request';
import { MessageRequest } from './message-request';

interface DadosEnvio<T> {
  telefone: string;
  nome: string;
  mensagem: string;
}

interface DadosAnalise<T> {
  produtor: string | undefined;
  propriedade: string | undefined;
  carFederal: string | undefined;
  etapa: string;
  telefone: string | undefined;
}

interface DadosAutoVistoria<T> {
  produtor: string | undefined;
  propriedade: string | undefined;
  carFederal: string | undefined;
  telefone: string | undefined;
}

@Injectable()
export class MensagemService {
  headersRequest = {
    Authorization: `${process.env.KEY_WHATSAPP as string}`,
    'Content-Type': 'application/json',
  };

  url: string;
  key: string;
  flowId: string;
  masterstate: string;
  stateIdPrem: string;
  stateIdPassaport: string;
  email: string;
  body: BodyRequest = new BodyRequest();

  constructor() {
    this.url = process.env.URL_WHATSAPP as string;
    this.key = process.env.KEY_WHATSAPP as string;
    this.flowId = process.env.FLOW_ID as string;
    this.masterstate = process.env.MASTER_STATE as string;
    this.stateIdPrem = process.env.STATE_ID_PASSAPORT as string;
    this.stateIdPassaport = process.env.STATE_ID_PREM as string;
  }

  async enviarMensagenStatus<T>({
    produtor,
    propriedade,
    carFederal,
    etapa,
    telefone,
  }: DadosAnalise<T>): Promise<void> {
    const code = await this.gerarStringAleatoria();

    const campaign = {
      name: code,
      campaignType: 'individual',
      flowId: this.flowId,
      stateId: this.stateIdPrem,
      masterstate: this.masterstate,
      channelType: 'WhatsApp',
    } as CampaignRequest;
    const audience = {
      recipient: `+55${telefone}`,
      messageParams: {
        '1': produtor,
        '2': propriedade,
        '3': carFederal,
        '4': etapa,
      },
    };
    const message = {
      messageTemplate: 'ciclo_analise',
      messageParams: ['1', '2', '3', '4'],
      channelType: 'WhatsApp',
    } as MessageRequest;

    this.body.resource = {
      campaign: campaign,
      audience: audience,
      message: message,
    };

    return await axios
      .post(`${this.url}`, this.body, { headers: this.headersRequest })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw new NegocioException(error.status, error);
      });
  }

  async enviarMensagemAutoVistoria<T>({
    produtor,
    propriedade,
    carFederal,
    telefone,
  }: DadosAutoVistoria<T>): Promise<void> {
    const code = await this.gerarStringAleatoria();

    const campaign = {
      name: code,
      campaignType: 'individual',
      flowId: this.flowId,
      stateId: this.stateIdPrem,
      masterstate: this.masterstate,
      channelType: 'WhatsApp',
    } as CampaignRequest;
    const audience = {
      recipient: `+55${telefone}`,
      messageParams: { '1': produtor, '2': propriedade, '3': carFederal },
    };
    const message = {
      messageTemplate: 'auto_vistoria',
      messageParams: ['1', '2', '3'],
      channelType: 'WhatsApp',
    } as MessageRequest;

    this.body.resource = {
      campaign: campaign,
      audience: audience,
      message: message,
    };

    return await axios
      .post(`${this.url}`, this.body, { headers: this.headersRequest })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw new NegocioException(error.status, error);
      });
  }

  async enviarMensagen<T>({
    telefone,
    nome,
    mensagem,
  }: DadosEnvio<T>): Promise<void> {
    const code = await this.gerarStringAleatoria();

    const campaign = {
      name: code,
      campaignType: 'individual',
      flowId: this.flowId,
      stateId: this.stateIdPrem,
      masterstate: this.masterstate,
      channelType: 'WhatsApp',
    } as CampaignRequest;
    const audience = {
      recipient: `+55${telefone}`,
      messageParams: { '1': nome },
    };
    const message = {
      messageTemplate: 'boas_vindas',
      messageParams: ['1'],
      channelType: 'WhatsApp',
    } as MessageRequest;

    this.body.resource = {
      campaign: campaign,
      audience: audience,
      message: message,
    };

    return await axios
      .post(`${this.url}`, this.body, { headers: this.headersRequest })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw new NegocioException(error.status, error);
      });
  }

  async gerarStringAleatoria() {
    let resultado = '';
    const caracteres =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 45; i++) {
      resultado += caracteres.charAt(
        Math.floor(Math.random() * caracteres.length),
      );
    }
    return resultado;
  }
}
