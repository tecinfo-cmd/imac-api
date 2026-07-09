import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as process from 'process';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PagamentoVoucher } from '../elegibilidade/entities/pagamento-voucher.entity';
import { PropriedadePremService } from '../propriedade-prem/propriedade-prem.service';
import NegocioException from '../exception/negocio-exception';
import { randomUUID } from 'crypto';
import { ElegibilidadeService } from '../elegibilidade/elegibilidade.service';
import {
  BoletoRequest,
  EspecieDocumento,
  TipoPagamento,
} from './request/boleto-request';
import axios from 'axios';
import { BoletoResponse } from './response/boleto-response';
import { TipoPessoa } from './request/beneficiario-request';
import * as moment from 'moment/moment';
import { AtualizacaoBoletoResponse } from './response/atualizacao-boleto-response';
import { catchError, firstValueFrom } from 'rxjs';
import { PagamentoBoletoResponse } from './response/pagamento-boleto-response';
import { plainToInstance } from 'class-transformer';
import { SolicitacaoElegibilidadeResponse } from './response/solicitacao-elegibilidade-response';
import { StatusPagamento } from '../shared/enums/enums';
import {
  Etapas,
  StatusEtapas,
} from '../propriedade-prem/enum/etapas-status-propriedade.const';
import { TerritorioAgrotoolsRequest } from '../agrotools/request/territorio-agrotools-request';
import { TerritorioResponse } from '../agrotools/response/territorio-response';
import { Propriedade } from '../propriedade-prem/entities/propriedade.entity';
import { TerritorioEntity } from '../agrotools/entities/territorio.entity';
import { AgrotoolsService } from '../agrotools/agrotools.service';
import { BoletoMultaRequest } from './request/boleto-multa-request';
import { PagamentoMulta } from './entities/pagamento-multa.entities';
import { PagamentoMultaResponse } from './response/pagamento-multa-response';
import { LiquidacoesResponse } from './response/liquidacoes-response';
import { PessoaService } from '../shared/service/pessoa.service';
import { SolicitacaoPagamentoResponse } from './response/solicitacao-pagamento-response';
import { ErroFuncionalidade } from '../exception/erro-funcionalidade';
import { AuthenticatedRequest } from '../shared/interfaces/authenticated-request.interface';

/**
 *  Integração aos serviços de meios de pagamento do Sicredi
 */
@Injectable()
export class CobrancasService {
  private readonly logger = new Logger(CobrancasService.name);

  private readonly urlAuth: string;
  private readonly urlApi: string;
  private readonly tokenSicredi: string;
  private readonly usuario: string;
  private readonly password: string;
  private readonly codigoBeneficiario: string;
  private readonly taxaAdesao: number;
  private readonly mensagemBoleto = [
    'O Não pagamento da taxa de adesão implicará não liberação do ACT',
  ];

  headers = {
    Authorization: '',
    'x-api-key': process.env.TOKEN_SICREDI as string,
    'Content-Type': `application/json`,
    cooperativa: process.env.COOPERATIVA as string,
    posto: process.env.POSTO as string,
    codigoBeneficiario: process.env.CODIGO_BENEFICIARIO as string,
  };

  headersMulta = {
    Authorization: '',
    'x-api-key': process.env.TOKEN_SICREDI as string,
    'Content-Type': `application/json`,
    cooperativa: process.env.COOPERATIVA as string,
    posto: process.env.POSTO as string,
  };

