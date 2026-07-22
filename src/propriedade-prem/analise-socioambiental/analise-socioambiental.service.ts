import { In, Repository } from 'typeorm';
import { CriarContestacaoAutorizacaoSupressaoRequest } from './dto/criar-contestacao-autorizacao-supressao-request';
import { RetornoAnaliseEntity } from '../../agrotools/entities/retorno-analise.entity';
import { BadRequestException } from '@nestjs/common';
import { ContestacaoAutorizacaoSupressao } from './entities/contestacao-autorizacao-supressao.entity';
import { TipoAutorizacaoSupressao } from './entities/tipo-autorizacao-supressao.entity';
import { OrgaoEmissorAutorizacaoSupressao } from './entities/orgao-emissor-autorizacao-supressao.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CriarContestacaoLaudoRequest } from './dto/criar-contestacao-laudo-request';
import { ContestacaoLaudo } from './entities/contestacao-laudo.entity';
import { plainToClass } from 'class-transformer';
import { DocumentoUploadService } from '../../upload/documento-upload.service';
import { Documento } from '../../shared/entity/documento.entity';
import { ParametrosArquivo } from '../../shared/dto/base-upload-request.dto';
import { EnviarArquivosContestacaoAutorizacaoSupressaoRequest } from './dto/enviar-arquivos-contestacao-autorizacao-supressao-request';
import { EnviarArquivosContestacaoLaudoRequest } from './dto/enviar-arquivos-contestacao-laudo-request';
import { ResponsavelTecnico } from '../../responsavel-tecnico/entities/responsavel-tecnico.entity';
import { PlanoAdequacao } from './entities/plano-adequacao.entity';
import { CriarPlanoAdequacaoRequest } from './dto/criar-plano-adequacao-request';
import { UploadPayloadType } from '../../shared/types/upload-payload.type';
import { AuthenticatedRequest } from '../../shared/interfaces/authenticated-request.interface';
import { CriarParecerContestacaoRequest } from './dto/criar-parecer-contestacao-request';
import { CriarParecerContestacaoResponse } from './dto/criar-parecer-contestacao-response';
import { SituacaoContestacaoEnum } from './enum/situacao-contestacao.enum';
import { CriarParecerPlanoAdequacaoRequest } from './dto/criar-parecer-plano-adequacao-request';
import { CriarParecerPlanoAdequacaoResponse } from './dto/criar-parecer-plano-adequacao-response';
import { SituacaoPlanoAdequacaoEnum } from './enum/situacao-plano-adequacao.enum';
import { EmailService } from '../../email/email.service';
import { ContestacaoAnalisadaTemplate } from '../../email/templates/contestacao-analisada.template';
import { PlanoAdequacaoAnalisadoTemplate } from '../../email/templates/plano-adequacao-analisado.template';
import { UsuarioService } from '../../usuario/usuario.service';
import { MensagemService } from '../../message/mensagem.service';
import { DeteccoesAgrotools } from '../../elegibilidade/entities/deteccoes-agrotools.entity';

export class AnaliseSocioambientalService {
  constructor(
    @InjectRepository(RetornoAnaliseEntity)
    private readonly analiseSocioambientalRepository: Repository<RetornoAnaliseEntity>,
    @InjectRepository(ContestacaoAutorizacaoSupressao)
    private readonly contestacaoAutorizacaoSupressaoRepository: Repository<ContestacaoAutorizacaoSupressao>,
    @InjectRepository(ContestacaoLaudo)
    private readonly contestacaoLaudoRepository: Repository<ContestacaoLaudo>,
    @InjectRepository(TipoAutorizacaoSupressao)
    private readonly tipoAutorizacaoSupressaoRepository: Repository<TipoAutorizacaoSupressao>,
    @InjectRepository(OrgaoEmissorAutorizacaoSupressao)
    private readonly orgaoEmissorAutorizacaoSupressaoRepository: Repository<OrgaoEmissorAutorizacaoSupressao>,
    @InjectRepository(ResponsavelTecnico)
    private readonly responsavelTecnicoRepository: Repository<ResponsavelTecnico>,
    private readonly documentoUploadService: DocumentoUploadService,
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,
    @InjectRepository(PlanoAdequacao)
    private readonly planoAdequacaoRepository: Repository<PlanoAdequacao>,
    private readonly emailService: EmailService,
    private readonly usuarioService: UsuarioService,
    private readonly mensagemService: MensagemService,
    @InjectRepository(DeteccoesAgrotools)
    private readonly deteccoesAgrotoolsRepository: Repository<DeteccoesAgrotools>,
  ) {}

