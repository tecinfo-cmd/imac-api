import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SolicitacaoElegibilidadeResponse } from '../../propriedade-prem/response/solicitacao-elegibilidade-response';

export class PagamentoBoletoResponse {

  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  voucherCode: string;

  @ApiProperty()
  @Expose()
  transactionId: string;

  @ApiProperty()
  @Expose()
  numeroBoleto: string;

  @ApiProperty({type: SolicitacaoElegibilidadeResponse })
  @Expose()
  @Type(()  => SolicitacaoElegibilidadeResponse)
  solicitacaoElegibilidade: SolicitacaoElegibilidadeResponse;

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
  dataVencimento: string;

  @ApiProperty()
  @Expose()
  dataPagamento: string;

  @ApiProperty()
  @Expose()
  valor: number;


}