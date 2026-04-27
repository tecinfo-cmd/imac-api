import { CreateElegibilidadeRequestDto } from './dto/create-elegibilidade-request.dto';
import { Repository } from 'typeorm';
import {
  SolicitacaoElegibilidade,
  StatusSolicitacaoEligibilidade,
} from './entities/solicitacao-elegibilidade.entity';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Simcard } from './dto/simcard-response';
import { EmailService } from '../email/email.service';
import * as process from 'process';
import { SolicitacaoEligibilidadeTemplate } from '../email/templates/solicitacao-eligibildade.template';
import { PropriedadeConsulta } from './entities/consulta/propriedade-consulta.entity';
import { ConsultaSolicitacaoQueryDto } from './dto/consulta-solicitacao-query-dto';
import { AgrotoolsService } from '../agrotools/agrotools.service';
import NegocioException from '../exception/negocio-exception';
import { ResultadoEligibilidadeTemplate } from '../email/templates/resultado-eligibilidade.template';
import { BuscarPorIdResponse } from './response/buscar-por-id-response';
import { DeteccosAgrotoolsResponse } from './response/deteccos-agrotools-response';
import { PagamentoAprovadoTemplate } from '../email/templates/pagamento-aprovado.template';
import { PagamentoRecusadoTemplate } from '../email/templates/pagamento-recusado.template';
import { Propriedade } from '../propriedade-prem/entities/propriedade.entity';
import { MensagemService } from '../message/mensagem.service';
import { RequestCarDto } from './dto/request-car-dto';
import { ItensResponse, PropriedadeDto } from './dto/consulta-car-response';
import { ProprietarioConsulta } from './entities/consulta/proprietario-consulta.entity';