  private async processarDocumentosUpload(
    arquivos: Express.Multer.File[],
    parametros: ParametrosArquivo[],
    email: string,
  ): Promise<Documento[]> {
    const usuario = await this.usuarioService.buscarUsuarioPorEmail(email);

    const documentosUpload =
      await this.documentoUploadService.uploadFiles(arquivos);

    const documentosParaSalvar = documentosUpload.map((docUpload) => {
      const parametroCorrespondente = parametros.find(
        (param) => param.nome === docUpload.originalName,
      );

      if (!parametroCorrespondente) {
        throw new BadRequestException(
          `Parâmetro não encontrado para o arquivo: ${docUpload.originalName}`,
        );
      }

      return {
        nomeArquivo: docUpload.filename,
        urlArquivo: docUpload.url,
        nomeArquivoOriginal: docUpload.originalName,
        tipo: parametroCorrespondente.tipo,
        idUsuarioUpload: usuario.id,
      };
    });

    const documentosSalvos =
      await this.documentoRepository.save(documentosParaSalvar);
    return documentosSalvos;
  }

  private async validarResponsavelTecnico(
    idResponsavelTecnico: number,
  ): Promise<void> {
    const responsavelTecnico = await this.responsavelTecnicoRepository.findOne({
      where: { id: idResponsavelTecnico },
    });

    if (!responsavelTecnico) {
      throw new BadRequestException('Responsável Técnico não encontrado.');
    }
  }

  async buscarAnaliseSocioambiental(
    idPropriedade: number,
    idAnalise: number,
    request: AuthenticatedRequest,
  ): Promise<RetornoAnaliseEntity> {
    const analiseSocioambiental =
      await this.analiseSocioambientalRepository.findOne({
        where: {
          id: idAnalise,
          propriedade: {
            id: idPropriedade,
            proprietarios: request.user.roles.includes('ANALISTA')
              ? undefined
              : [{ pessoa: { email: request.user.email } }],
          },
        },
        order: {
          contestacaoLaudo: { id: 'DESC' },
          contestacaoAutorizacaoSupressao: { id: 'DESC' },
          planoAdequacao: { id: 'DESC' },
        },
        relations: [
          'documentos',
          'deteccoes',
          'propriedade',
          'propriedade.proprietarios',
          'propriedade.proprietarios.pessoa',
          'contestacaoAutorizacaoSupressao',
          'contestacaoAutorizacaoSupressao.documentos',
          'contestacaoAutorizacaoSupressao.responsavelTecnico',
          'contestacaoAutorizacaoSupressao.autorizacoesSupressoes',
          'contestacaoAutorizacaoSupressao.autorizacoesSupressoes.tipo',
          'contestacaoAutorizacaoSupressao.autorizacoesSupressoes.orgaoEmissor',
          'contestacaoAutorizacaoSupressao.autorizacoesSupressoes.documentos',
          'contestacaoLaudo',
          'contestacaoLaudo.documentos',
          'contestacaoLaudo.responsavelTecnico',
          'planoAdequacao',
          'planoAdequacao.documentos',
          'planoAdequacao.responsavelTecnico',
        ],
      });

    if (!analiseSocioambiental) {
      throw new BadRequestException('Análise socioambiental não encontrada.');
    }

    return analiseSocioambiental;
  }

