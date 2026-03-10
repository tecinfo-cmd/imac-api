import { Body, Controller, Get, Param, Post, Request, Res, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CobrancasService } from './cobranca.service';
import { BoletoRequest } from './request/boleto-request';
import { BoletoPdf } from './response/boleto-pdf';
import { JwtAuthGuard } from '../shared/guards/jwt.guard';
import { PagamentoBoletoResponse } from './response/pagamento-boleto-response';
import { plainToInstance } from 'class-transformer';
import { BoletoMultaRequest } from './request/boleto-multa-request';
import { PagamentoMultaResponse } from './response/pagamento-multa-response';
import { SolicitacaoPagamentoResponse } from './response/solicitacao-pagamento-response';
import { AuthenticatedRequest } from '../shared/interfaces/authenticated-request.interface';


@ApiTags('Meios de pagamento e Cobranca')
@Controller('/boletos')
export class CobrancaController {

  constructor(private readonly service: CobrancasService) {
  }

  @Post('/voucher/:idSolicitacao')
  @ApiResponse({ status: 201, description: 'Solicitação boleto para compra de voucher.',  type: PagamentoBoletoResponse })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async gerarBoleto(@Body() boletoRequest: BoletoRequest, @Param('idSolicitacao') idSolicitacao: number){
    return await this.service.pagamentoVoucher(boletoRequest, idSolicitacao)
  }

  @UseGuards(JwtAuthGuard)
  @Post('/multa/:idPropriedade')
  @ApiResponse({ status: 201, description: 'Solicitação de boleto para pagamento de multa.',  type: [PagamentoMultaResponse] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async gerarBoletoMulta(@Body() boletoRequest: BoletoMultaRequest, @Param('idPropriedade') idPropriedade: number, @Request() usuarioLogado: AuthenticatedRequest){
    return await this.service.pagamentoMulta(boletoRequest, idPropriedade, usuarioLogado)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/imprimir/:linhaDigitavel')
  @ApiResponse({ status: 200, description: 'Impressão de boleto.', type: BoletoPdf })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  imprimiBoleto(@Param('linhaDigitavel') linhaDigitavel: string) {
    return this.service.imprimiBoleto(linhaDigitavel);
  }


  @UseGuards(JwtAuthGuard)
  @Post('/atualizar-vencimento/:codigoPagamento')
  @ApiResponse({ status: 201, description: 'Prorrogar data vencimento.', type: PagamentoBoletoResponse  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async atualizaVencimento(@Param('codigoPagamento') codigoPagamento: number) {
    const pagamento = await this.service.atualizarBoleto(codigoPagamento);
    return plainToInstance(PagamentoBoletoResponse, pagamento, { excludeExtraneousValues: true });
  }

  @Get('/pagamento-voucher/:idSolicitacao')
  @ApiResponse({ status: 201, description: 'Retorna pagamento voucher.',  type: PagamentoBoletoResponse })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async consultaPagamentoVoucher(@Param('idSolicitacao') idSolicitacao: number){
    return await this.service.consultaPagamentoVoucher(idSolicitacao)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/pagamento-multas/:idPropriedade')
  @ApiResponse({ status: 201, description: 'Retorna pagamento multas',  type: [PagamentoMultaResponse] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async consultaPagamentoMulta(@Param('idPropriedade') idPropriedade: number){
    return await this.service.consultaPagamentoMulta(idPropriedade)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/boletos/solicitacoes-pagamento')
  @ApiResponse({ status: 201, description: 'Retorna solicitacoes de elegibilidade',  type: [SolicitacaoPagamentoResponse] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async consultaSolicitacoes(@Request() request: AuthenticatedRequest){
    return await this.service.consultaSolicitacaoPagamento(request.user.email);
  }



}
