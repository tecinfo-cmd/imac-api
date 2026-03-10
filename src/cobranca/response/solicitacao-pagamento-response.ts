import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Pessoa } from '../../shared/entity/pessoa.entity';
import { PagamentoBoletoResponse } from './pagamento-boleto-response';

export class SolicitacaoPagamentoResponse {


  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  carFederal: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  nomePropriedade: string;

  @ApiProperty({type: PagamentoBoletoResponse })
  @Expose()
  pagamento: PagamentoBoletoResponse;

  @ApiProperty()
  @Expose()
  pessoa: Pessoa;

  @ApiProperty()
  @Expose()
  cep:string;

  @ApiProperty()
  @Expose()
  numero: string;

  @ApiProperty()
  @Expose()
  logradouro: string;



}