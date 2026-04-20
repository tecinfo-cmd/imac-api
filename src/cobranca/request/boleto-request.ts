import { BeneficiarioRequest } from './beneficiario-request';
import { PagadorRequest } from './pagador-request';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNotEmptyObject, ValidateNested } from 'class-validator';

export enum TipoPagamento {
  HIBRIDO = 'HIBRIDO'
}

export enum EspecieDocumento {
  DUPLICATA = 'DUPLICATA_MERCANTIL_INDICACAO'
}

export class BoletoRequest {

  beneficiarioFinal?: BeneficiarioRequest;

  codigoBeneficiario?: string;

  dataVencimento?: string;

  valor?: number;

  especieDocumento?: string;

  tipoCobranca?: TipoPagamento;

  mensagens?: string [];

  seuNumero?: string;

  @IsNotEmptyObject()
  @ApiProperty({ required: true })
  @Type(() => PagadorRequest)
  @Expose()
  pagador: PagadorRequest;

  @ApiProperty({ example:'["info1", "info2"]', required: true })
  @Expose()
  informativos: string [];

}