  async criarContestacaoAutorizacaoSupressao(
    idPropriedade: number,
    idAnalise: number,
    request: AuthenticatedRequest,
    payload: UploadPayloadType<CriarContestacaoAutorizacaoSupressaoRequest>,
  ): Promise<ContestacaoAutorizacaoSupressao> {
    const { body, arquivos } = payload;
    const { autorizacoesSupressoes } = body;

    await this.buscarAnaliseSocioambiental(idPropriedade, idAnalise, request);

    const contestacaoExistente =
      await this.contestacaoAutorizacaoSupressaoRepository.findOne({
        where: { idAnalise },
      });

    if (contestacaoExistente) {
      throw new BadRequestException(
        'Já existe uma contestação de autorização de supressão deste tipo para esta análise.',
      );
    }

    await this.validarResponsavelTecnico(body.idResponsavelTecnico);

    const nomesArquivosAutorizacao = new Set(
      autorizacoesSupressoes.map((a) => a.nomeArquivo),
    );
    const nomesArquivosUpload = new Set(arquivos.map((a) => a.originalname));

    const arquivosFaltando = autorizacoesSupressoes.filter(
      (a) => !nomesArquivosUpload.has(a.nomeArquivo),
    );
    if (arquivosFaltando.length > 0) {
      const nomesArquivosFaltando = arquivosFaltando
        .map((a) => a.nomeArquivo)
        .join(', ');
      throw new BadRequestException(
        `Os seguintes arquivos de autorização estão faltando: ${nomesArquivosFaltando}`,
      );
    }

    const tipoIds = autorizacoesSupressoes.map((a) => a.idTipo);
    const orgaoEmissorIds = autorizacoesSupressoes.map((a) => a.idOrgaoEmissor);

    const [tipos, orgaosEmissores] = await Promise.all([
      this.tipoAutorizacaoSupressaoRepository.find({
        where: { id: In([...new Set(tipoIds)]) },
      }),
      this.orgaoEmissorAutorizacaoSupressaoRepository.find({
        where: { id: In([...new Set(orgaoEmissorIds)]) },
      }),
    ]);

    if (tipos.length !== new Set(tipoIds).size) {
      throw new BadRequestException(
        'Um ou mais tipos de autorização de supressão não foram encontrados.',
      );
    }

    if (orgaosEmissores.length !== new Set(orgaoEmissorIds).size) {
      throw new BadRequestException(
        'Um ou mais órgãos emissores não foram encontrados.',
      );
    }

    const documentosProcessados = await this.processarDocumentosUpload(
      arquivos,
      body.parametros,
      request.user.email,
    );

    const documentosPorNomeOriginal = new Map(
      documentosProcessados.map((doc) => [doc.nomeArquivoOriginal, doc]),
    );

    const autorizacoesComDocumentos = autorizacoesSupressoes.map(
      (autorizacao) => {
        const documento = documentosPorNomeOriginal.get(
          autorizacao.nomeArquivo,
        );
        if (!documento) {
          throw new BadRequestException(
            `Documento processado não encontrado para a autorização: ${autorizacao.nomeArquivo}`,
          );
        }
        return {
          ...autorizacao,
          documentos: [documento],
        };
      },
    );

    const documentosContestacao = documentosProcessados.filter(
      (doc) => !nomesArquivosAutorizacao.has(doc.nomeArquivoOriginal),
    );

    const novaContestacao = plainToClass(ContestacaoAutorizacaoSupressao, {
      ...body,
      idAnalise,
      documentos: documentosContestacao,
      autorizacoesSupressoes: autorizacoesComDocumentos,
    });

    return this.contestacaoAutorizacaoSupressaoRepository.save(novaContestacao);
  }

  async criarContestacaoLaudo(
    idPropriedade: number,
    idAnalise: number,
    request: AuthenticatedRequest,
    payload: UploadPayloadType<CriarContestacaoLaudoRequest>,
  ): Promise<ContestacaoLaudo> {
    const { body, arquivos } = payload;

    if (idAnalise == null) {
      throw new BadRequestException('ID Análise não informado.');
    }

    await this.buscarAnaliseSocioambiental(idPropriedade, idAnalise, request);

    const contestacaoExistente = await this.contestacaoLaudoRepository.findOne({
      where: {
        idAnalise: idAnalise,
      },
    });

    if (
      contestacaoExistente &&
      contestacaoExistente.situacao == SituacaoContestacaoEnum.DEFERIDO
    ) {
      throw new BadRequestException(
        'Já existe uma contestação por laudo deste tipo para esta análise.',
      );
    }

    await this.validarResponsavelTecnico(body.idResponsavelTecnico);

    const documentosContestacao = await this.processarDocumentosUpload(
      arquivos,
      body.parametros,
      request.user.email,
    );

    const novaContestacao = plainToClass(ContestacaoLaudo, {
      ...body,
      idAnalise,
      documentos: documentosContestacao,
    });

    return this.contestacaoLaudoRepository.save(novaContestacao);
  }

