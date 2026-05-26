import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as process from 'process';
import { catchError, firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import {
  SolicitacaoElegibilidade,
  StatusSolicitacaoEligibilidade,
} from '../elegibilidade/entities/solicitacao-elegibilidade.entity';
import { EntityManager, Equal, IsNull, Not, Raw, Repository } from 'typeorm';
import { ElegibilidadeService } from '../elegibilidade/elegibilidade.service';
import { ElegibilidadeRequest } from './request/elegibilidade-request';
import { RetornoElegibilidadeResponse } from './response/retorno-elegibilidade-response';
import { RetornoElebilidadeAsincResponse } from './response/retorno-elebilidade-asinc-response';
import { plainToInstance } from 'class-transformer';
import { RetornoAgrotools } from '../elegibilidade/entities/retorno-agrotools.entity';
import { PessoaService } from '../shared/service/pessoa.service';
import { ProprietarioPremService } from '../propriedade-prem/proprietario-prem.service';
import { PropriedadePremService } from '../propriedade-prem/propriedade-prem.service';
import { Proprietario } from '../propriedade-prem/entities/proprietario.entity';
import { Propriedade } from '../propriedade-prem/entities/propriedade.entity';
import { EligibilidadeAsyncAgrotoolsResponse } from './response/eligibilidade-async-agrotools-response';
import NegocioException from '../exception/negocio-exception';
import { TipoProprietatioEnum } from '../propriedade-prem/enum/tipo-proprietatio-enum';
import * as moment from 'moment';
import { PropriedadeConsulta } from '../elegibilidade/entities/consulta/propriedade-consulta.entity';
import { ProdutorAgrotools } from './request/produtor-agrotools';
import { ProdutorAgrotoolsResponse } from './response/produtor-agrotools-response';
import axios from 'axios';
import { TerritorioEntity } from './entities/territorio.entity';
import { TerritorioResponse } from './response/territorio-response';
import { TerritorioAgrotoolsRequest } from './request/territorio-agrotools-request';
import { ProtocoloResponse } from './response/protocolo-response';
import { AnaliseRequest } from './request/analise-request';
import { SolicitacaoAnaliseResponse } from './response/solicitacao-analise-response';
import { RetornoAnaliseEntity } from './entities/retorno-analise.entity';
import { DeteccoesAgrotools } from '../elegibilidade/entities/deteccoes-agrotools.entity';
import { DeteccoesAnaliseEntity } from './entities/deteccoes-analise.entity';
import { VistoriaAgrotools } from './request/vistoria-agrotools';
import { AutoVistoriaService } from '../propriedade-prem/auto-vistoria/auto-vistoria.service';
import { createHash } from 'crypto';
import { EnderecoProdutorAgrotools } from './request/endereco-produtor-agrotools';
import { UsuarioService } from '../usuario/usuario.service';
import { PlanoAdequacaoRequest } from './request/planoAdequacao/plano-adequacao-request';
import { RetornoPlanoAdequacao } from './response/planoAdequacao/retorno-plano-adequacao';
import { FormularioVistoriaResponse } from '../propriedade-prem/auto-vistoria/response/formulario-vistoria-response';
import { PlanoAdequacao } from '../propriedade-prem/analise-socioambiental/entities/plano-adequacao.entity';
import { ItensPlanoAdequacao } from './request/planoAdequacao/itens-plano-adequacao';
import { ImagemPlano } from './request/planoAdequacao/imagem-plano';
import { ContestacaoRequest } from './request/planoAdequacao/contestacao-request';
import { DocumentoContestacao } from './request/planoAdequacao/documento-contestacao';
import { RetornoAdequacao } from './response/planoAdequacao/retorno-adequacao';
import { DocumentoUploadService } from '../upload/documento-upload.service';
import { ImagemTerritorio } from './request/planoAdequacao/imagem-territorio';
import { AutoVistoriaRespnse } from './response/auto-vistoria-respnse';
import { UsuarioResponse } from '../usuario/response/usuario-response';
import { Usuario } from '../usuario/entities/usuario.entity';
import { AgentsRequest } from './request/agents-request';

@Injectable()
export class AgrotoolsService {
  private readonly url: string;

  headersRequest = {
    'X-Api-Key': `${process.env.TOKEN_AGROTOOLS as string}`,
    'Content-Type': 'application/json',
  };

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(RetornoAgrotools)
    private readonly retornoAgrotoolsRepository: Repository<RetornoAgrotools>,
    private readonly pessoaService: PessoaService,
    private readonly proprietarioService: ProprietarioPremService,
    private readonly propriedadeService: PropriedadePremService,
    @Inject(forwardRef(() => ElegibilidadeService))
    private readonly elegibilidadeService: ElegibilidadeService,
    @InjectRepository(TerritorioEntity)
    private readonly territorioRepository: Repository<TerritorioEntity>,
    @InjectRepository(RetornoAnaliseEntity)
    private readonly retornoAnaliseRepository: Repository<RetornoAnaliseEntity>,
    @Inject(forwardRef(() => AutoVistoriaService))
    private readonly autoVistoriaService: AutoVistoriaService,
    @Inject(forwardRef(() => UsuarioService))
    private readonly usuarioService: UsuarioService,
    @InjectRepository(PlanoAdequacao)
    private readonly planoAdequacaoRepository: Repository<PlanoAdequacao>,
    private readonly documentoUploadService: DocumentoUploadService,
    private readonly entityManager: EntityManager,
  ) {
    this.url = process.env.URL_AGROTOOLS as string;
  }

  /**
   * Integração agrotools solicicitação de elegibilidade
   * @param elegibilidadeRequest
   */
  async consultarElegibilidade(
    car: string,
  ): Promise<EligibilidadeAsyncAgrotoolsResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<EligibilidadeAsyncAgrotoolsResponse>(
          `${this.url}/Eligibility/async`,
          car,
          { headers: this.headersRequest },
        ),
      );

      return data;
    } catch (error) {
      throw new NegocioException(error?.status, this.getErroAgrotools(error));
    }
  }

  /**
   * Integração agrotools solicicitação de elegibilidade Assincrono
   * @param elegibilidadeRequest
   */
  async solicitaElegebilidade(
    elegibilidadeRequest: ElegibilidadeRequest,
  ): Promise<RetornoElebilidadeAsincResponse> {
    const { data } = await firstValueFrom(
      this.httpService
        .post<RetornoElebilidadeAsincResponse>(
          `${this.url}/Eligibility/async`,
          elegibilidadeRequest,
          { headers: this.headersRequest },
        )
        .pipe(
          catchError((error: any) => {
            throw new NegocioException(
              error.status,
              this.getErroAgrotools(error),
            );
          }),
        ),
    );
    return data;
  }

  /**
   * Consulta resultado elegibilidade
   * @param idTransacao
   */
  async verificaRetornoTransacao(
    idTransacao: string,
  ): Promise<RetornoElegibilidadeResponse> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<RetornoElegibilidadeResponse>(
          `${this.url}/Eligibility/${idTransacao}`,
          { headers: this.headersRequest },
        )
        .pipe(
          catchError((error: any) => {
            throw new NegocioException(
              error.status,
              this.getErroAgrotools(error),
            );
          }),
        ),
    );
    return data;
  }

  /**
   *  Cadastrar Pessoa Agrotools
   * @param produtorAgrotools
   */
  async cadastrarProdutor(
    produtorAgrotools: ProdutorAgrotools,
  ): Promise<ProdutorAgrotoolsResponse> {
    return await axios
      .post(`${this.url}/Person`, produtorAgrotools, {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw new NegocioException(error.status, this.getErroAgrotools(error));
      });
  }

  /**
   *
   * @param id
   */
  async consultarTerritorio(id: number): Promise<TerritorioResponse> {
    const codigo = id.toString();

    return await axios
      .get(`${this.url}/Territory/get-by-ownercode/${codigo}`, {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        return null;
      });
  }

  /**
   *
   * @param produtorAgrotools
   */
  async cadastrarProdutorJob(
    produtorAgrotools: ProdutorAgrotools,
  ): Promise<ProdutorAgrotoolsResponse> {
    return await axios
      .post(`${this.url}/Person`, produtorAgrotools, {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw new NegocioException(error.status, this.getErroAgrotools(error));
      });
  }

  /**
   * Consulta Pessoa com base no email
   * @param email
   */
  async consultarUsuarioCadastrado(
    email: string,
  ): Promise<ProdutorAgrotoolsResponse> {
    return await axios
      .get(`${this.url}/Person/email/${email}`, {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        return null;
      });
  }

  /**
   * Cadastra um produtor
   * @param produtorAgrotools
   */
  async cadastrarProdutorTemp(
    produtorAgrotools: ProdutorAgrotools,
  ): Promise<ProdutorAgrotoolsResponse> {
    return await axios
      .post(`${this.url}/Person`, produtorAgrotools, {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log(this.getErroAgrotools(error));
      });
  }

  /**
   * Consultar protocolos
   * @param produtorAgrotools
   */
  async consultarProtocolos(): Promise<ProtocoloResponse> {
    return await axios
      .get(`${this.url}/Analysis`, { headers: this.headersRequest })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log(this.getErroAgrotools(error));
      });
  }

  /**
   *  Solicitar Analise socioAmbiental
   * @param produtorAgrotools
   */
  async solicitarAnaliseSocioAmb(
    request: AnaliseRequest,
  ): Promise<SolicitacaoAnaliseResponse> {
    return await axios
      .post(`${this.url}/Analysis/pdf`, request, {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        //console.log(this.getErroAgrotools(error));
        throw new NegocioException(422, this.getErroAgrotools(error));
      });
  }

  /**
   * Solicita auto Vistoria
   * @param vistoriaRequest
   */
  async solicitarVistoria(
    vistoriaRequest: VistoriaAgrotools,
  ): Promise<AutoVistoriaRespnse> {
    return await axios
      .post(`${this.url}/Survey`, vistoriaRequest, {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw new NegocioException(422, this.getErroAgrotools(error));
      });
  }

  /**
   *
   * @param cdTerritory
   * @param idAnalise
   */
  async salvaPlanoAdequacao(
    cdTerritory: string,
    idAnalise: number,
  ): Promise<RetornoPlanoAdequacao> {
    const retornoAgrotools = await this.consultaAnalise(idAnalise);
    const planoAdequacao = await this.consultaPlanoPorIdAnalise(idAnalise);

    if (!planoAdequacao) {
      throw new NegocioException(404, 'Plano de adequação não encontrado');
    }

    if (!retornoAgrotools) {
      throw new NegocioException(404, 'retorno Agrotools não encontrado');
    }

    const request: PlanoAdequacaoRequest = {
      cdTerritory: cdTerritory,
      adequancyPlanItems: retornoAgrotools?.deteccoes.map(
        (d) =>
          ({
            idTad: d.idAgrotools,
            wkt: planoAdequacao.wkt,
            technicalReportUrl: retornoAgrotools?.urlRelatorio,
          }) as ItensPlanoAdequacao,
      ),
    };

    const data: RetornoPlanoAdequacao = await axios
      .post(`${this.url}/AdequancyPlan`, request, {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw new NegocioException(error.status, this.getErroAgrotools(error));
      });

    planoAdequacao.adequacaoId = data.adequancyPlanId;
    await this.atualizaIdContestacao(planoAdequacao);
    await this.territorioRepository.update(
      { codigoTerritorio: cdTerritory },
      { statusImagem: 'ATUALIZAR' },
    );
    return data;
  }

  /**
   *
   * @param codigoTerritory
   */
  async retornaImagemPlano(codigoTerritory: string): Promise<TerritorioEntity> {
    const territorio = await this.territorioRepository.findOne({
      where: {
        codigoTerritorio: codigoTerritory,
      },
    });

    if (!territorio) {
      throw new NegocioException(404, 'Territor não encontrado');
    }

    const data: ImagemPlano = await axios
      .post(`${this.url}/AdequancyPlan/generate-image/${codigoTerritory}`, {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw new NegocioException(error.status, error?.response.data.message);
      });
    if (data) {
      const documento = await this.documentoUploadService.uploadBase64Image(
        data.base64Image,
      );
      territorio.imagemAdequacao = documento.url;
      await this.territorioRepository.update(territorio.id, territorio);

      return territorio;
    }

    return territorio;
  }

  async retornaImagemPlanoJob(
    codigoTerritory: string,
    hashImagem?: string,
  ): Promise<TerritorioEntity | null> {
    const territorio = await this.territorioRepository.findOne({
      where: {
        codigoTerritorio: codigoTerritory,
      },
    });

    if (!territorio) {
      throw new NegocioException(404, 'Territor não encontrado');
    }

    const data: ImagemPlano = await axios
      .post(`${this.url}/AdequancyPlan/generate-image/${codigoTerritory}`, {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log(this.getErroAgrotools(error));
      });

    if (data) {
      const hashImagemAgrotools = createHash('sha256')
        .update(data.base64Image)
        .digest('hex');

      if (hashImagem === hashImagemAgrotools) {
        return null;
      }

      const documento = await this.documentoUploadService.uploadBase64Image(
        data.base64Image,
      );
      territorio.hashImagem = hashImagemAgrotools;
      territorio.imagemAdequacao = documento.url;
      territorio.statusImagem = 'ATUALIZADA';
      await this.territorioRepository.update(territorio.id, territorio);

      return territorio;
    }

    return null;
  }

  //TODO: Da para juntar as funções elas se repetem na maior parte
  async retornaImagemTerritorio(codigoTerritory: string, hashImagem?: string) {
    const territorio = await this.territorioRepository.findOne({
      where: {
        codigoTerritorio: codigoTerritory,
      },
    });

    if (!territorio) {
      throw new NegocioException(404, 'Territor não encontrado');
    }

    const data: ImagemTerritorio = await axios
      .post(`${this.url}/Image/generate-image/${codigoTerritory}`, '', {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log(error.error);
      });

    if (data) {
      const hashImagemAgrotools = createHash('sha256')
        .update(data.base64Image)
        .digest('hex');

      if (hashImagem === hashImagemAgrotools) {
        return null;
      }

      const documento = await this.documentoUploadService.uploadBase64Image(
        data.base64Image,
      );
      territorio.hashImagem = hashImagemAgrotools;
      territorio.imagemAdequacao = documento.url;
      territorio.statusImagem = 'ATUALIZADA';
      await this.territorioRepository.update(territorio.id, territorio);

      return territorio;
    }

    return null;
  }

  async buscarDocumento(
    idAnalise: number,
    cdTerritory: string,
  ): Promise<RetornoAnaliseEntity> {
    const retornoAgrotools = await this.consultaAnalise(idAnalise);

    if (!retornoAgrotools) {
      throw new NegocioException(404, 'retorno Agrotools não encontrado');
    }

    const data: DocumentoContestacao = await axios
      .get(`${this.url}/Contestation/${cdTerritory}`, {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        this.salvaErroRetornoAgrotools(
          retornoAgrotools,
          this.getErroAgrotools(error),
        );
        throw new NegocioException(error.status, this.getErroAgrotools(error));
      });

    for (const deteccoes of retornoAgrotools.deteccoes) {
      const document = data.documents.find(
        (d) => (d.idTad = deteccoes.idAgrotools),
      );
      if (document) {
        deteccoes.urlContestacao = document.technicalReportUrl;
      }
    }

    await this.retornoAnaliseRepository.save(retornoAgrotools);
    return retornoAgrotools;
  }

  /**
   *
   * @param cdTerritory
   * @param idAnalise
   */
  async salvaContestacao(
    cdTerritory: string,
    idAnalise: number,
  ): Promise<RetornoAdequacao> {
    const retornoAgrotools = await this.consultaAnalise(idAnalise);

    if (!retornoAgrotools) {
      throw new NegocioException(404, 'retorno Agrotools não encontrado');
    }

    const documentosAnalise = retornoAgrotools.documentos;

    if (!documentosAnalise) {
      throw new NegocioException(404, 'Documento não encontrado');
    }

    const request: ContestacaoRequest = {
      cdTerritory: cdTerritory,
      contestation: retornoAgrotools?.deteccoes.map(
        (d) =>
          ({
            idTad: d.idAgrotools,
            wkt: d.wkt,
            technicalReportUrl: documentosAnalise[0].urlArquivo,
            typeContestation: d.tipoDeteccao,
          }) as ItensPlanoAdequacao,
      ),
    };

    const data: RetornoAdequacao = await axios
      .post(`${this.url}/Contestation`, request, {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        this.salvaErroRetornoAgrotools(
          retornoAgrotools,
          this.getErroAgrotools(error),
        );
        throw new NegocioException(error.status, this.getErroAgrotools(error));
      });

    retornoAgrotools.contestacaoId = data.contestationId;
    await this.territorioRepository.update(
      { codigoTerritorio: cdTerritory },
      { statusImagem: 'ATUALIZAR' },
    );
    await this.retornoAnaliseRepository.save(retornoAgrotools);
    return data;
  }

  /**
   * consulta formulario
   * @param surveyId
   */
  async buscarFormulario(
    codigoEvidence: number,
  ): Promise<FormularioVistoriaResponse> {
    return await axios
      .get(`${this.url}/Survey/${codigoEvidence}`, {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        console.log(this.getErroAgrotools(error));
      });
  }

  async consultaAnaliseSocioAmbiental(
    request: AnaliseRequest,
    idPropriedade: number,
  ): Promise<RetornoAnaliseEntity> {
    const retornoExistente =
      await this.consultaAnalisePorIdPropropriedade(idPropriedade);

    if (!retornoExistente) {
      const solicitacao = await this.solicitarAnaliseSocioAmb(request);
      if (solicitacao) {
        const retornoAnalise = {
          urlRelatorio: solicitacao.reportUrl,
          idPropriedade: idPropriedade,
          areaDesmatadaTotal: solicitacao.areas_desmatamento_total,
          moduloFiscal: solicitacao.modulo_fiscal,
          valorMulta: solicitacao.vlr_multa,
          descontoPercentual: solicitacao.desconto_perc,
          deteccoes: solicitacao.deteccoes.map(
            (d) =>
              ({
                tipo: d.tipo,
                area_ha: d.area_ha.toString(),
                idAgrotools: d.id,
              }) as DeteccoesAnaliseEntity,
          ),
          dataCriacao: moment(new Date()).format('DD-MMM-YYYY HH:mm:ss'),
          dataAtualizacao: moment(new Date()).format('DD-MMM-YYYY HH:mm:ss'),
        } as RetornoAnaliseEntity;

        // Validar se seria melhor local
        await this.retornaImagemTerritorio(request.cdTerritory);
        return await this.retornoAnaliseRepository.save(retornoAnalise);
      } else {
        throw new BadRequestException('Consulta não disponivel.');
      }
    } else {
      throw new NegocioException(
        422,
        'Analise Socioambiental já foi solicitada',
      );
    }
  }

  async confirmarSolicitacao(
    id: number,
    token: string,
  ): Promise<SolicitacaoElegibilidade> {
    const solicitacaoEligibilidade =
      await this.elegibilidadeService.buscaSolicitacao(id);

    if (!solicitacaoEligibilidade) {
      throw new BadRequestException(
        'Solicitação de eligibilidade não encontrada',
      );
    }

    if (
      solicitacaoEligibilidade.status !==
      StatusSolicitacaoEligibilidade.Pendente
    ) {
      throw new BadRequestException('Solicitação ja processada');
    }

    if (solicitacaoEligibilidade.transactionId != null) {
      throw new BadRequestException('Solicitação em fila para validação');
    }

    if (solicitacaoEligibilidade.token !== token) {
      throw new BadRequestException('Token inválido');
    }

    try {
      const solicitacaoVerificada =
        await this.elegibilidadeService.consultaSolicitacaoValidada(
          solicitacaoEligibilidade.carFederal,
        );
      if (solicitacaoVerificada) {
        solicitacaoEligibilidade.transactionId =
          solicitacaoVerificada.transactionId;
      } else {
        const elegibilidade = { car: solicitacaoEligibilidade.carFederal };
        const retornoAgrotools =
          await this.solicitaElegebilidade(elegibilidade);

        if (retornoAgrotools) {
          solicitacaoEligibilidade.transactionId =
            retornoAgrotools.transactionId;
        }
      }

      solicitacaoEligibilidade.confirmacaoEmail = 'SIM';
      await this.elegibilidadeService.atualizaSolicitacao(
        solicitacaoEligibilidade,
      );

      return solicitacaoEligibilidade;
    } catch (error) {
      throw new NegocioException(error.status, error?.message);
    }
  }

  async consultaTransacao() {
    const solicitacoes =
      await this.elegibilidadeService.consultaPendentesValidacao();
    const formattedDate = moment(new Date()).format('DD-MMM-YYYY HH:mm:ss');
    if (solicitacoes && solicitacoes.length > 0) {
      for (const sol of solicitacoes) {
        try {
          const solicitacaoVerificada =
            await this.elegibilidadeService.consultaSolicitacaoValidada(
              sol.carFederal,
            );
          if (solicitacaoVerificada?.status == 'ERRO_RETORNO') {
            sol.dataAtualizacao = formattedDate;
            sol.status = solicitacaoVerificada.status;
            await this.elegibilidadeService.atualizaSolicitacaoRetornoElegibilidade(
              sol,
            );
          } else if (solicitacaoVerificada) {
            sol.retornoAgrotools = solicitacaoVerificada.retornoAgrotools;
            sol.dataAtualizacao = formattedDate;
            sol.status = solicitacaoVerificada.status;
            await this.cadastrarProprietario(sol);
            await this.elegibilidadeService.atualizaSolicitacaoRetornoElegibilidade(
              sol,
            );
          } else {
            await this.verificaElegibilidadeAgrotools(sol);
          }
        } catch (error) {
          Logger.error(error.message, error?.message);
        }
      }
    }
  }

  async verificaElegibilidadeAgrotools(soliciatacao: SolicitacaoElegibilidade) {
    const retorno = await this.verificaRetornoTransacao(
      soliciatacao.transactionId,
    );
    if (retorno && retorno.status !== 'Error') {
      const detc = retorno.deteccoes.map(
        (d) =>
          ({
            tipo: d.tipo,
            area_ha: d.area_ha,
            idAgrotools: d.id,
          }) as DeteccoesAgrotools,
      );
      const retornoAgr = plainToInstance(RetornoAgrotools, retorno);
      retornoAgr.deteccoes = detc;
      const retornoAgrotools =
        await this.retornoAgrotoolsRepository.save(retornoAgr);
      soliciatacao.retornoAgrotools = retornoAgrotools;
      soliciatacao.status = retornoAgrotools.isEligible
        ? 'APROVADO'
        : 'REPROVADO';
      const propriedade = await this.cadastrarPropriedadeElegivel(soliciatacao);
      if (propriedade) {
        await this.elegibilidadeService.atualizaSolicitacaoRetornoElegibilidade(
          soliciatacao,
        );
      }
    } else {
      soliciatacao.status = 'ERRO_RETORNO';
      await this.elegibilidadeService.atualizaSolicitacaoRetornoElegibilidadeErro(
        soliciatacao,
      );
    }
  }

  async verificaElegibilidadeFrigorifico(
    soliciatacao: SolicitacaoElegibilidade,
  ) {
    const retorno = await this.verificaRetornoTransacao(
      soliciatacao.transactionId,
    );
    if (retorno && retorno.status !== 'Error') {
      const detc = retorno.deteccoes.map(
        (d) =>
          ({
            tipo: d.tipo,
            area_ha: d.area_ha,
            idAgrotools: d.id,
          }) as DeteccoesAgrotools,
      );
      const retornoAgr = plainToInstance(RetornoAgrotools, retorno);
      retornoAgr.deteccoes = detc;
      const retornoAgrotools =
        await this.retornoAgrotoolsRepository.save(retornoAgr);
      soliciatacao.retornoAgrotools = retornoAgrotools;
      soliciatacao.status = retornoAgrotools.isEligible
        ? 'APROVADO'
        : 'REPROVADO';
      await this.atualizaSolicitacaoFrigorifico(soliciatacao);
    } else {
      soliciatacao.status = 'ERRO_RETORNO';
      await this.atualizaSolicitacaoFrigorifico(soliciatacao);
    }
  }

  async criarTerritorio(
    territorioAgrotools: TerritorioAgrotoolsRequest,
  ): Promise<TerritorioResponse> {
    return await axios
      .post(`${this.url}/Territory`, territorioAgrotools, {
        headers: this.headersRequest,
      })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw new NegocioException(error?.status, this.getErroAgrotools(error));
      });
  }

  async cadastrarPropriedadeElegivel(
    solicitacaoElegibilidade: SolicitacaoElegibilidade,
  ) {
    if (solicitacaoElegibilidade) {
      try {
        const propriedadeCadastrada =
          await this.propriedadeService.consultaPropriedadePorCar(
            solicitacaoElegibilidade.carFederal,
          );
        const usuarioAnalista = await this.consultaUsuarioAnalista();

        if (propriedadeCadastrada) {
          const pessoa = await this.pessoaService.buscaOuCadastraPessoa(
            solicitacaoElegibilidade,
          );
          const proprietario = {
            pessoa: pessoa,
            telefone: solicitacaoElegibilidade.telefone,
            tipoProprietario: TipoProprietatioEnum.CO_PROPRIETARIO,
          } as Proprietario;
          const proprietarioSave =
            await this.proprietarioService.cadastraProprietario(proprietario);
          if (proprietarioSave) {
            propriedadeCadastrada.analista = usuarioAnalista;
            propriedadeCadastrada.proprietarios.push(proprietarioSave);
            return await this.propriedadeService.cadastrarPropriedade(
              propriedadeCadastrada,
            );
          }
        } else {
          const propriedadeConsulta =
            await this.elegibilidadeService.buscaProprieddeConsulta(
              solicitacaoElegibilidade.carFederal,
            );
          if (propriedadeConsulta) {
            return this.cadastrarPropriedadeEProprietario(
              propriedadeConsulta,
              solicitacaoElegibilidade,
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async cadastrarPropriedadeEProprietario(
    propriedadeConsulta: PropriedadeConsulta,
    solicitacaoElegibilidade: SolicitacaoElegibilidade,
  ) {
    let props;
    if (propriedadeConsulta.proprietarios) {
      props = JSON.parse(propriedadeConsulta.proprietarios);
    } else {
      props = {
        cpfCnpj: solicitacaoElegibilidade.cpfCnpj,
        nome: solicitacaoElegibilidade.nomePropriedade,
      };
    }

    const pessoa = await this.pessoaService.buscaOuCadastra(
      solicitacaoElegibilidade,
      props,
    );
    const proprietario = {
      pessoa: pessoa,
      telefone: solicitacaoElegibilidade.telefone,
      tipoProprietario: TipoProprietatioEnum.PROPRIETARIO,
    } as Proprietario;
    const proprietarios: Proprietario[] = [];
    const usuarioAnalista = await this.consultaUsuarioAnalista();
    const proprietarioSave =
      await this.proprietarioService.cadastraProprietario(proprietario);
    if (proprietarioSave) {
      proprietarios.push(proprietarioSave);
      const propriedade = {
        carFederal: solicitacaoElegibilidade.carFederal,
        carEstadual: propriedadeConsulta.carEstadual,
        proprietarios: proprietarios,
        nomePropriedade: solicitacaoElegibilidade.nomePropriedade,
        codigoMunicipio: solicitacaoElegibilidade.codigoMunicipio,
        moduloFiscal: +solicitacaoElegibilidade.retornoAgrotools.modulo_fiscal,
        idSolicitacaoElegibilidade: solicitacaoElegibilidade.id,
        analista: usuarioAnalista,
      } as Propriedade;
      return await this.propriedadeService.cadastrarPropriedade(propriedade);
    }
  }

  async consultaFormularioAutoVistoria() {
    const autoVistorias = await this.autoVistoriaService.listarAutovistoria();
    for (const vistoria of autoVistorias) {
      const formulario = await this.buscarFormulario(vistoria.codigoEvidencia);
      if (formulario && formulario.reportUrl != null) {
        vistoria.formulario = JSON.stringify(formulario);
        await this.autoVistoriaService.atualizar(vistoria);
      }
    }
  }

  async cadastrarProprietario(
    solicitacaoElegibilidade: SolicitacaoElegibilidade,
  ) {
    const propriedadeCadastrada =
      await this.propriedadeService.consultaPropriedadePorCar(
        solicitacaoElegibilidade.carFederal,
      );

    if (propriedadeCadastrada) {
      const usuarioAnalista = await this.consultaUsuarioAnalista();
      const pessoa = await this.pessoaService.buscaOuCadastraPessoa(
        solicitacaoElegibilidade,
      );
      const proprietario = {
        pessoa: pessoa,
        telefone: solicitacaoElegibilidade.telefone,
        tipoProprietario: TipoProprietatioEnum.PROPRIETARIO,
      } as Proprietario;
      const proprietarioSave =
        await this.proprietarioService.cadastraProprietario(proprietario);
      if (proprietarioSave) {
        propriedadeCadastrada.analista = usuarioAnalista;
        propriedadeCadastrada.proprietarios.push(proprietarioSave);
        return await this.propriedadeService.cadastrarPropriedade(
          propriedadeCadastrada,
        );
      }
    }
  }

  async consultaUsuarioAnalista(): Promise<Usuario> {
    const sql = `select u."EMAIL" email, count(tp."ID_USUARIO_ANALISTA") qtd
                 from "IMAC"."TB_USUARIOS" u
                        inner join "IMAC"."TB_USUARIO_ROLE" tur on tur."ID_USUARIO" = u."ID"
                        left join "IMAC"."TB_PROPRIEDADES" tp on u."ID" = tp."ID_USUARIO_ANALISTA"
                 where tur."ID_ROLE" = 2
                   and u."STATUS" != 'INATIVO'
                 group by u."EMAIL"
                 order by qtd asc
                   limit 1;`;
    const dados = await this.entityManager.query(sql);
    return await this.usuarioService.buscarUsuarioPorEmail(dados[0].email);
  }

  async cadastraPessoaAgrotools() {
    const usuarios =
      await this.usuarioService.consultarUsuariosCadastroAgrotools();

    if (usuarios.length > 0) {
      for (const usuario of usuarios) {
        try {
          const produtorAgortols = {
            name: usuario.pessoa.nome,
            document: usuario.pessoa.cpfCnpj,
            email: usuario.email,
            password: 'Temp@123456',
            phone: usuario.pessoa.telefone,
            address: {
              zipCode: usuario.cep ? usuario.cep : '78048250',
              number: usuario.numero ? usuario.cep : '525',
              complement: usuario.logradouro
                ? usuario.cep
                : 'Av. Dr. Hélio Ribeiro, 525 - Sala 701',
            } as EnderecoProdutorAgrotools,
          } as ProdutorAgrotools;

          const response = await this.consultarUsuarioCadastrado(
            usuario.pessoa.email,
          );

          const pessoa = await this.pessoaService.buscaPessoaEmail(
            usuario.pessoa.email,
          );

          if (response) {
            pessoa.idUsuarioAgrotools = response.idUser
              ? response.idUser
              : response.userId;
            await this.pessoaService.atualizarPessoa(pessoa);
          } else {
            const produtorResponse =
              await this.cadastrarProdutorJob(produtorAgortols);
            if (produtorResponse) {
              pessoa.idUsuarioAgrotools = produtorResponse.idUser
                ? produtorResponse.idUser
                : produtorResponse.userId;
              await this.pessoaService.atualizarPessoa(pessoa);
            }
          }
        } catch (error) {
          usuario.erroIntegracao = error.message;
          await this.usuarioService.salvarUsuario(usuario);
        }
      }
    }
  }

  async consultaPlanoPorIdAnalise(idAnalise: number) {
    return await this.planoAdequacaoRepository.findOne({
      where: {
        idAnalise: idAnalise,
      },
    });
  }

  async consultaAnalisePorIdPropropriedade(idPropriedade: number) {
    return await this.retornoAnaliseRepository.findOne({
      where: {
        idPropriedade: idPropriedade,
      },
    });
  }

  async atualizaIdContestacao(planoAdequacao: PlanoAdequacao) {
    await this.planoAdequacaoRepository.update(
      planoAdequacao.id,
      planoAdequacao,
    );
  }

  async consultaAnalise(idAnalise: number) {
    return await this.retornoAnaliseRepository.findOne({
      where: {
        id: idAnalise,
        erroAgrotools: IsNull(),
        deteccoes: {
          tipoDeteccao: Not(IsNull()),
        },
      },
      relations: ['deteccoes', 'documentos'],
    });
  }

  private async verificaContestacoesAnaliseNaoSalvas() {
    const analiseComContestacoesNaoSalvas =
      await this.retornoAnaliseRepository.find({
        where: [
          {
            contestacaoId: IsNull(),
            contestacaoAutorizacaoSupressao: {
              situacao: Raw(
                (alias) =>
                  `LOWER(${alias}) IN ('deferido', 'deferido parcialmente')`,
              ),
            },
          },
          {
            contestacaoId: IsNull(),
            contestacaoLaudo: {
              situacao: Raw(
                (alias) =>
                  `LOWER(${alias}) IN ('deferido', 'deferido parcialmente')`,
              ),
            },
          },
        ],
        relations: [
          'contestacaoAutorizacaoSupressao',
          'contestacaoLaudo',
          'propriedade',
          'propriedade.territorios',
        ],
      });

    await Promise.allSettled(
      analiseComContestacoesNaoSalvas.flatMap((analise) => {
        return analise.propriedade?.territorios.map((territorio) =>
          this.salvaContestacao(territorio.codigoTerritorio, analise.id),
        );
      }),
    );
  }

  private async verificaContestacoesSemDocumento() {
    const contestacoesAnalisesSalvasSemUrl =
      await this.retornoAnaliseRepository.find({
        where: {
          contestacaoId: Not(IsNull()),
          erroAgrotools: IsNull(),
          deteccoes: {
            urlContestacao: IsNull(),
          },
        },
        relations: ['deteccoes', 'propriedade', 'propriedade.territorios'],
      });

    await Promise.allSettled(
      contestacoesAnalisesSalvasSemUrl.flatMap((analise) => {
        return analise.propriedade?.territorios.map((territorio) =>
          this.buscarDocumento(analise.id, territorio.codigoTerritorio),
        );
      }),
    );
  }

  private async verificaAnaliseSemImagem() {
    const AnalisesSalvasSemImagem = await this.retornoAnaliseRepository.find({
      where: {
        contestacaoId: IsNull(),
        propriedade: {
          territorios: {
            imagemAdequacao: IsNull(),
          },
        },
        planoAdequacao: {
          adequacaoId: IsNull(),
        },
      },
      relations: [
        'deteccoes',
        'propriedade',
        'propriedade.territorios',
        'planoAdequacao',
      ],
    });

    await Promise.allSettled(
      AnalisesSalvasSemImagem.flatMap((analise) => {
        return analise.propriedade?.territorios.map((territorio) =>
          this.retornaImagemTerritorio(
            territorio.codigoTerritorio,
            territorio.hashImagem,
          ),
        );
      }),
    );
  }

  private async verificaContestacoesSemImagem() {
    const contestacoesAnalisesSalvasSemImagem =
      await this.retornoAnaliseRepository.find({
        where: {
          contestacaoId: Not(IsNull()),
          propriedade: {
            territorios: {
              statusImagem: Equal('ATUALIZAR'),
            },
          },
          planoAdequacao: {
            adequacaoId: IsNull(),
          },
        },
        relations: [
          'deteccoes',
          'propriedade',
          'propriedade.territorios',
          'planoAdequacao',
        ],
      });

    await Promise.allSettled(
      contestacoesAnalisesSalvasSemImagem.flatMap((analise) => {
        return analise.propriedade?.territorios.map((territorio) =>
          this.retornaImagemTerritorio(
            territorio.codigoTerritorio,
            territorio.hashImagem,
          ),
        );
      }),
    );
  }

  private async verficaPlanosAdequacaoNaoSalvos() {
    const planosAdequacaoNaoSalvos = await this.planoAdequacaoRepository.find({
      where: {
        adequacaoId: IsNull(),
        situacao: Raw(
          (alias) => `LOWER(${alias}) IN ('deferido', 'deferido parcialmente')`,
        ),
      },
      relations: [
        'analiseSocioambiental',
        'analiseSocioambiental.propriedade',
        'analiseSocioambiental.propriedade.territorios',
      ],
    });

    await Promise.allSettled(
      planosAdequacaoNaoSalvos.flatMap((plano) => {
        return plano.analiseSocioambiental.propriedade?.territorios.map(
          async (territorio) => {
            return this.salvaPlanoAdequacao(
              territorio.codigoTerritorio,
              plano.analiseSocioambiental.id,
            );
          },
        );
      }),
    );
  }

  private async verificaPlanosAdequacaoSemImagem() {
    const planosAdequacaoSalvasSemImagem =
      await this.planoAdequacaoRepository.find({
        where: {
          adequacaoId: Not(IsNull()),
          analiseSocioambiental: {
            propriedade: {
              territorios: {
                statusImagem: Equal('ATUALIZAR'),
              },
            },
          },
        },
        relations: [
          'analiseSocioambiental',
          'analiseSocioambiental.propriedade',
          'analiseSocioambiental.propriedade.territorios',
        ],
      });

    await Promise.allSettled(
      planosAdequacaoSalvasSemImagem.flatMap((plano) => {
        return plano.analiseSocioambiental.propriedade?.territorios.map(
          (territorio) =>
            this.retornaImagemPlanoJob(territorio.codigoTerritorio),
        );
      }),
    );
  }

  async verificaAnalise() {
    try {
      await this.verificaAnaliseSemImagem();
    } catch (error) {
      Logger.error(error.message, error?.message);
    }
  }

  async verificaContestacoesAnalise() {
    try {
      await this.verificaContestacoesAnaliseNaoSalvas();
      await this.verificaContestacoesSemDocumento();
      await this.verificaContestacoesSemImagem();
    } catch (error) {
      Logger.error(error.message, error?.message);
    }
  }

  async verificaPlanosAdequacao() {
    try {
      await this.verficaPlanosAdequacaoNaoSalvos();
      await this.verificaPlanosAdequacaoSemImagem();
    } catch (error) {
      Logger.error(error.message, error?.message);
    }
  }

  async consultaSolicitacaoFrigorifico(
    solicitacao: SolicitacaoElegibilidade,
  ): Promise<SolicitacaoElegibilidade> {
    const data = await this.solicitaElegebilidade({
      car: solicitacao.carFederal,
    });
    solicitacao.transactionId = data.transactionId;
    const retorno = await this.verificaRetornoTransacao(
      solicitacao.transactionId,
    );
    if (retorno.status == 'Started') {
      return await this.elegibilidadeService.salvarElegibilidade(solicitacao);
    } else if (retorno && retorno.status !== 'Error') {
      const detc = retorno.deteccoes.map(
        (d) =>
          ({
            tipo: d.tipo,
            area_ha: d.area_ha,
            idAgrotools: d.id,
          }) as DeteccoesAgrotools,
      );
      const retornoAgr = plainToInstance(RetornoAgrotools, retorno);
      retornoAgr.deteccoes = detc;
      const retornoAgrotools =
        await this.retornoAgrotoolsRepository.save(retornoAgr);
      solicitacao.retornoAgrotools = retornoAgrotools;
      solicitacao.status = retornoAgrotools.isEligible
        ? 'APROVADO'
        : 'REPROVADO';
      return await this.elegibilidadeService.salvarElegibilidade(solicitacao);
    } else {
      solicitacao.status = 'ERRO_RETORNO';
      return await this.elegibilidadeService.salvarElegibilidade(solicitacao);
    }
  }

  async consultaTransacaoFrigorico() {
    const solicitacoes =
      await this.elegibilidadeService.consultaPendentesFrigorico();
    const formattedDate = moment(new Date()).format('DD-MMM-YYYY HH:mm:ss');
    if (solicitacoes && solicitacoes.length > 0) {
      for (const sol of solicitacoes) {
        try {
          const solicitacaoVerificada =
            await this.elegibilidadeService.consultaSolicitacaoValidada(
              sol.carFederal,
            );
          if (solicitacaoVerificada?.status == 'ERRO_RETORNO') {
            sol.dataAtualizacao = formattedDate;
            sol.status = solicitacaoVerificada.status;
            await this.atualizaSolicitacaoFrigorifico(sol);
          } else if (
            solicitacaoVerificada?.status == 'APROVADO' ||
            solicitacaoVerificada?.status == 'REPROVADO'
          ) {
            sol.retornoAgrotools = solicitacaoVerificada.retornoAgrotools;
            sol.dataAtualizacao = formattedDate;
            sol.status = solicitacaoVerificada.status;
            await this.atualizaSolicitacaoFrigorifico(sol);
          } else {
            await this.verificaElegibilidadeFrigorifico(sol);
          }
        } catch (error) {
          Logger.error(error.message, error?.message);
        }
      }
    }
  }

  async atualizaSolicitacaoFrigorifico(solicitacao: SolicitacaoElegibilidade) {
    await this.elegibilidadeService.atualizaSolicitacaoRetornoElegibilidadeFrigorifico(
      solicitacao,
    );
  }

  async cadastrarPropriedadeEProprietarioFrigorifico(
    usuario: UsuarioResponse,
    solicitacaoElegibilidade: SolicitacaoElegibilidade,
  ) {
    const pessoa = await this.pessoaService.buscaPessoaEmail(usuario.email);
    const proprietario = {
      pessoa: pessoa,
      telefone: usuario.pessoa.telefone,
      tipoProprietario: TipoProprietatioEnum.PROPRIETARIO,
    } as Proprietario;
    const proprietarios: Proprietario[] = [];
    const proprietarioSave =
      await this.proprietarioService.cadastraProprietario(proprietario);
    if (proprietarioSave) {
      proprietarios.push(proprietarioSave);
      const propriedade =
        await this.propriedadeService.buscaPropriedadePorSolicitacao(
          solicitacaoElegibilidade.id,
        );
      if (propriedade) {
        propriedade.proprietarios.push(proprietarioSave);
        return await this.propriedadeService.cadastrarPropriedade(propriedade);
      } else {
        const propriedade = {
          carFederal: solicitacaoElegibilidade.carFederal,
          proprietarios: proprietarios,
          nomePropriedade: solicitacaoElegibilidade.nomePropriedade,
          codigoMunicipio: solicitacaoElegibilidade.codigoMunicipio,
          moduloFiscal:
            +solicitacaoElegibilidade.retornoAgrotools.modulo_fiscal,
          idSolicitacaoElegibilidade: solicitacaoElegibilidade.id,
        } as Propriedade;
        return await this.propriedadeService.cadastrarPropriedade(propriedade);
      }
    }
  }

  async cadastrarTerritorio() {
    const propriedades =
      await this.propriedadeService.consultarPropriedadeTerritorio();
    if (propriedades) {
      for (const propriedade of propriedades) {
        if (propriedade.territorios.length == 0) {
          const territorioBase = await this.territorioRepository.findOne({
            where: { idPropriedade: propriedade.id },
          });

          const proprietarios = propriedade.proprietarios.filter(
            (p) => p.pessoa.idUsuarioAgrotools != null,
          );

          if (!territorioBase && proprietarios.length > 0) {
            let territorioResponse = await this.consultarTerritorio(
              propriedade.id,
            );
            if (!territorioResponse) {
              const territorio = {
                car: propriedade.carFederal,
                vlOwnerCode: propriedade.id.toString(),
                territoryName: propriedade.nomePropriedade,
                producersId: proprietarios.map(
                  (p) => p.pessoa.idUsuarioAgrotools,
                ),
                agents: this.getAgents(propriedade.proprietarios),
              } as TerritorioAgrotoolsRequest;
              try {
                territorioResponse = await this.criarTerritorio(territorio);
                await this.salvaTerritorio(territorioResponse, propriedade);
              } catch (error) {
                console.error('error');
              }
            } else {
              await this.salvaTerritorio(territorioResponse, propriedade);
            }
          }
        }
      }
    }
  }

  getAgents(proprietarios: Proprietario[]): AgentsRequest[] {
    const agents: AgentsRequest[] = [];
    if (proprietarios.length > 1) {
      proprietarios.forEach((proprietario) => {
        agents.push({
          name: proprietario.pessoa.nome,
          document: proprietario.pessoa.cpfCnpj,
        });
      });
    }
    return agents;
  }

  async salvaTerritorio(
    territorioResponse: TerritorioResponse,
    propriedade: Propriedade,
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
  }

  //TODO METODO TEMPORARIO
  async atualizaImagem() {
    const territorios = await this.territorioRepository.find({
      where: {
        statusImagem: IsNull(),
      },
    });

    if (territorios) {
      for (const territorio of territorios) {
        const data: ImagemPlano = await axios
          .post(
            `${this.url}/AdequancyPlan/generate-image/${territorio.codigoTerritorio}`,
            { headers: this.headersRequest },
          )
          .then((res) => {
            return res.data;
          })
          .catch(async (error) => {
            territorio.statusImagem = this.getErroAgrotools(error);
            await this.territorioRepository.update(territorio.id, territorio);
            return null;
          });
        if (data) {
          const documento = await this.documentoUploadService.uploadBase64Image(
            data.base64Image,
          );
          territorio.imagemAdequacao = documento.url;
          territorio.statusImagem = 'ATUALIZADA';
          await this.territorioRepository.update(territorio.id, territorio);
        }
      }
    }
  }

  getErroAgrotools(error: any): string {
    if (error.response.data.Message) {
      return 'Erro Agrotools: ' + error.response.data.Message;
    }
    if (error.response.data.message) {
      return 'Erro Agrotools: ' + error.response.data.message;
    } else {
      return 'Erro Agrotools: ';
    }
  }

  async salvaErroRetornoAgrotools(
    retornoAgrotools: RetornoAnaliseEntity,
    erroAgrotoos: string,
  ) {
    const id = retornoAgrotools.id;
    const rawSql = `
      UPDATE "IMAC"."TB_RETORNO_ANALISE"
      SET "ERRO_AGROTOOLS" = $1
      WHERE "ID" = $2;
    `;
    await this.entityManager.query(rawSql, [erroAgrotoos, id]);
  }
}
