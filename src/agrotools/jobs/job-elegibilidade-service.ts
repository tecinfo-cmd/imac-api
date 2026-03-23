import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AgrotoolsService } from '../agrotools.service';
import { CobrancasService } from '../../cobranca/cobranca.service';
import * as process from 'process';

@Injectable()
export class JobElegibilidadeService {
  private readonly ambiente = process.env.AMBIENTE as string;

  constructor(
    private readonly agroToolsService: AgrotoolsService,
    @Inject(forwardRef(() => CobrancasService))
    private readonly cobrancaService: CobrancasService,
  ) {}
  //VERIFICA TRANSAÇÃO CONSULTA ELEGIBILIDADE
  @Cron(CronExpression.EVERY_MINUTE)
  verificaConsultaTransacao() {
    this.agroToolsService.consultaTransacao();
  }

  //VERIFICA TRANSAÇÃO CONSULTA FRIGORIFICO
  @Cron('0 */2 * * * *')
  verificaConsultaTransacaFrigorifico() {
    this.agroToolsService.consultaTransacaoFrigorico();
  }

  @Cron('0 */3 * * * *')
  verificaFormulario() {
    this.agroToolsService.consultaFormularioAutoVistoria();
  }

  // @Cron("0 */4 * * * *")
  // verificaImagemFormulario() {
  //   this.agroToolsService.atualizaImagem();
  // }

  @Cron('0 */1 * * * *')
  cadastrarPessoaAgrotools() {
    this.agroToolsService.cadastraPessoaAgrotools();
  }

  @Cron('0 */3 * * * *')
  verificaAnalise() {
    this.agroToolsService.verificaAnalise();
  }

  @Cron('0 */3 * * * *')
  verificaContestacoesAnalise() {
    this.agroToolsService.verificaContestacoesAnalise();
  }

  @Cron('0 */3 * * * *')
  verificaPlanosAdequacao() {
    this.agroToolsService.verificaPlanosAdequacao();
  }

  @Cron(CronExpression.EVERY_4_HOURS)
  validaPagamento() {
    this.cobrancaService.verificarBoletosLiquidadosVoucher();
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  validaPagamentoMultas() {
    this.cobrancaService.verificarBoletosLiquidadosMulta();
  }

  @Cron('0 */9 * * * *')
  cadastrarTerritorio() {
    this.agroToolsService.cadastrarTerritorio();
  }

  //CONFIRMAÇÃO PAGAMENTOS MULTA E VOUCHER MOCK
  @Cron('0 */10 * * * *')
  validaPagamentoVoucherMock() {
    if (this.ambiente == 'development') {
      this.cobrancaService.verificaConfirmacaoPagamentoVoucherMock();
    }
  }

  //CONFIRMAÇÃO PAGAMENTOS MULTA E VOUCHER MOCK
  @Cron('0 */4 * * * *')
  validaPagamentoMultasMock() {
    if (this.ambiente == 'development') {
      this.cobrancaService.verificaConfirmacaoPagamentoMultaMock();
    }
  }
}