  async enviarArquivosContestacaoAutorizacaoSupressao(
    idPropriedade: number,
    idAnalise: number,
    idContestacao: number,
    request: AuthenticatedRequest,
    payload: UploadPayloadType<EnviarArquivosContestacaoAutorizacaoSupressaoRequest>,
  ) {
    const { body, arquivos } = payload;

    const contestacao =
      await this.contestacaoAutorizacaoSupressaoRepository.findOne({
        where: {
          id: idContestacao,
          idAnalise,
          analiseSocioambiental: { propriedade: { id: idPropriedade } },
        },
        order: {
          id: 'DESC',
        },
        relations: [
          'analiseSocioambiental',
          'analiseSocioambiental.propriedade',
          'documentos',
        ],
      });

    if (!contestacao) {
      throw new BadRequestException(
        'Contestação de autorização de supressão não encontrada para a propriedade informada.',
      );
    }

    await this.buscarAnaliseSocioambiental(idPropriedade, idAnalise, request);

    const documentosContestacao = await this.processarDocumentosUpload(
      arquivos,
      body.parametros,
      request.user.email,
    );

    const contestacaoAtualizada =
      await this.contestacaoAutorizacaoSupressaoRepository.save({
        ...contestacao,
        documentos: [...contestacao.documentos, ...documentosContestacao],
      });

    return contestacaoAtualizada;
  }

  async enviarArquivosContestacaoLaudo(
    idPropriedade: number,
    idAnalise: number,
    idContestacao: number,
    request: AuthenticatedRequest,
    payload: UploadPayloadType<EnviarArquivosContestacaoLaudoRequest>,
  ) {
    const { body, arquivos } = payload;

    const contestacao = await this.contestacaoLaudoRepository.findOne({
      where: {
        id: idContestacao,
        idAnalise,
        analiseSocioambiental: { propriedade: { id: idPropriedade } },
      },
      order: {
        id: 'DESC',
      },
      relations: [
        'analiseSocioambiental',
        'analiseSocioambiental.propriedade',
        'documentos',
      ],
    });

    if (!contestacao) {
      throw new BadRequestException(
        'Contestação por laudo não encontrada para a propriedade informada.',
      );
    }

    await this.buscarAnaliseSocioambiental(idPropriedade, idAnalise, request);

    const documentosContestacao = await this.processarDocumentosUpload(
      arquivos,
      body.parametros,
      request.user.email,
    );

    const contestacaoAtualizada = await this.contestacaoLaudoRepository.save({
      ...contestacao,
      documentos: [...contestacao.documentos, ...documentosContestacao],
    });

    return contestacaoAtualizada;
  }

  async criarPlanoAdequacao(
    idPropriedade: number,
    idAnalise: number,
    request: AuthenticatedRequest,
    payload: UploadPayloadType<CriarPlanoAdequacaoRequest>,
  ): Promise<PlanoAdequacao> {
    const { body, arquivos } = payload;

    await this.buscarAnaliseSocioambiental(idPropriedade, idAnalise, request);

    const planoAdequacaoExistente = await this.planoAdequacaoRepository.findOne(
      {
        where: {
          idAnalise: idAnalise,
        },
        order: {
          id: 'DESC',
        },
      },
    );

    if (
      planoAdequacaoExistente &&
      planoAdequacaoExistente.situacao == SituacaoPlanoAdequacaoEnum.DEFERIDO
    ) {
      throw new BadRequestException(
        'Já existe um plano de adequação para esta análise.',
      );
    }

    await this.validarResponsavelTecnico(body.idResponsavelTecnico);

    const documentosPlanoAdequacao = await this.processarDocumentosUpload(
      arquivos,
      body.parametros,
      request.user.email,
    );

    const novoPlanoAdequacao = plainToClass(PlanoAdequacao, {
      ...body,
      idAnalise,
      documentos: documentosPlanoAdequacao,
    });

    return this.planoAdequacaoRepository.save(novoPlanoAdequacao);
  }

