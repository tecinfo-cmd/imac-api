import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PropriedadeMultaResponse } from './propriedade-multa-response';
import { Column } from 'typeorm';

export class PagamentoMultaResponse {

  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  transactionId: string;

  @ApiProperty()
  @Expose()
  numeroBoleto: string;

  @ApiProperty({type: PropriedadeMultaResponse })
  @Expose()
  @Type(()  => PropriedadeMultaResponse)
  propriedade: PropriedadeMultaResponse;

  @ApiProperty()
  @Expose()
  codigoBarras: string;

  @ApiProperty()
  @Expose()
  nossoNumero: string;

  @ApiProperty()
  @Expose()
  cooperativa: string;

  @ApiProperty()
  @Expose()
  linhaDigitavel: string;

  @ApiProperty()
  @Expose()
  txId: string;

  @ApiProperty()
  @Expose()
  posto: string;

  @ApiProperty()
  @Expose()
  statusComando: string;

  @ApiProperty()
  @Expose()
  dataHoraComando: string;

  @ApiProperty()
  @Expose()
  tipoMensagem: string;

  @ApiProperty()
  @Expose()
  parcela: number;

  @ApiProperty()
  @Expose()
  dataVencimento: string;

  @ApiProperty()
  @Expose()
  valor: number;

  @ApiProperty()
  @Expose()
  dataPagamento: string;


}