@Injectable()
export class ElegibilidadeService {
  constructor(
    @InjectRepository(SolicitacaoElegibilidade)
    private readonly solicitacaoElegibilidadeRepository: Repository<SolicitacaoElegibilidade>,
    @InjectRepository(PropriedadeConsulta)
    private readonly propriedadeConsultaRepository: Repository<PropriedadeConsulta>,
    @InjectRepository(Propriedade)
    private readonly propriedadePremRepository: Repository<Propriedade>,
    private readonly httpService: HttpService,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => AgrotoolsService))
    private readonly agrotoolsService: AgrotoolsService,
    private readonly mensagemService: MensagemService,
  ) {}

  async listarPaginado(
    email?: string,
    numeroCar?: string,
    carEstadual?: string,
    status?: StatusSolicitacaoEligibilidade,
    nomeProdutor?: string,
    nomePropriedade?: string,
    cpfCnpj?: string,
    page = 0,
    size = 10,
  ): Promise<[any[], number]> {
    const query = this.solicitacaoElegibilidadeRepository
      .createQueryBuilder('eligibilidade')
      .leftJoin('eligibilidade.propriedade', 'propriedade')
      .select([
        'eligibilidade.id',
        'eligibilidade.nomePropriedade',
        'eligibilidade.telefone',
        'eligibilidade.email',
        'eligibilidade.cpfCnpj',
        'eligibilidade.carFederal',
        'eligibilidade.status',
        'eligibilidade.dataAtualizacao',
      ])
      .addSelect([
        'propriedade.carFederal',
        'propriedade.carEstadual',
        'propriedade.nomePropriedade',
      ])
      .leftJoinAndSelect(
        'TB_PROPRIEDADE_PROPRIETARIOS_TB_PROPRIETARIOS',
        'pp',
        'pp."ID_PROPRIEDADE" = propriedade."ID"',
      )
      .leftJoinAndSelect(
        'TB_PROPRIETARIOS',
        'pr',
        'pr."ID" = pp."ID_PROPRIETARIO"',
      )
      .leftJoinAndSelect('TB_PESSOA', 'pessoa', 'pessoa."ID" = pr."ID_PESSOA"')
      .addSelect(['pessoa.nome'])
      .where('eligibilidade."CONFIRMACAO_EMAIL" = :confirmacaoEmail', {
        confirmacaoEmail: 'SIM',
      });

    if (email) {
      query.andWhere('LOWER(eligibilidade."EMAIL") LIKE :email', {
        email: `%${email.toLowerCase()}%`,
      });
    }

    if (numeroCar) {
      query.andWhere('eligibilidade."CAR_FEDERAL" LIKE :numeroCar', {
        numeroCar: `%${numeroCar}%`,
      });
    }

    if (carEstadual) {
      query.andWhere('propriedade."CAR_ESTADUAL" LIKE :carEstadual', {
        carEstadual: `%${carEstadual}%`,
      });
    }

    if (status) {
      query.andWhere('eligibilidade."STATUS" = :status', { status });
    }

    if (nomeProdutor) {
      query.andWhere('LOWER(unaccent(pessoa."NOME")) LIKE :nomeProdutor', {
        nomeProdutor: `%${nomeProdutor.toLowerCase()}%`,
      });
    }

    if (nomePropriedade) {
      query.andWhere(
        'LOWER(propriedade."NOME_PROPRIEDADE") LIKE :nomePropriedade',
        {
          nomePropriedade: `%${nomePropriedade.toLowerCase()}%`,
        },
      );
    }

    if (cpfCnpj) {
      query.andWhere('eligibilidade."CPF_CNPJ" LIKE :cpfCnpj', {
        cpfCnpj: `%${cpfCnpj}%`,
      });
    }

    query.orderBy('eligibilidade.dataAtualizacao', 'DESC');

    query.skip((page - 1) * size).take(size);

    return query.getManyAndCount();
  }

  async buscarPorId(id: number) {
    const solicitacao = await this.solicitacaoElegibilidadeRepository.findOne({
      relations: ['retornoAgrotools', 'retornoAgrotools.deteccoes'],
      where: { id: id },
    });
    const response = plainToInstance(BuscarPorIdResponse, solicitacao, {
      excludeExtraneousValues: true,
    });
    // @ts-ignore
    response.retornoAgrotools.deteccoes = plainToInstance(
      DeteccosAgrotoolsResponse,
      solicitacao?.retornoAgrotools?.deteccoes,
    );
    return response;
  }

  async criarSolicitacao(
    createElegibilidadeRequestDto: CreateElegibilidadeRequestDto,
  ): Promise<void> {
    try {
      const carWithoutMask = createElegibilidadeRequestDto.carFederal.replace(
        /[.]/g,
        '',
      );

      const propriedade = await this.propriedadePremRepository.findOne({
        where: { carFederal: carWithoutMask },
      });

      if (propriedade) {
        throw new NegocioException(
          422,
          'Propriedade já cadastrada. Acesse aplicação ou procure o suporte. ',
        );
      }

      const propriedadeConsulta =
        await this.propriedadeConsultaRepository.findOne({
          where: { carFederal: carWithoutMask },
        });

      if (!propriedadeConsulta) {
        throw new BadRequestException('CAR não encontrado');
      }

      const solicitacaoExistente = await this.retornoSolicitacao(
        createElegibilidadeRequestDto.email,
        createElegibilidadeRequestDto.carFederal,
      );
      if (solicitacaoExistente) {
        if (solicitacaoExistente.confirmacaoEmail == 'NAO') {
          await this.enviarEmailDeConfirmacaoDeSolicitacao(
            solicitacaoExistente,
            propriedadeConsulta,
          );
          await this.mensagemService.enviarMensagen({
            telefone: solicitacaoExistente.telefone,
            nome: solicitacaoExistente.nomePropriedade,
            mensagem: 'Elegibilidade',
          });
        }
        throw new BadRequestException(
          'Existe solicitação pendente para este email e car, Confirme a solicitação',
        );
      }

      const elegibilidadeRequest = plainToInstance(SolicitacaoElegibilidade, {
        ...createElegibilidadeRequestDto,
        status: StatusSolicitacaoEligibilidade.Pendente,
        nomePropriedade: propriedadeConsulta.nomePropriedade.toUpperCase(),
        codigoMunicipio: propriedadeConsulta.codigoMunicipio,
        confirmacaoEmail: 'NAO',
      });

      const solicitacaoEligibilidade =
        await this.solicitacaoElegibilidadeRepository.save(
          elegibilidadeRequest,
        );
      await this.mensagemService.enviarMensagen({
        telefone: solicitacaoEligibilidade.telefone,
        nome: solicitacaoEligibilidade.nomePropriedade,
        mensagem: 'Elegibilidade',
      });
      await this.enviarEmailDeConfirmacaoDeSolicitacao(
        solicitacaoEligibilidade,
        propriedadeConsulta,
      );
    } catch (error) {
      throw new NegocioException(error.status, error.message);
    }
  }

  async consultaSolicitacao(email: string) {
    return await this.solicitacaoElegibilidadeRepository
      .createQueryBuilder('solicitacaoElegibilidade')
      .where('solicitacaoElegibilidade.email = :email', { email })
      .andWhere('solicitacaoElegibilidade.status = :status', {
        status: 'APROVADO',
      })
      .getMany();
  }

  async retornoSolicitacao(email: string, car: string) {
    const solicitacao = await this.solicitacaoElegibilidadeRepository
      .createQueryBuilder('solicitacaoElegibilidade')
      .where('solicitacaoElegibilidade.email = :email', { email })
      .andWhere('solicitacaoElegibilidade.carFederal =  :car', { car })
      .getOne();
    if (solicitacao) {
      return solicitacao;
    }
    return null;
  }

  async consultaPendentesValidacao() {
    return await this.solicitacaoElegibilidadeRepository
      .createQueryBuilder('solicitacaoElegibilidade')
      .where('solicitacaoElegibilidade.status = :status', {
        status: 'PENDENTE',
      })
      .andWhere('solicitacaoElegibilidade.transactionId IS NOT NULL')
      .getMany();
  }

  async consultaPendentesFrigorico() {
    return await this.solicitacaoElegibilidadeRepository
      .createQueryBuilder('solicitacaoElegibilidade')
      .where('solicitacaoElegibilidade.status = :status', {
        status: 'CONSULTADO',
      })
      .andWhere('solicitacaoElegibilidade.transactionId IS NOT NULL')
      .getMany();
  }

  async consultaPropriedadeConsultaCar(
    cpf?: string,
    cnpj?: string,
    carEstadual?: string,
  ): Promise<PropriedadeConsulta[]> {
    const propriedadeConsultas: Array<PropriedadeConsulta> = [];
    this.validaDados(cpf, cnpj, carEstadual);
    if (cpf != null && cpf != '') {
      const filtro = new RequestCarDto(null, cpf, null);
      const car = await this.consultaCar(filtro);
      await this.buscarOuInserirPropriedadeConsulta(
        car.itens,
        propriedadeConsultas,
        cpf,
      );
    }
    if (cnpj != null && cnpj != '') {
      const filtro = new RequestCarDto(cnpj);
      const car = await this.consultaCar(filtro);
      await this.buscarOuInserirPropriedadeConsulta(
        car.itens,
        propriedadeConsultas,
        cnpj,
      );
    }
    if (carEstadual != null && carEstadual != '') {
      carEstadual = carEstadual.trim();
      const propriedadeConsulta =
        await this.propriedadeConsultaRepository.findOne({
          where: { carEstadual },
          relations: ['cidade'],
        });

      if (propriedadeConsulta && propriedadeConsulta.proprietarios) {
        propriedadeConsulta.proprietariosConsulta = JSON.parse(
          propriedadeConsulta.proprietarios,
        ) as ProprietarioConsulta[];
        propriedadeConsultas.push(
          plainToInstance(PropriedadeConsulta, propriedadeConsulta),
        );
      }
    }

    if (propriedadeConsultas.length === 0) {
      throw new BadRequestException('PropriedadeConsulta/Car não encontrado');
    }

    return propriedadeConsultas;
  }

  validaDados(cpf?: string, cnpj?: string, carEstatual?: string) {
    if (
      (cpf == null || cpf == '') &&
      (cnpj == null || cnpj == '') &&
      (carEstatual == null || carEstatual == '')
    ) {
      throw new BadRequestException('Digite um parâmetro para consulta.');
    }
  }

  async inserePropriedadeConsulta(
    cardDados: Simcard[],
    PropriedadeConsultas: PropriedadeConsulta[],
  ) {
    for (const c of cardDados) {
      const PropriedadeConsulta =
        await this.propriedadeConsultaRepository.findOneBy({
          carEstadual: c.car,
        });
      if (PropriedadeConsulta) {
        PropriedadeConsultas.push(PropriedadeConsulta);
      }
    }
  }

  /**
   *
   * @param request
   */
  async consultaCar(request: RequestCarDto): Promise<PropriedadeDto> {
    const url = process.env.URL_CONSULTA_CAR as string;
    const headersRequest = {
      'X-Api-Key': `${process.env.KEY_CONSULTA_CAR as string}`,
      'Content-Type': 'application/json',
    };

    const { data } = await firstValueFrom(
      this.httpService
        .get<PropriedadeDto>(
          `${url}/consulta?cpf=${request.cpf}&cnpj=${request.cnpj}`,
          {
            headers: headersRequest,
          },
        )
        .pipe(
          catchError((error: any) => {
            throw new NegocioException(error, 'Erro ao consulta car');
          }),
        ),
    );

    return data;
  }

  private async enviarEmailDeConfirmacaoDeSolicitacao(
    solicitacaoEligibilidade: SolicitacaoElegibilidade,
    propriedadeConsulta: PropriedadeConsulta,
  ): Promise<void> {
    try {
      await this.emailService.enviarEmailTemplate({
        recipients: [solicitacaoEligibilidade.email],
        subject: 'Consulta de Eligibilidade',
        template: new SolicitacaoEligibilidadeTemplate({
          idSolicitacao: solicitacaoEligibilidade.id,
          carFederal: solicitacaoEligibilidade.carFederal,
          nomePropriedade: propriedadeConsulta.nomePropriedade,
          token: solicitacaoEligibilidade.token,
        }),
      });
    } catch (error) {
      throw new NegocioException(error.code, error.message);
    }
  }

  async buscarElegidibilidadePorEmail(email: string) {
    return this.solicitacaoElegibilidadeRepository.find({
      where: { email },
      relations: ['retornoAgrotools', 'cidade', 'propriedades'],
    });
  }

  async buscaSolicitacao(id: number) {
    return this.solicitacaoElegibilidadeRepository.findOneBy({ id });
  }

  async atualizaSolicitacao(solicitacao: SolicitacaoElegibilidade) {
    return this.solicitacaoElegibilidadeRepository.update(
      solicitacao.id,
      solicitacao,
    );
  }

  async atualizaSolicitacaoRetornoElegibilidade(
    solicitacao: SolicitacaoElegibilidade,
  ) {
    await this.enviarEmailDeElegibilidade(solicitacao);
    await this.solicitacaoElegibilidadeRepository.save(solicitacao);
  }

  async atualizaSolicitacaoRetornoElegibilidadeFrigorifico(
    solicitacao: SolicitacaoElegibilidade,
  ) {
    await this.solicitacaoElegibilidadeRepository.save(solicitacao);
  }

  async atualizaSolicitacaoRetornoElegibilidadeErro(
    solicitacao: SolicitacaoElegibilidade,
  ) {
    await this.solicitacaoElegibilidadeRepository.update(
      solicitacao.id,
      solicitacao,
    );
  }

  async consultaSolicitacaoElegibilidade(filtro: ConsultaSolicitacaoQueryDto) {
    const query =
      this.solicitacaoElegibilidadeRepository.createQueryBuilder('s');

    if (
      filtro.nomePropriedade == null &&
      filtro.codigoMunicipio == null &&
      filtro.carFederal == null
    ) {
      throw new BadRequestException('Nenhum parametro informado.');
    }

    query.leftJoinAndSelect('s.retornoAgrotools', 'retornoAgrotools');
    query.leftJoinAndSelect('s.cidade', 'cidade');
    query.where('s.confirmacaoEmail = :confEmail', { confEmail: 'SIM' });
    if (
      filtro.nomePropriedade !== null &&
      filtro.nomePropriedade !== undefined
    ) {
      query.andWhere('LOWER(s.nomePropriedade) LIKE :nomePropriedade', {
        nomePropriedade: `%${filtro.nomePropriedade?.toLowerCase()}%`,
      });
    }

    if (filtro.carFederal !== null && filtro.carFederal !== undefined) {
      query.andWhere('s.carFederal = :carFederal', {
        carFederal: filtro.carFederal?.replace(/[.]/g, ''),
      });
    }
    if (
      filtro.codigoMunicipio !== null &&
      filtro.codigoMunicipio !== undefined
    ) {
      query.andWhere('s.codigoMunicipio = :codigoMunicipio', {
        codigoMunicipio: filtro.codigoMunicipio,
      });
    }

    return query.getMany();
  }

  async buscaProprieddeConsulta(car: string) {
    const carWithoutMask = car.replace(/[.]/g, '');
    return await this.propriedadeConsultaRepository.findOne({
      where: { carFederal: carWithoutMask },
    });
  }

  async validarSolicitacao(id: number, token: string) {
    return await this.agrotoolsService.confirmarSolicitacao(id, token);
  }

  private async enviarEmailDeElegibilidade(
    solicitacaoEligibilidade: SolicitacaoElegibilidade,
  ): Promise<void> {
    try {
      await this.emailService.enviarEmailTemplate({
        recipients: [solicitacaoEligibilidade.email],
        subject: 'Retorno elegibilidade',
        template: new ResultadoEligibilidadeTemplate({
          car: solicitacaoEligibilidade.carFederal,
          carEstadual: solicitacaoEligibilidade.carEstadual,
          deteccoes: solicitacaoEligibilidade.retornoAgrotools.deteccoes,
          propriedadeApta: solicitacaoEligibilidade.retornoAgrotools.isEligible,
          areaDesmatamentoTotal:
            solicitacaoEligibilidade.retornoAgrotools.areas_desmatamento_total.toString(),
          numeroModulosFiscais:
            solicitacaoEligibilidade.retornoAgrotools.modulo_fiscal.toString(),
          valorMulta: solicitacaoEligibilidade.retornoAgrotools.vlr_multa
            ? solicitacaoEligibilidade.retornoAgrotools.vlr_multa.toString()
            : '00',
        }),
      });
    } catch (error) {
      throw new NegocioException(error.code, error.message);
    }
  }

  async consultaSolicitacaoValidada(carFederal: string) {
    return await this.solicitacaoElegibilidadeRepository
      .createQueryBuilder('solicitacaoElegibilidade')
      .innerJoinAndSelect(
        'solicitacaoElegibilidade.retornoAgrotools',
        'retornoAgrotools',
      )
      .innerJoinAndSelect('retornoAgrotools.deteccoes', 'deteccoes')
      .where('solicitacaoElegibilidade.carFederal = :carFederal', {
        carFederal: carFederal,
      })
      .getOne();
  }

  async graficoAcompanhamentoGeral(dataInicio?: string, dataFim?: string) {
    const infoPorDias = await this.solicitacaoElegibilidadeRepository.query(
      `SELECT *
       FROM "IMAC"."FN_GRAFICO_ACOMPANHAMENTO_GERAL"($1, $2)`,
      [dataInicio ?? null, dataFim ?? null],
    );

    const porIndicadores = await this.solicitacaoElegibilidadeRepository.query(
      `SELECT *
       FROM "IMAC"."FN_RESUMO_ELEGIBILIDADE"($1, $2)`,
      [dataInicio ?? null, dataFim ?? null],
    );

    return {
      porIndicadores,
      infoPorDias,
    };
  }

  async enviarConfirmacaoPagamento(email: string, car: string) {
    try {
      await this.emailService.enviarEmailTemplate({
        recipients: [email],
        subject: 'Confirmação de Pagamento',
        template: new PagamentoAprovadoTemplate({
          car: email,
        }),
      });
    } catch (error) {
      throw new NegocioException(error.code, error.message);
    }
  }

  async enviarEmailPagamentoRecusado(email: string, car: string) {
    try {
      await this.emailService.enviarEmailTemplate({
        recipients: [email],
        subject: 'Confirmação de Pagamento',
        template: new PagamentoRecusadoTemplate({
          car: email,
        }),
      });
    } catch (error) {
      throw new NegocioException(error.code, error.message);
    }
  }

  async salvarElegibilidade(
    solicitacaoElegibilidade: SolicitacaoElegibilidade,
  ) {
    return this.solicitacaoElegibilidadeRepository.save(
      solicitacaoElegibilidade,
    );
  }

  async buscarOuInserirPropriedadeConsulta(
    carResponses: ItensResponse[],
    propriedadeConsultas: PropriedadeConsulta[],
    cpfCnpj?: string | null,
  ) {
    for (const c of carResponses) {
      const propriedadeConsulta =
        await this.propriedadeConsultaRepository.findOneBy({
          carEstadual: c.numeroReciboFedederal,
        });
      if (propriedadeConsulta) {
        propriedadeConsultas.push(propriedadeConsulta);
      } else {
        let proprietarios: string = '';
        if (cpfCnpj) {
          proprietarios = JSON.stringify([
            { cpfCnpj: cpfCnpj, nome: c.propriedadeNome },
          ]);
        }
        const propConsulta = {
          carFederal: c.numeroReciboFedederal,
          carEstadual: c.numeroCompleto,
          nomePropriedade: c.propriedadeNome,
          proprietarios:
            proprietarios.length > 0 ? proprietarios : 'SEM_INFORMACAO',
        } as PropriedadeConsulta;

        const entity =
          await this.propriedadeConsultaRepository.save(propConsulta);
        propriedadeConsultas.push(entity);
      }
    }
  }
}