  async criarParecerContestacao(
    idPropriedade: number,
    idAnalise: number,
    request: AuthenticatedRequest,
    payload: UploadPayloadType<CriarParecerContestacaoRequest>,
  ): Promise<CriarParecerContestacaoResponse> {
    const { body, arquivos } = payload;

    const analiseSocioambiental = await this.buscarAnaliseSocioambiental(
      idPropriedade,
      idAnalise,
      request,
    );

    if (body.status === SituacaoContestacaoEnum.EM_ANALISE) {
      throw new BadRequestException(
        'Não é possível colocar em análise um parecer de contestação',
      );
    }

    const statusQueExigemCampos = [
      SituacaoContestacaoEnum.DEFERIDO,
      SituacaoContestacaoEnum.DEFERIDO_PARCIALMENTE,
    ];

    if (statusQueExigemCampos.includes(body.status)) {
      if (!body.poligonos || !body.valorMulta || !body.descontoPercentual) {
        throw new BadRequestException(
          'Para deferir ou deferir parcialmente a contestação, os campos poligonos, valorMulta e descontoPercentual são obrigatórios.',
        );
      }
    }

    const contestacaoAutorizacaoSupressao =
      analiseSocioambiental.contestacaoAutorizacaoSupressao;
    const contestacaoLaudo = analiseSocioambiental.contestacaoLaudo;

    const statusValidosParaParecer = [
      SituacaoContestacaoEnum.EM_ANALISE,
      SituacaoContestacaoEnum.COM_PENDENCIAS,
    ];

    if (!contestacaoAutorizacaoSupressao && !contestacaoLaudo) {
      throw new BadRequestException(
        'Não é possível criar um parecer sem que haja uma contestação existente.',
      );
    }

    if (
      contestacaoAutorizacaoSupressao &&
      !statusValidosParaParecer.includes(
        contestacaoAutorizacaoSupressao.situacao,
      )
    ) {
      throw new BadRequestException(
        'Não é possível criar um parecer para uma contestação de autorização de supressão que não esteja em análise ou com pendências.',
      );
    }

    if (
      contestacaoLaudo &&
      !statusValidosParaParecer.includes(contestacaoLaudo.situacao)
    ) {
      throw new BadRequestException(
        'Não é possível criar um parecer para uma contestação por laudo que não esteja em análise ou com pendências.',
      );
    }

    const statusQueNaoPodemPossuirCampos = [
      SituacaoContestacaoEnum.INDEFERIDO,
      SituacaoContestacaoEnum.COM_PENDENCIAS,
    ];

    if (statusQueNaoPodemPossuirCampos.includes(body.status)) {
      if (body.poligonos || body.valorMulta || body.descontoPercentual) {
        throw new BadRequestException(
          'Para indeferir ou colocar a contestação com pendências, os campos poligonos, valorMulta e descontoPercentual não devem ser informados.',
        );
      }
    }

    const documentosParecerContestacao = await this.processarDocumentosUpload(
      arquivos,
      body.parametros,
      request.user.email,
    );

    const areaARegenerar = body.poligonos?.reduce(
      (total, poligono) => total + poligono.areaARegenerar,
      0,
    );
    const deteccoes = analiseSocioambiental.deteccoes.map((deteccao) => {
      if (body.poligonos) {
        const poligono = body.poligonos.find(
          (poligono) => poligono.idTad === deteccao.idAgrotools,
        );

        return {
          ...deteccao,
          wkt: poligono?.wkt,
          areaARegenerar: poligono?.areaARegenerar,
          tipoDeteccao: poligono?.tipoDeteccao,
        };
      }

      return deteccao;
    });

    if (analiseSocioambiental.contestacaoAutorizacaoSupressao) {
      this.contestacaoAutorizacaoSupressaoRepository.update(
        analiseSocioambiental.contestacaoAutorizacaoSupressao.id,
        { situacao: body.status },
      );
    }

    if (analiseSocioambiental.contestacaoLaudo) {
      this.contestacaoLaudoRepository.update(
        analiseSocioambiental.contestacaoLaudo.id,
        { situacao: body.status },
      );
    }

    await this.deteccoesAgrotoolsRepository.save(deteccoes);

    const parecerContestacao = plainToClass(RetornoAnaliseEntity, {
      ...analiseSocioambiental,
      areaARegenerar,
      valorMulta: body.valorMulta
        ? body.valorMulta
        : analiseSocioambiental.valorMulta,
      descontoPercentual: body.descontoPercentual,
      idAnalise,
      documentos: [
        ...(analiseSocioambiental.documentos || []),
        ...documentosParecerContestacao,
      ],
      deteccoes,
    });

    const emailProprietario =
      analiseSocioambiental.propriedade?.proprietarios[0].pessoa.email;
    const proprietario =
      analiseSocioambiental.propriedade?.proprietarios[0].pessoa.nome;
    const telefone =
      analiseSocioambiental.propriedade?.proprietarios[0].pessoa.telefone;
    const analise = 'Analise SocioAmbiental';

    const dados = {
      produtor: proprietario,
      propriedade: analiseSocioambiental.propriedade?.nomePropriedade,
      carFederal: analiseSocioambiental.propriedade?.carFederal,
      etapa: analise,
      telefone,
    };
    await this.mensagemService.enviarMensagenStatus(dados);

    await this.emailService.enviarEmailTemplate({
      recipients: [emailProprietario!],
      subject: 'Análise de contestação',
      template: new ContestacaoAnalisadaTemplate({}),
    });

    return this.analiseSocioambientalRepository.save(parecerContestacao);
  }