  /**
   * Dados do Beneficiario IMAC
   */
  beneficiario = {
    cep: process.env.CEP_BENEFICIARIO as unknown as number,
    cidade: process.env.CIDADE_BENEFICIARIO as string,
    documento: process.env.DOCUMENTO_BENEFICIARIO as string,
    logradouro: process.env.LOGRADOURO_BENEFICIARIO as string,
    nome: process.env.NOME_BENEFICIARIO as string,
    numeroEndereco: process.env.NUMERO_END_BENEFICIARIO as unknown as number,
    tipoPessoa: TipoPessoa.PESSOA_JURIDICA,
    uf: process.env.UF_BENEFICIARIO as string,
    codigoBeneficiario: process.env.CODIGO_BENEFICIARIO as string,
  };

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(PagamentoVoucher)
    private readonly pagamentoVoucherRepository: Repository<PagamentoVoucher>,
    @Inject(forwardRef(() => ElegibilidadeService))
    private readonly elegibilidadeService: ElegibilidadeService,
    @Inject(forwardRef(() => PropriedadePremService))
    private readonly propriedadeService: PropriedadePremService,
    @InjectRepository(TerritorioEntity)
    private readonly territorioRepository: Repository<TerritorioEntity>,
    @InjectRepository(PagamentoMulta)
    private readonly pagamentoMultaRepository: Repository<PagamentoMulta>,
    @Inject(forwardRef(() => AgrotoolsService))
    private readonly agrotoolsService: AgrotoolsService,
    @Inject(forwardRef(() => PessoaService))
    private readonly pessoaService: PessoaService,
    @InjectRepository(ErroFuncionalidade)
    private readonly erroFuncionalidadesRepository: Repository<ErroFuncionalidade>,
  ) {
    this.urlAuth = process.env.URL_AUTH_SICREDI as string;
    this.urlApi = process.env.URL_SICREDI as string;
    this.tokenSicredi = process.env.TOKEN_SICREDI as string;
    this.usuario = process.env.USUARIO_SICRED as string;
    this.password = process.env.PASSWORD_SICRED as string;
    this.codigoBeneficiario = process.env.CODIGO_BENEFICIARIO as string;
    this.taxaAdesao = process.env.VALOR_TAXA_ADESAO as unknown as number;
  }

  /**
   * Responsavem por gerar um boleto hibrido para compra de voucher
   * @param request
   * @param idSolicitacao
   */
  async pagamentoVoucher(
    request: BoletoRequest,
    idSolicitacao: number,
  ): Promise<any> {
    const solicitacaoEligibilidade =
      await this.elegibilidadeService.buscaSolicitacao(idSolicitacao);
    if (!solicitacaoEligibilidade) {
      throw new NegocioException(
        HttpStatus.NOT_FOUND,
        'Solicitacao não encontrada.',
      );
    } else if (solicitacaoEligibilidade.status == 'REPROVADO') {
      throw new NegocioException(
        HttpStatus.NOT_FOUND,
        'Propriedade não autorizada para compra de voucher.',
      );
    }

    if (await this.consultaPagamentoSolicitacao(idSolicitacao)) {
      throw new NegocioException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'Existe Pagamento pendente de confirmação para esta propriedade.',
      );
    }

    if (solicitacaoEligibilidade.cpfCnpj != request.pagador.documento) {
      throw new NegocioException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'Pagador do boleto diferente do responsavel pela solicitação.',
      );
    }

    const boleto = await this.cadastraBoleto(request, this.taxaAdesao);

    const pagamentoVoucher = {
      numeroBoleto: request.seuNumero,
      status: StatusPagamento.PENDENTE,
      idSolicitacao: solicitacaoEligibilidade.id,
      solicitacaoEligibilidade: solicitacaoEligibilidade,
      qrCode: boleto.qrCode,
      codigoBarras: boleto.codigoBarras,
      nossoNumero: boleto.nossoNumero,
      cooperativa: boleto.cooperativa,
      linhaDigitavel: boleto.linhaDigitavel,
      txId: boleto.txid,
      posto: boleto.posto,
      dataVencimento: this.getDataVencimento(1),
      valor: request.valor,
    };
    const pagamentoSave =
      await this.pagamentoVoucherRepository.save(pagamentoVoucher);
    const solicitacao = plainToInstance(
      SolicitacaoElegibilidadeResponse,
      pagamentoSave.solicitacaoEligibilidade,
      { excludeExtraneousValues: true },
    );
    const response = plainToInstance(PagamentoBoletoResponse, pagamentoSave, {
      excludeExtraneousValues: true,
    });
    response.solicitacaoElegibilidade = solicitacao;
    return response;
  }

  /**
   * Gera boletos para pagamento de multa
   * @param request
   * @param idPropriedade
   */
  async pagamentoMulta(
    request: BoletoMultaRequest,
    idPropriedade: number,
    usuarioLogado: AuthenticatedRequest,
  ): Promise<PagamentoMultaResponse[]> {
    const listaPagamentos: PagamentoMulta[] = [];

    if (!request.boleto) {
      throw new NegocioException(
        HttpStatus.NOT_FOUND,
        'Informe os dados do boleto.',
      );
    }

    const propriedade = await this.propriedadeService.consultaPropriedadePorId(
      idPropriedade,
      usuarioLogado,
    );
    if (!propriedade) {
      throw new NegocioException(
        HttpStatus.NOT_FOUND,
        'Propriedade não identificada',
      );
    }

    const proprietario = propriedade.proprietarios.find(
      (p) => p.pessoa.cpfCnpj == request.boleto.pagador.documento,
    );
    if (!proprietario) {
      throw new NegocioException(
        HttpStatus.NOT_FOUND,
        'Pagador diferente do proprietario da unidade',
      );
    }

    try {
      for (let i = 0; i < request.parcela; i++) {
        if (i < 1) {
          const boleto = await this.cadastraBoleto(
            request.boleto,
            request.valor,
          );
          listaPagamentos.push(
            this.getPagamentoMulta(request, propriedade, boleto, 1),
          );
        } else {
          const boleto = await this.cadastraBoletoParcelado(
            request.boleto,
            request.valor,
            i,
          );
          listaPagamentos.push(
            this.getPagamentoMulta(request, propriedade, boleto, i + 1),
          );
        }
      }

      return plainToInstance(
        PagamentoMultaResponse,
        await this.pagamentoMultaRepository.save(listaPagamentos),
        { excludeExtraneousValues: true },
      );
    } catch (error) {
      throw new NegocioException(error.status, error.message);
    }
  }

  /**
   * Realiza a atualização da data de vencimento
   * @param codigoPagamento
   */
  async atualizarBoleto(codigoPagamento: number): Promise<any> {
    const pagamento = await this.pagamentoVoucherRepository.findOne({
      where: { id: codigoPagamento },
      relations: ['solicitacaoElegibilidade'],
    });
    if (!pagamento) {
      throw new NegocioException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'Boleto não  encontrada',
      );
    }

    this.headers.Authorization = await this.autenticacao();
    const dataVencimento = { dataVencimento: this.getDataVencimento(1) };

    const { data } = await firstValueFrom(
      this.httpService
        .patch<AtualizacaoBoletoResponse>(
          `${this.urlApi}/boletos/${pagamento.nossoNumero}/data-vencimento`,
          dataVencimento,
          { headers: this.headers },
        )
        .pipe(
          catchError((error: any) => {
            throw new NegocioException(error.status, error?.message);
          }),
        ),
    );

    pagamento.transactionId = data.transactionId;
    pagamento.dataHoraComando = data.dataHoraRegistro;
    pagamento.tipoMensagem = data.tipoMensagem;
    pagamento.statusComando = data.statusComando;
    pagamento.transactionId = data.transactionId;
    pagamento.dataVencimento = dataVencimento.dataVencimento;
    return await this.pagamentoVoucherRepository.save(pagamento);
  }

  /**
   * Realiza impressao de boleto
   * @param linhaDigitavel
   */
  async imprimiBoleto(linhaDigitavel: string): Promise<any> {
    this.headers.Authorization = await this.autenticacao();
    const data = await axios
      .get(`${this.urlApi}/boletos/pdf?linhaDigitavel=${linhaDigitavel}`, {
        headers: this.headers,
        responseType: 'arraybuffer',
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw new NegocioException(error.status, error?.message);
      });

    const buffer = Buffer.from(data);
    return { pdf: buffer.toString('base64') };
  }

  /**
   * retorno token de autenticação
   */
  async autenticacao(): Promise<string> {
    const dadosAuth = {
      username: this.usuario,
      password: this.password,
      scope: 'cobranca',
      grant_type: 'password',
    };

    const token = await axios
      .post(`${this.urlAuth}`, dadosAuth, {
        headers: {
          'Content-Type': `application/x-www-form-urlencoded`,
          'x-api-key': this.tokenSicredi,
          context: 'COBRANCA',
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw new NegocioException(error.status, error?.response.data.message);
      });

    return 'bearer ' + token.access_token;
  }

  /**
   * Responsavel por retornar boletos liquidados do dia
   */
  async verificaLiquidacao(): Promise<LiquidacoesResponse> {
    this.headers.Authorization = await this.autenticacao();
    const { data } = await firstValueFrom(
      this.httpService
        .get<LiquidacoesResponse>(
          `${this.urlApi}/boletos/liquidados/dia?codigoBeneficiario=${this.codigoBeneficiario}&dia=${this.getDiaLiquidacao()}`,
          { headers: this.headers },
        )
        .pipe(
          catchError((error: any) => {
            throw new NegocioException(error.status, error?.message);
          }),
        ),
    );

    return data;
  }

  /**
   *  Verifica consulta liquidação do dia para compra de voucher e verifica altera status do pagamento
   */
  async verificarBoletosLiquidadosVoucher() {
    const liquidacoes = await this.verificaLiquidacao();

    if (liquidacoes) {
      for (const liquidacao of liquidacoes.items) {
        await this.verificaConfirmacaoPagamentoVoucher(
          liquidacao.seuNumero,
          liquidacao.dataPagamento,
        );
      }
    }

    this.logger.log('FIM DA EXECUÇÃO LIQUIDACAO VOUCHER');
  }

  /**
   *  Verifica consulta liquidação do dia para pagamento d e multae verifica altera status
   */
  async verificarBoletosLiquidadosMulta() {
    const liquidacoes = await this.verificaLiquidacao();

    if (liquidacoes) {
      for (const liquidacao of liquidacoes.items) {
        await this.verificaConfirmacaoPagamentoMulta(
          liquidacao.seuNumero,
          liquidacao.dataPagamento,
        );
      }
    }

    this.logger.log('FIM DA EXECUÇÃO LIQUIDACAO MULTAS');
  }

  /**
   *
   * @param idSolicitacao
   */
  async consultaPagamentoVoucher(
    idSolicitacao: number,
  ): Promise<PagamentoBoletoResponse> {
    const pagamento = await this.pagamentoVoucherRepository
      .createQueryBuilder('pagamento')
      .leftJoinAndSelect(
        'pagamento.solicitacaoElegibilidade',
        'solicitacaoElegibilidade',
      )
      .where('pagamento.idSolicitacao = :idSolicitacao', { idSolicitacao })
      .getOne();

    if (!pagamento) {
      throw new NegocioException(
        404,
        'Solicitação não possui pagamento associado. ',
      );
    }

    const solicitacao = plainToInstance(
      SolicitacaoElegibilidadeResponse,
      pagamento?.solicitacaoElegibilidade,
      { excludeExtraneousValues: true },
    );
    const response = plainToInstance(PagamentoBoletoResponse, pagamento, {
      excludeExtraneousValues: true,
    });
    response.solicitacaoElegibilidade = solicitacao;
    return response;
  }

  /**
   *
   * @param idSolicitacao
   */
  async consultaPagamentoMulta(
    idPropriedade: number,
  ): Promise<PagamentoMultaResponse[]> {
    const pagamento = await this.pagamentoMultaRepository
      .createQueryBuilder('pagamentoMulta')
      .leftJoinAndSelect('pagamentoMulta.propriedade', 'propriedade')
      .where('pagamentoMulta.idPropriedade = :id', { id: idPropriedade })
      .getMany();

    if (!pagamento) {
      throw new NegocioException(
        404,
        'Solicitação não possui pagamento associado. ',
      );
    }

    return plainToInstance(PagamentoMultaResponse, pagamento, {
      excludeExtraneousValues: true,
    });
  }

  getPagamentoMulta(
    request: BoletoMultaRequest,
    propriedade: Propriedade,
    boleto: BoletoResponse,
    parcela: number,
  ): PagamentoMulta {
    return {
      numeroBoleto: request.boleto.seuNumero,
      status: StatusPagamento.PENDENTE,
      idPropriedade: propriedade.id,
      propriedade: propriedade,
      qrCode: boleto.qrCode,
      codigoBarras: boleto.codigoBarras,
      nossoNumero: boleto.nossoNumero,
      cooperativa: boleto.cooperativa,
      linhaDigitavel: boleto.linhaDigitavel,
      txId: boleto.txid,
      posto: boleto.posto,
      parcela: parcela,
      dataVencimento: request.boleto.dataVencimento,
      valor: request.valor,
    } as PagamentoMulta;
  }

  async cadastraBoleto(
    boleto: BoletoRequest,
    valor: number,
  ): Promise<BoletoResponse> {
    boleto.codigoBeneficiario = this.codigoBeneficiario;
    boleto.beneficiarioFinal = this.beneficiario;
    boleto.valor = valor;
    boleto.dataVencimento = this.getDataVencimento(1);
    boleto.mensagens = this.mensagemBoleto;
    boleto.tipoCobranca = TipoPagamento.HIBRIDO;
    boleto.especieDocumento = EspecieDocumento.DUPLICATA;
    boleto.seuNumero = this.geraNumeroBoleto();

    this.headersMulta.Authorization = await this.autenticacao();

    const data = await axios
      .post(`${this.urlApi}/boletos`, boleto, { headers: this.headersMulta })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw new NegocioException(
          error.status,
          error?.response?.data?.message,
        );
      });

    return data;
  }

  async cadastraBoletoParcelado(
    boleto: BoletoRequest,
    valor: number,
    parcela: number,
  ): Promise<BoletoResponse> {
    boleto.codigoBeneficiario = this.codigoBeneficiario;
    boleto.beneficiarioFinal = this.beneficiario;
    boleto.valor = valor;
    boleto.dataVencimento = this.getDataVencimentoMes(parcela);
    boleto.mensagens = this.mensagemBoleto;
    boleto.tipoCobranca = TipoPagamento.HIBRIDO;
    boleto.especieDocumento = EspecieDocumento.DUPLICATA;
    boleto.seuNumero = this.geraNumeroBoleto();

    this.headers.Authorization = await this.autenticacao();

    const { data } = await firstValueFrom(
      this.httpService
        .post<BoletoResponse>(`${this.urlApi}/boletos`, boleto, {
          headers: this.headers,
        })
        .pipe(
          catchError((error: any) => {
            throw new NegocioException(error.status, error?.message);
          }),
        ),
    );

    return data;
  }

  async consultaPagamentoSolicitacao(
    idSolicitacao: number,
  ): Promise<PagamentoVoucher | null> {
    return this.pagamentoVoucherRepository.findOne({
      where: { idSolicitacao: idSolicitacao },
    });
  }

  async verificaConfirmacaoPagamentoVoucher(
    numeroBoleto: string,
    dataPagamento: string,
  ) {
    const pagamento = await this.pagamentoVoucherRepository
      .createQueryBuilder('pagamento')
      .leftJoinAndSelect(
        'pagamento.solicitacaoElegibilidade',
        'solicitacaoElegibilidade',
      )
      .leftJoinAndSelect(
        'solicitacaoElegibilidade.retornoAgrotools',
        'retornoAgrotools',
      )
      .where('pagamento.status = :status', { status: 'PENDENTE' })
      .andWhere('pagamento.numeroBoleto = :numeroBoleto', { numeroBoleto })
      .getOne();

    if (pagamento) {
      try {
        const propriedade =
          await this.propriedadeService.buscaPropriedadePorSolicitacao(
            pagamento.solicitacaoElegibilidade.id,
          );
        if (propriedade) {
          propriedade.voucher = randomUUID();
          propriedade.moduloFiscal =
            +pagamento.solicitacaoElegibilidade.retornoAgrotools.modulo_fiscal;
          propriedade.statusVoucher = true;
          propriedade.etapa = Etapas.Cadastro;
          propriedade.status = StatusEtapas.Cadastro.CadastroIncompleto;

          await this.propriedadeService.atualizaPropriedadePrem(propriedade);
          pagamento.voucherCode = propriedade.voucher;
          pagamento.status = StatusPagamento.LIQUIDADO;
          pagamento.dataPagamento = dataPagamento;

          const proprietarios = propriedade.proprietarios.filter(
            (p) => p.pessoa.idUsuarioAgrotools != null,
          );

          const territorio = {
            car: propriedade.carFederal,
            vlOwnerCode: propriedade.id.toString(),
            territoryName: propriedade.nomePropriedade,
            producersId: proprietarios.map((p) => p.pessoa.idUsuarioAgrotools),
            agents: [
              {
                name: propriedade.proprietarios[0].pessoa.nome,
                document: propriedade.proprietarios[0].pessoa.cpfCnpj,
              },
            ],
          } as TerritorioAgrotoolsRequest;

          const territorioBase = await this.consultaTerritorioBase(
            propriedade.id,
          );

          if (!territorioBase) {
            let territorioResponse =
              await this.agrotoolsService.consultarTerritorio(propriedade.id);
            if (!territorioResponse) {
              territorioResponse =
                await this.agrotoolsService.criarTerritorio(territorio);
              await this.salvaTerritorio(
                territorioResponse,
                propriedade,
                pagamento,
              );
            } else {
              await this.salvaTerritorio(
                territorioResponse,
                propriedade,
                pagamento,
              );
            }
          } else {
            await this.pagamentoVoucherRepository.update(
              pagamento.id,
              pagamento,
            );
            await this.elegibilidadeService.enviarConfirmacaoPagamento(
              pagamento.solicitacaoElegibilidade.email,
              pagamento.solicitacaoElegibilidade.carFederal,
              propriedade.nomePropriedade,
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async verificaConfirmacaoPagamentoMulta(
    numeroBoleto: string,
    dataPagamento: string,
  ) {
    const pagamento = await this.pagamentoMultaRepository
      .createQueryBuilder('pagamentoMulta')
      .leftJoinAndSelect('pagamentoMulta.propriedade', 'propriedade')
      .where('pagamentoMulta.status = :status', { status: 'PENDENTE' })
      .andWhere('pagamentoMulta.numeroBoleto = :numeroBoleto', { numeroBoleto })
      .getOne();

    if (pagamento) {
      try {
        if (pagamento.propriedade) {
          pagamento.status = StatusPagamento.LIQUIDADO;
          pagamento.dataPagamento = dataPagamento;
          await this.pagamentoMultaRepository.update(pagamento.id, pagamento);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async salvaTerritorio(
    territorioResponse: TerritorioResponse,
    propriedade: Propriedade,
    pag: PagamentoVoucher,
  ) {
    const territorioEntity = {
      idPropriedade: propriedade.id,
      codigoTerritorio: territorioResponse.cdTerritory,
      codigoAgents: territorioResponse.cdAgents
        ? territorioResponse.cdAgents.toString()
        : [],
      car: propriedade.carFederal,
      geometry: territorioResponse.geom,
    } as TerritorioEntity;
    await this.territorioRepository.save(territorioEntity);
    await this.pagamentoVoucherRepository.update(pag.id, pag);
    await this.elegibilidadeService.enviarConfirmacaoPagamento(
      pag.solicitacaoElegibilidade.email,
      pag.solicitacaoElegibilidade.carFederal,
      propriedade.nomePropriedade,
    );
  }

  async consultaSolicitacaoPagamento(email: string): Promise<any> {
    const solicitacaoes =
      await this.elegibilidadeService.consultaSolicitacao(email);
    const pessoa = await this.pessoaService.buscaPessoaEmail(email);
    const usuario = await this.propriedadeService.consultaUsuario(email);
    if (solicitacaoes.length == 0) {
      throw new NegocioException(404, 'Nenhuma solicitação localidada');
    }
    const solicitaCaoResponse = plainToInstance(
      SolicitacaoPagamentoResponse,
      solicitacaoes,
      { excludeExtraneousValues: true },
    );
    for (const s of solicitaCaoResponse) {
      s.pagamento = plainToInstance(
        PagamentoBoletoResponse,
        await this.consultaPagamento(s.id),
        { excludeExtraneousValues: true },
      );
    }

    solicitaCaoResponse.forEach((s) => (s.pessoa = pessoa));
    solicitaCaoResponse.forEach((s) => {
      (s.cep = usuario.cep),
        (s.numero = usuario.numero),
        (s.logradouro = usuario.logradouro);
    });
    return solicitaCaoResponse;
  }

  async consultaTerritorioBase(
    idPropriedade: number,
  ): Promise<TerritorioEntity | null> {
    return this.territorioRepository.findOne({
      where: { idPropriedade: idPropriedade },
    });
  }

  getDataVencimento(dias: number): string {
    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + dias);
    return moment(vencimento).format('YYYY-MM-DD');
  }

  getDataVencimentoMes(mes: number): string {
    const vencimento = new Date();
    vencimento.setMonth(vencimento.getMonth() + mes);
    return moment(vencimento).format('YYYY-MM-DD');
  }

  geraNumeroBoleto(): string {
    const uuid = randomUUID();
    const caracteres = uuid.toString();
    return caracteres.substring(0, 10);
  }

  getDiaLiquidacao(): string {
    const hoje = new Date();
    return moment(hoje).format('DD/MM/YYYY');
  }

  //todo MOCK PARA CONFIRMAÇÃO PAGAMENTO
  async verificaConfirmacaoPagamentoVoucherMock() {
    const pagamentos = await this.pagamentoVoucherRepository
      .createQueryBuilder('pagamento')
      .leftJoinAndSelect(
        'pagamento.solicitacaoElegibilidade',
        'solicitacaoElegibilidade',
      )
      .leftJoinAndSelect(
        'solicitacaoElegibilidade.retornoAgrotools',
        'retornoAgrotools',
      )
      .where('pagamento.status = :status', { status: 'PENDENTE' })
      .getMany();

    if (pagamentos.length > 0) {
      for (const pagamento of pagamentos) {
        try {
          const propriedade =
            await this.propriedadeService.buscaPropriedadePorSolicitacao(
              pagamento.solicitacaoElegibilidade.id,
            );
          if (propriedade) {
            propriedade.voucher = randomUUID();
            propriedade.moduloFiscal =
              +pagamento.solicitacaoElegibilidade.retornoAgrotools
                .modulo_fiscal;
            propriedade.statusVoucher = true;
            propriedade.etapa = Etapas.Cadastro;
            propriedade.status = StatusEtapas.Cadastro.CadastroIncompleto;

            const proprietarios = propriedade.proprietarios.filter(
              (p) => p.pessoa.idUsuarioAgrotools != null,
            );

            if (proprietarios.length > 0) {
              await this.propriedadeService.atualizaPropriedadePrem(
                propriedade,
              );
              pagamento.voucherCode = propriedade.voucher;
              pagamento.status = StatusPagamento.LIQUIDADO;
              pagamento.dataPagamento = await this.getDataLiquidacaoMock();

              const territorio = {
                car: propriedade.carFederal,
                vlOwnerCode: propriedade.id.toString(),
                territoryName: propriedade.nomePropriedade,
                producersId: proprietarios.map(
                  (p) => p.pessoa.idUsuarioAgrotools,
                ),
                agents: [
                  {
                    name: propriedade.proprietarios[0].pessoa.nome,
                    document: propriedade.proprietarios[0].pessoa.cpfCnpj,
                  },
                ],
              } as TerritorioAgrotoolsRequest;

              const territorioBase = await this.consultaTerritorioBase(
                propriedade.id,
              );

              if (!territorioBase && proprietarios.length > 0) {
                let territorioResponse =
                  await this.agrotoolsService.consultarTerritorio(
                    propriedade.id,
                  );
                if (!territorioResponse) {
                  territorioResponse =
                    await this.agrotoolsService.criarTerritorio(territorio);
                  await this.salvaTerritorio(
                    territorioResponse,
                    propriedade,
                    pagamento,
                  );
                } else {
                  await this.salvaTerritorio(
                    territorioResponse,
                    propriedade,
                    pagamento,
                  );
                }
              } else {
                await this.pagamentoVoucherRepository.update(
                  pagamento.id,
                  pagamento,
                );
                await this.elegibilidadeService.enviarConfirmacaoPagamento(
                  pagamento.solicitacaoElegibilidade.email,
                  pagamento.solicitacaoElegibilidade.carFederal,
                  propriedade.nomePropriedade,
                );
              }
            }
          }
        } catch (error) {
          const erroFuncionalidade = {
            funcionalidade: 'CADASTRAR TERRITORIO',
            erro: error.toString(),
          };
          await this.erroFuncionalidadesRepository.save(erroFuncionalidade);
        }
      }
    }
  }

  async verificaConfirmacaoPagamentoMultaMock() {
    const pagamentos = await this.pagamentoMultaRepository
      .createQueryBuilder('pagamentoMulta')
      .leftJoinAndSelect('pagamentoMulta.propriedade', 'propriedade')
      .where('pagamentoMulta.status = :status', { status: 'PENDENTE' })
      .getMany();

    if (pagamentos) {
      for (const pagamento of pagamentos) {
        try {
          if (pagamento.propriedade) {
            pagamento.status = StatusPagamento.LIQUIDADO;
            pagamento.dataPagamento = this.getDiaLiquidacao();
            await this.pagamentoMultaRepository.update(pagamento.id, pagamento);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  async getDataLiquidacaoMock(): Promise<string> {
    const liquidacao = new Date();
    return moment(liquidacao).format('YYYY-MM-DD HH:mm:ss');
  }

  async consultaPagamento(
    idSolicitacao: number,
  ): Promise<PagamentoBoletoResponse | null> {
    const pagamento = await this.pagamentoVoucherRepository
      .createQueryBuilder('pagamento')
      .leftJoinAndSelect(
        'pagamento.solicitacaoElegibilidade',
        'solicitacaoElegibilidade',
      )
      .where('pagamento.idSolicitacao = :idSolicitacao', { idSolicitacao })
      .getOne();

    if (!pagamento) {
      return null;
    }

    const solicitacao = plainToInstance(
      SolicitacaoElegibilidadeResponse,
      pagamento?.solicitacaoElegibilidade,
      { excludeExtraneousValues: true },
    );
    const response = plainToInstance(PagamentoBoletoResponse, pagamento, {
      excludeExtraneousValues: true,
    });
    response.solicitacaoElegibilidade = solicitacao;
    return response;
  }
}