  async criarParecerPlanoAdequacao(
    idPropriedade: number,
    idAnalise: number,
    idPlanoAdequacao: number,
    request: AuthenticatedRequest,
    payload: UploadPayloadType<CriarParecerPlanoAdequacaoRequest>,
  ): Promise<CriarParecerPlanoAdequacaoResponse> {
    const { body, arquivos } = payload;

    const analiseSocioambiental = await this.buscarAnaliseSocioambiental(
      idPropriedade,
      idAnalise,
      request,
    );

    if (body.status === SituacaoContestacaoEnum.EM_ANALISE) {
      throw new BadRequestException(
        'Não é possível colocar em análise um parecer de plano de adequação',
      );
    }

    const statusQueExigemCampos = [
      SituacaoContestacaoEnum.DEFERIDO,
      SituacaoContestacaoEnum.DEFERIDO_PARCIALMENTE,
    ];

    if (statusQueExigemCampos.includes(body.status)) {
      if (!body.wkt) {
        throw new BadRequestException(
          'Para deferir ou deferir parcialmente o plano de adequação, o campo wkt é obrigatório.',
        );
      }
    }

    const planoAdequacao = analiseSocioambiental.planoAdequacao;

    const statusValidosParaParecer = [
      SituacaoPlanoAdequacaoEnum.EM_ANALISE,
      SituacaoPlanoAdequacaoEnum.COM_PENDENCIAS,
    ];

    if (planoAdequacao && planoAdequacao.id !== idPlanoAdequacao) {
      throw new BadRequestException(
        'Não é possível criar um parecer sem que haja um plano de adequação existente.',
      );
    }

    if (
      planoAdequacao &&
      !statusValidosParaParecer.includes(planoAdequacao.situacao)
    ) {
      throw new BadRequestException(
        'Não é possível criar um parecer para uma contestação de autorização de supressão que não esteja em análise ou com pendências.',
      );
    }

    const statusQueNaoPodemPossuirCampos = [
      SituacaoContestacaoEnum.INDEFERIDO,
      SituacaoContestacaoEnum.COM_PENDENCIAS,
    ];

    if (statusQueNaoPodemPossuirCampos.includes(body.status)) {
      if (body.wkt) {
        throw new BadRequestException(
          'Para indeferir ou colocar a contestação com pendências, os campo wkt não deve ser informado.',
        );
      }
    }

    const documentosParecerPlanoAdequacao =
      await this.processarDocumentosUpload(
        arquivos,
        body.parametros,
        request.user.email,
      );

    const planoAdequacaoAtualizado = plainToClass(PlanoAdequacao, {
      ...planoAdequacao,
      wkt: body.wkt,
      situacao: body.status,
      documentos: [
        ...(planoAdequacao?.documentos || []),
        ...documentosParecerPlanoAdequacao,
      ],
    });

    const emailProprietario =
      analiseSocioambiental.propriedade?.proprietarios[0].pessoa.email;
    const proprietario =
      analiseSocioambiental.propriedade?.proprietarios[0].pessoa.nome;
    const telefone =
      analiseSocioambiental.propriedade?.proprietarios[0].pessoa.telefone;
    const analise = 'Plano de Adequação : ';

    const dados = {
      produtor: proprietario,
      propriedade: analiseSocioambiental.propriedade?.nomePropriedade,
      carFederal: analiseSocioambiental.propriedade?.carFederal,
      etapa: analise,
      telefone,
    };
    await this.mensagemService.enviarMensagenStatus(dados);

    await this.emailService.enviarEmailTemplate({
      recipients: [emailProprietario!],
      subject: 'Análise plano de adequação',
      template: new PlanoAdequacaoAnalisadoTemplate({}),
    });

    return this.planoAdequacaoRepository.save(planoAdequacaoAtualizado);
  }

  async buscarTipoAutorizacaoSupressao() {
    return this.tipoAutorizacaoSupressaoRepository.find();
  }

  async buscarOrgaoEmissorAutorizacaoSupressao() {
    return this.orgaoEmissorAutorizacaoSupressaoRepository.find();
  }
}
