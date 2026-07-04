import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  Request,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Column, LessThan, Repository } from 'typeorm';
import { Endereco } from '../endereco/entities/endereco.entity';
import { Propriedade } from './entities/propriedade.entity';
import { Proprietario } from './entities/proprietario.entity';
import { AtividadePrincipal } from './entities/atividade-principal.entity';
import { CicloProducao } from './entities/ciclo-producao.entity';
import { Expose, plainToInstance } from 'class-transformer';
import { ConsultaPropriedadeRequest } from './dto/consulta-propriedade-request';
import { Cidade } from '../elegibilidade/entities/cidade.entity';
import { retirarAcento } from '../utils/strgint-util';
import NegocioException from '../exception/negocio-exception';
import { DadosBasicosRequest } from './request/dados-basicos-request';
import { ProprietarioProprietarioRequest } from './request/proprietario-proprietario-request';
import { ProprietarioPremService } from './proprietario-prem.service';
import { DocumentoUploadService } from '../upload/documento-upload.service';
import { Documento } from '../shared/entity/documento.entity';
import { Etapas, StatusEtapas } from './enum/etapas-status-propriedade.const';
import { ParametrosArquivo } from '../shared/dto/base-upload-request.dto';
import { AuthenticatedRequest } from '../shared/interfaces/authenticated-request.interface';
import { UsuarioService } from '../usuario/usuario.service';
import { Usuario } from '../usuario/entities/usuario.entity';
import { PdfService } from '../pdf/pdf-service';
import { DcsPdfTemplate } from '../pdf/templates/dcs-pdf-template';
import { AssinaturaService } from '../assinatura/assinatura.service';
import { Readable } from 'node:stream';
import { TermoCompromissoPdfTemplate } from '../pdf/templates/termo-compromisso-pdf-template';
import {
  AutoVistoriaEntity,
  Vistoria,
} from './auto-vistoria/entities/auto-vistoria.entity';
import { DCSStatus, ValidacaoDCSResponse } from './dto/validacao-dcs-response';
import { PagamentoMulta } from '../cobranca/entities/pagamento-multa.entities';
import { StatusPagamento } from '../shared/enums/enums';
import * as moment from 'moment/moment';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ArquivoEnviadoEvent } from '../shared/events/arquivo-enviado.event';
import { AcoesRequest } from './dto/acoes-request';
import { ApiProperty } from '@nestjs/swagger';

@Injectable()
export class PropriedadePremService {
  constructor(
    @InjectRepository(Propriedade)
    private propriedadeRepository: Repository<Propriedade>,
    @InjectRepository(Endereco)
    private enderecoRepository: Repository<Endereco>,
    @InjectRepository(CicloProducao)
    private cicloProducaoRepository: Repository<CicloProducao>,
    @InjectRepository(AtividadePrincipal)
    private atividadePrincipalRepository: Repository<AtividadePrincipal>,
    @InjectRepository(Cidade)
    private cidadeRepository: Repository<Cidade>,
    private readonly proprietarioService: ProprietarioPremService,
    private readonly documentoUploadService: DocumentoUploadService,
    @InjectRepository(Documento)
    private documentoRepository: Repository<Documento>,
    private readonly pdfService: PdfService,
    @Inject(forwardRef(() => UsuarioService))
    private readonly usuarioService: UsuarioService,
    private readonly assinaturaService: AssinaturaService,
    @InjectRepository(AutoVistoriaEntity)
    private readonly autoVistoriaRepository: Repository<AutoVistoriaEntity>,
    @InjectRepository(PagamentoMulta)
    private readonly pagamentoMultaRepository: Repository<PagamentoMulta>,
    private eventEmitter: EventEmitter2,
  ) {}

  listarAtividadePrincipal() {
    return this.atividadePrincipalRepository.find();
  }

  listarCicloProducao() {
    return this.cicloProducaoRepository.find();
  }

  async cadastrarPropriedade(propriedade: Propriedade) {
    try {
      return await this.propriedadeRepository.save(propriedade);
    } catch (error) {
      throw new BadRequestException(JSON.stringify(error?.message));
    }
  }

  async cadastraProprietario(
    idPropriedade: number,
    proprietarioRequest: ProprietarioProprietarioRequest[],
    usuarioLogado: AuthenticatedRequest,
  ) {
    try {
      const proprietarios: Proprietario[] = [];
      for (const prop of proprietarioRequest) {
        const propSave =
          await this.proprietarioService.cadastraAtualizaProprietario(prop);
        proprietarios.push(propSave);
      }

      const propriedade = await this.consultaPropriedadePorId(
        idPropriedade,
        usuarioLogado,
      );
      if (!propriedade) {
        throw new NegocioException(422, 'Propriedade não encontrada');
      }

      propriedade.proprietarios = await this.getProprietarios(
        proprietarios,
        propriedade,
      );
      propriedade.etapa = Etapas.Cadastro;
      propriedade.status = StatusEtapas[Etapas.Cadastro].CadastroCompleto;
      await this.propriedadeRepository.save(propriedade);
      return {
        sucesso: true,
        mensagem: 'Dados atualizados com sucesso',
      };
    } catch (error) {
      throw new BadRequestException(JSON.stringify(error?.message));
    }
  }

  async atualizaDadosBasicos(
    idPropriedade: number,
    dadosBasicosRequest: DadosBasicosRequest,
    usuarioLogado: AuthenticatedRequest,
  ) {
    try {
      const enderecoSave = await this.enderecoRepository.save(
        plainToInstance(Endereco, dadosBasicosRequest.endereco),
      );
      const propriedade = await this.consultaPropriedadePorId(
        idPropriedade,
        usuarioLogado,
      );
      if (!propriedade) {
        throw new NegocioException(422, 'Propriedade não encontrada');
      }
      propriedade.endereco = enderecoSave;
      propriedade.tamanhoPropriedade = dadosBasicosRequest.tamanhoPropriedade;
      propriedade.numeroProprietarios = dadosBasicosRequest.numeroProprietarios;
      propriedade.idClicloProducao = dadosBasicosRequest.idCicloProducao;
      propriedade.idAtividadePrincipal =
        dadosBasicosRequest.idAtividadePrincipal;

      await this.propriedadeRepository.save(propriedade);
      return {
        sucesso: true,
        mensagem: 'Dados atualizados com sucesso',
      };
    } catch (error) {
      throw new BadRequestException(JSON.stringify(error?.message));
    }
  }

  async getProprietarios(novos: Proprietario[], propriedade: Propriedade) {
    const ids = novos.map((novo) => novo.id);
    const proprietarios = propriedade.proprietarios.filter(
      (p) => !ids.includes(p.id),
    );
    novos.push(...proprietarios);
    return novos;
  }

  async atualizaPropriedade(propriedade: Propriedade) {
    try {
      return await this.propriedadeRepository.update(
        propriedade.id,
        propriedade,
      );
    } catch (error) {
      throw new BadRequestException(JSON.stringify(error?.message));
    }
  }

  async atualizaPropriedadePrem(propriedade: Propriedade) {
    try {
      return await this.propriedadeRepository.save(propriedade);
    } catch (error) {
      throw new BadRequestException(JSON.stringify(error?.message));
    }
  }

  async buscaPropriedadePorSolicitacao(idSolicitacao: number) {
    try {
      return await this.propriedadeRepository
        .createQueryBuilder('pr')
        .leftJoinAndSelect('pr.proprietarios', 'proprietarios')
        .leftJoinAndSelect('proprietarios.pessoa', 'pessoa')
        .leftJoinAndSelect('pr.cidade', 'cidade')
        .leftJoinAndSelect(
          'pr.solicitacaoElegibilidade',
          'solicitacaoElegibilidade',
        )
        .leftJoinAndSelect(
          'solicitacaoElegibilidade.retornoAgrotools',
          'retornoAgrotools',
        )
        .where('solicitacaoElegibilidade.id = :idSolicitacao', {
          idSolicitacao: idSolicitacao,
        })
        .getOne();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestException(JSON.stringify(error?.message));
    }
  }

  async consultaPropriedadeFiltro(
    filtro: ConsultaPropriedadeRequest,
    request: AuthenticatedRequest,
    page = 1,
    size = 10,
  ) {
    const user = await this.usuarioService.buscarUsuarioPorEmail(
      request.user.email,
    );

    const query = this.propriedadeRepository.createQueryBuilder('pr');

    query.leftJoinAndSelect('pr.proprietarios', 'proprietarios');
    query.leftJoinAndSelect('proprietarios.pessoa', 'pessoa');
    query.leftJoinAndSelect('pr.endereco', 'endereco');
    query.leftJoinAndSelect('pr.cidade', 'cidade');
    query.leftJoinAndSelect('pr.analista', 'analista');
    query.leftJoinAndSelect('analista.pessoa', 'pessoaAnalista');
    query.leftJoinAndSelect('pr.documentos', 'documentos');
    query.leftJoinAndSelect('documentos.usuarioUpload', 'usuarioUpload');
    query.leftJoinAndSelect(
      'pr.solicitacaoElegibilidade',
      'solicitacaoElegibilidade',
    );
    query.leftJoinAndSelect(
      'solicitacaoElegibilidade.retornoAgrotools',
      'retornoAgrotools',
    );

    const perfis = user.roles.map((r) => r.nome);
    if (!perfis.includes('ANALISTA')) {
      query.where('pessoa.email = :email', {
        email: `${request.user.email}`,
      });
    }
    if (
      filtro.nomePropriedade !== null &&
      filtro.nomePropriedade !== undefined
    ) {
      query.andWhere('LOWER(pr.nomePropriedade) LIKE :nomePropriedade', {
        nomePropriedade: `%${filtro.nomePropriedade?.toLowerCase()}%`,
      });
    }

    if (filtro.carFederal !== null && filtro.carFederal !== undefined) {
      query.andWhere('pr.carFederal = :carFederal', {
        carFederal: filtro.carFederal?.replace(/[.]/g, ''),
      });
    }
    if (
      filtro.codigoMunicipio !== null &&
      filtro.codigoMunicipio !== undefined
    ) {
      query.andWhere('pr.codigoMunicipio = :codigoMunicipio', {
        codigoMunicipio: filtro.codigoMunicipio,
      });
    }

    if (filtro.statusVoucher !== null && filtro.statusVoucher !== undefined) {
      query.andWhere('pr.statusVoucher = :statusVoucher', {
        statusVoucher: filtro.statusVoucher,
      });
    }

    if (filtro.analista !== null && filtro.analista !== undefined) {
      query.andWhere('LOWER(pessoaAnalista.nome) LIKE :analista', {
        analista: `%${filtro.analista?.toLowerCase()}%`,
      });
    }

    query.skip((page - 1) * size).take(size);

    try {
      return query.getManyAndCount();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async consultaCidadePorNome(nome?: string) {
    const query = await this.cidadeRepository.createQueryBuilder('cidade');
    query.where('cidade.uf  = :uf', { uf: 'MT' });
    if (nome !== null && nome !== undefined) {
      query.andWhere('LOWER(unaccent(cidade.nome)) LIKE :nome', {
        nome: retirarAcento(`%${nome?.toLowerCase()}%`),
      });
    }
    return query.getMany();
  }

  //TODO: Parar de usar essa rota em outros lugares e fazer uso do repository, evitando variável com possibilidade de ser nula
  //TODO: Fazer uma validação mais inteligente para roles (evitar replicação)
  async consultaPropriedadePorId(id: number, request?: AuthenticatedRequest) {
    try {
      const query = this.propriedadeRepository
        .createQueryBuilder('propriedade')
        .leftJoinAndSelect('propriedade.proprietarios', 'proprietarios')
        .leftJoinAndSelect('proprietarios.pessoa', 'pessoa')
        .leftJoinAndSelect('propriedade.endereco', 'endereco')
        .leftJoinAndSelect('propriedade.cidade', 'cidade')
        .leftJoinAndSelect(
          'propriedade.solicitacaoElegibilidade',
          'solicitacaoElegibilidade',
        )
        .leftJoinAndSelect('propriedade.documentos', 'documentos')
        .leftJoinAndSelect('documentos.usuarioUpload', 'usuarioUpload')
        .leftJoinAndSelect('propriedade.analista', 'analista')
        .leftJoinAndSelect('propriedade.territorios', 'territorios')
        .leftJoinAndSelect('propriedade.vouches', 'vouches')
        .leftJoinAndSelect(
          'propriedade.atividadePrincipal',
          'atividadePrincipal',
        )
        .leftJoinAndSelect('propriedade.cicloProducao', 'cicloProducao')
        .leftJoinAndSelect('propriedade.retornoAnalises', 'retornoAnalises')
        .leftJoinAndSelect(
          'retornoAnalises.documentos',
          'retornoAnalisesDocumentos',
        )
        .leftJoinAndSelect('retornoAnalises.deteccoes', 'deteccoes')
        .leftJoinAndSelect(
          'retornoAnalises.contestacaoAutorizacaoSupressao',
          'contestacaoAutorizacaoSupressao',
        )
        .leftJoinAndSelect(
          'contestacaoAutorizacaoSupressao.responsavelTecnico',
          'casResponsavelTecnico',
        )
        .leftJoinAndSelect(
          'contestacaoAutorizacaoSupressao.documentos',
          'casDocumentos',
        )
        .leftJoinAndSelect(
          'contestacaoAutorizacaoSupressao.autorizacoesSupressoes',
          'autorizacoesSupressoes',
        )
        .leftJoinAndSelect('autorizacoesSupressoes.tipo', 'asTipo')
        .leftJoinAndSelect(
          'autorizacoesSupressoes.orgaoEmissor',
          'asOrgaoEmissor',
        )
        .leftJoinAndSelect('autorizacoesSupressoes.documentos', 'asDocumentos')
        .leftJoinAndSelect(
          'retornoAnalises.contestacaoLaudo',
          'contestacaoLaudo',
        )
        .leftJoinAndSelect(
          'contestacaoLaudo.responsavelTecnico',
          'clResponsavelTecnico',
        )
        .leftJoinAndSelect('contestacaoLaudo.documentos', 'clDocumentos')
        .leftJoinAndSelect('retornoAnalises.planoAdequacao', 'planoAdequacao')
        .leftJoinAndSelect(
          'planoAdequacao.responsavelTecnico',
          'paResponsavelTecnico',
        )
        .leftJoinAndSelect('planoAdequacao.documentos', 'paDocumentos')

        .where('propriedade.id = :id', { id });

      const propriedade = await query.getOne();

      if (propriedade?.retornoAnalises) {
        propriedade.retornoAnalises.sort((a, b) => {
          const clA = a.contestacaoLaudo?.id ?? 0;
          const clB = b.contestacaoLaudo?.id ?? 0;
          if (clA !== clB) return clB - clA;

          const casA = a.contestacaoAutorizacaoSupressao?.id ?? 0;
          const casB = b.contestacaoAutorizacaoSupressao?.id ?? 0;
          if (casA !== casB) return casB - casA;

          const paA = a.planoAdequacao?.id ?? 0;
          const paB = b.planoAdequacao?.id ?? 0;
          return paB - paA;
        });
      }

      if (
        request?.user.roles.includes('ANALISTA') ||
        request?.user.roles.includes('ADMIN')
      ) {
        return propriedade;
      } else {
        if (propriedade) {
          const proprietarios = propriedade.proprietarios.filter(
            (p) => p.pessoa.email == request?.user.email,
          );
          if (proprietarios.length > 0) {
            return propriedade;
          }
        }
      }
      return null;
    } catch (e) {
      console.log(e.message);
    }
  }

  async consultaPorProprietario(email: string) {
    const query = await this.propriedadeRepository.createQueryBuilder('pr');

    if (email == null || email == '') {
      throw new BadRequestException('Nenhum email informado.');
    }

    query.leftJoinAndSelect('pr.proprietarios', 'proprietarios');
    query.leftJoinAndSelect('proprietarios.pessoa', 'pessoa');
    query.leftJoinAndSelect('pr.endereco', 'endereco');
    query.leftJoinAndSelect('pr.cidade', 'cidade');
    query.leftJoinAndSelect('pr.territorios', 'territorios');
    query.leftJoinAndSelect('pr.analista', 'analista');
    query.leftJoinAndSelect(
      'pr.solicitacaoElegibilidade',
      'solicitacaoElegibilidade',
    );
    query.leftJoinAndSelect(
      'solicitacaoElegibilidade.retornoAgrotools',
      'retornoAgrotools',
    );
    query.leftJoinAndSelect('retornoAgrotools.deteccoes', 'deteccoes');
    query.where('pessoa.email = :email', { email: email });

    return query.getMany();
  }

  async uploadDocumentos(
    id: number,
    email: string,
    files: Express.Multer.File[],
    parametros: ParametrosArquivo[],
  ): Promise<Documento[]> {
    const propriedade = await this.propriedadeRepository.findOne({
      where: { id },
      relations: [
        'proprietarios',
        'proprietarios.pessoa',
        'analista',
        'analista.pessoa',
      ],
    });

    if (!propriedade) {
      throw new BadRequestException('Propriedade não encontrada');
    }

    if (
      propriedade.status?.toLowerCase() ===
      StatusEtapas.Desativada.Inativa.toLowerCase()
    ) {
      throw new BadRequestException('Propriedade inativa.');
    }

    const usuario = await this.usuarioService.buscarUsuarioPorEmail(email);
    const analistaDaPropriedade = propriedade.analista.id === usuario.id;

    if (
      propriedade?.proprietarios.every(
        (proprietario) => proprietario.pessoa.email !== email,
      ) &&
      !analistaDaPropriedade
    ) {
      throw new BadRequestException(
        'Sem permissão para subir documentos para esta propriedade',
      );
    }

    try {
      const documentos = await this.documentoUploadService.uploadFiles(files);

      const documentosPropriedade = await this.documentoRepository.save(
        documentos.map((documento) => ({
          nomeArquivo: documento.filename,
          nomeArquivoOriginal: documento.originalName,
          urlArquivo: documento.url,
          propriedades: [propriedade],
          tipo: parametros.find(
            (parametro) => parametro.nome === documento.originalName,
          )?.tipo,
          idUsuarioUpload: usuario.id,
        })),
      );

      await this.eventEmitter.emitAsync(
        ArquivoEnviadoEvent.name,
        new ArquivoEnviadoEvent(
          propriedade.proprietarios[0].pessoa.email,
          propriedade.proprietarios[0].pessoa.nome,
          propriedade.analista.email,
          propriedade.analista.pessoa.nome,
          documentosPropriedade[0].nomeArquivo,
          documentosPropriedade[0].tipo,
          analistaDaPropriedade ? 'ANALISTA' : 'PRODUTOR',
          propriedade.nomePropriedade,
        ),
      );

      return documentosPropriedade;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async listarDocumentosAnalista(idPropriedade: number): Promise<Documento[]> {
    const propriedade = await this.propriedadeRepository.findOne({
      where: { id: idPropriedade },
      relations: ['analista'],
    });

    if (!propriedade) {
      throw new BadRequestException('Propriedade não encontrada.');
    }

    if (!propriedade.analista?.id) {
      return []; // Retorna vazio se não houver analista associado
    }

    return this.documentoRepository.find({
      where: {
        propriedades: { id: idPropriedade },
        idUsuarioUpload: propriedade.analista.id,
      },
    });
  }

  async consultaPropriedadePorCar(carFederal: string) {
    const query = this.propriedadeRepository.createQueryBuilder('pr');
    query.leftJoinAndSelect('pr.proprietarios', 'proprietarios');
    query.leftJoinAndSelect('proprietarios.pessoa', 'pessoa');
    query.leftJoinAndSelect('pr.endereco', 'endereco');
    query.leftJoinAndSelect('pr.cidade', 'cidade');
    query.leftJoinAndSelect(
      'pr.solicitacaoElegibilidade',
      'solicitacaoElegibilidade',
    );
    query.leftJoinAndSelect(
      'solicitacaoElegibilidade.retornoAgrotools',
      'retornoAgrotools',
    );
    query.where('pr.dataCriacao  is not null');
    if (carFederal !== null && carFederal !== undefined) {
      query.andWhere('pr.carFederal = :carFederal', {
        carFederal: carFederal?.replace(/[.]/g, ''),
      });
    }

    return await query.getOne();
  }

  async deletar(idPropriedade: number): Promise<void> {
    const propriedade = await this.propriedadeRepository.findOneBy({
      id: idPropriedade,
    });

    if (!propriedade) {
      throw new NegocioException(422, 'Propriedade não encontrada');
    }

    if (
      propriedade.status?.toLowerCase() ===
      StatusEtapas.Desativada.Inativa.toLowerCase()
    ) {
      throw new BadRequestException('Propriedade já inativada.');
    }

    propriedade.status = StatusEtapas.Desativada.Inativa;
    propriedade.etapa = Etapas.Desativada;

    await this.propriedadeRepository.save(propriedade);
  }

  async aceitarTermoAdequacao(id: number): Promise<Propriedade> {
    const propriedade = await this.propriedadeRepository.findOne({
      where: { id },
      relations: [
        'proprietarios',
        'proprietarios.pessoa',
        'cidade',
        'endereco',
        'analise',
        'analise.deteccoes',
      ],
    });

    if (!propriedade) {
      throw new BadRequestException('Propriedade não encontrada.');
    }

    if (
      propriedade.status?.toLowerCase() ===
      StatusEtapas.Desativada.Inativa.toLowerCase()
    ) {
      throw new BadRequestException('Propriedade inativa.');
    }

    if (propriedade.idTermoCompromisso) {
      throw new BadRequestException(
        'Termo de adequação já enviado ou assinado.',
      );
    }

    propriedade.etapa = Etapas.Termo;
    propriedade.status = StatusEtapas[Etapas.Termo].Enviado;

    await this.gerarDocumentoDcs(propriedade);

    const idExternoTermoCompromisso =
      await this.enviarTermoCompromisso(propriedade);

    propriedade.idTermoCompromisso = idExternoTermoCompromisso;
    return this.propriedadeRepository.save(propriedade);
  }

  async consultaPropriedadePorIdMultas(
    id: number,
    request?: AuthenticatedRequest,
  ) {
    return await this.propriedadeRepository.findOne({
      where: { id: id },
      relations: [
        'proprietarios',
        'endereco',
        'cidade',
        'proprietarios.pessoa',
        'pagamentoMultas',
      ],
    });
  }

  async consultaUsuario(email: string): Promise<Usuario> {
    return await this.usuarioService.buscarUsuarioPorEmail(email);
  }

  async termoCompromissoAssinado(
    idTermoCompromisso: string,
    email: string,
  ): Promise<void> {
    const propriedade = await this.propriedadeRepository.findOne({
      where: { idTermoCompromisso, proprietarios: { pessoa: { email } } },
    });

    if (!propriedade) {
      throw new BadRequestException('Propriedade não encontrada.');
    }

    if (
      propriedade.status?.toLowerCase() ===
      StatusEtapas.Desativada.Inativa.toLowerCase()
    ) {
      throw new BadRequestException('Propriedade inativa.');
    }

    if (propriedade.termoAdequacaoAceito) {
      throw new BadRequestException('Termo de compromisso já aceito.');
    }

    propriedade.termoAdequacaoAceito = true;
    propriedade.etapa = Etapas.Termo;
    propriedade.status = StatusEtapas[Etapas.Termo].Assinado;

    await this.propriedadeRepository.save(propriedade);
  }

  private async gerarDocumentoDcs(propriedade: Propriedade): Promise<void> {
    const dcsPdfBuffer = await this.pdfService.generate(
      new DcsPdfTemplate({
        car: propriedade.carFederal,
        idPropriedade: propriedade.id,
        nomePropriedade: propriedade.nomePropriedade,
        cpfCnpj: propriedade.proprietarios[0].pessoa.cpfCnpj,
        dataAdesaoPrem: propriedade.dataCriacao
          ? new Date(propriedade.dataCriacao).toLocaleDateString('BR')
          : '',
        deteccoes:
          propriedade.analise?.deteccoes.map((deteccao) => ({
            tipo: deteccao.tipo,
            areaHa: deteccao.area_ha,
          })) ?? [],
      }),
    );

    // Fazer o módulo de upload de arquivos aceitar buffer para evitar isso
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'dcs.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: dcsPdfBuffer.length,
      destination: '',
      filename: 'dcs.pdf',
      path: '',
      buffer: dcsPdfBuffer,
      stream: new Readable(),
    };

    const parametros: ParametrosArquivo[] = [
      {
        nome: 'dcs.pdf',
        tipo: 'DCS',
      },
    ];

    await this.uploadDocumentos(
      propriedade.id,
      propriedade.proprietarios[0].pessoa.email,
      [file],
      parametros,
    );
  }

  private async enviarTermoCompromisso(
    propriedade: Propriedade,
  ): Promise<string> {
    const termoCompromissoPdfBuffer = await this.pdfService.generate(
      new TermoCompromissoPdfTemplate({
        produtor: {
          nome: propriedade.proprietarios[0].pessoa.nome,
          cpfCnpj: propriedade.proprietarios[0].pessoa.cpfCnpj,
          email: propriedade.proprietarios[0].pessoa.email,
          cargo: 'PRODUTOR',
          cidade: propriedade.cidade.nome,
          estado: propriedade.cidade.uf,
          complemento: propriedade.endereco?.complemento ?? '',
          endereco: propriedade.endereco?.logradouro ?? '',
          representante: propriedade.proprietarios[0].pessoa.nome,
          telefone: propriedade.proprietarios[0].pessoa.telefone,
          cpf: propriedade.proprietarios[0].pessoa.cpfCnpj,
        },
        areaArenegerar: propriedade.analise?.areaARegenerar ?? 0,
      }),
    );

    return await this.assinaturaService.enviarDocumentoParaAssinatura(
      {
        conteudo: termoCompromissoPdfBuffer,
        nomeArquivo: `termo-compromisso-${propriedade.carFederal}`,
        mimeType: 'application/pdf',
      },
      [
        {
          email: propriedade.proprietarios[0].pessoa.email,
          nome: propriedade.proprietarios[0].pessoa.nome,
        },
      ],
    );
  }

  async validarDCS(
    idPropriedade?: number,
    carFederal?: string,
  ): Promise<ValidacaoDCSResponse> {
    if (!idPropriedade && !carFederal) {
      throw new BadRequestException(
        'É preciso passar pelo menos um parâmetro: idPropriedade ou carFederal',
      );
    }

    const propriedade = await this.propriedadeRepository.findOne({
      where: [{ id: idPropriedade }, { carFederal }],
      relations: [
        'proprietarios',
        'proprietarios.pessoa',
        'analise',
        'analise.deteccoes',
        'documentos',
      ],
    });

    if (!propriedade) {
      throw new BadRequestException('Propriedade não encontrada.');
    }

    const autoVistoria = await this.autoVistoriaRepository.findOne({
      where: { propriedade: { id: propriedade.id } },
      order: { dataTermino: 'DESC' },
    });

    const multaAtrasada = await this.pagamentoMultaRepository.findOne({
      where: {
        propriedade: { id: propriedade.id },
        status: StatusPagamento.VENCIDO,
      },
    });

    const response = {
      id: propriedade.id,
      carFederal: propriedade.carFederal,
      nomePropriedade: propriedade.nomePropriedade,
      cpfCnpj: propriedade.proprietarios[0].pessoa.cpfCnpj,
      dataAdesaoPrem: propriedade.dataCriacao
        ? new Date(propriedade.dataCriacao).toLocaleDateString('BR')
        : '',
      deteccoes:
        propriedade.analise?.deteccoes.map((deteccao) => ({
          tipo: deteccao.tipo,
          areaHa: deteccao.area_ha,
        })) ?? [],
    };

    const urlDcs =
      propriedade.documentos.find((documento) => documento.tipo === 'DCS')
        ?.urlArquivo || '';

    if (
      propriedade.statusVoucher &&
      propriedade.termoAdequacaoAceito &&
      autoVistoria?.vistoria === Vistoria.Deferido &&
      !multaAtrasada
    ) {
      return {
        ...response,
        status: DCSStatus.Apto,
        urlDcs,
      };
    }

    return {
      ...response,
      status: DCSStatus.Suspenso,
      urlDcs,
    };
  }

  async consultarPropriedadeTerritorio() {
    const hoje = new Date();
    let ontem = new Date();
    const dia = hoje.getDate();
    ontem.setDate(dia - 2);

    const query = this.propriedadeRepository.createQueryBuilder('pr');
    query.leftJoinAndSelect('pr.proprietarios', 'proprietarios');
    query.leftJoinAndSelect('proprietarios.pessoa', 'pessoa');
    query.leftJoinAndSelect('pr.endereco', 'endereco');
    query.leftJoinAndSelect('pr.territorios', 'territorios');
    query.innerJoinAndSelect('pr.vouches', 'vouches');
    query.where(`vouches.status = 'ATIVO' `);
    query.andWhere(`vouches.dataCriacao BETWEEN '${moment(ontem).format('YYYY-MM-DD HH:mm:ss')}' 
        AND '${moment(hoje).format('YYYY-MM-DD HH:mm:ss')}'`);
    return await query.getMany();
  }

  async pegarLinkDocumentoTermoCompromissoAssinado(
    uuid: string,
  ): Promise<void> {
    const urlTermo =
      await this.assinaturaService.pegarLinkDocumentoAssinado(uuid);

    const propriedade = await this.propriedadeRepository.findOne({
      where: { idTermoCompromisso: uuid },
    });

    if (!propriedade) {
      throw new BadRequestException('Propriedade não encontrada.');
    }

    propriedade.urlTermoCompromisso = urlTermo;
    await this.propriedadeRepository.save(propriedade);
  }

  async alterarAcao(acaoRequest: AcoesRequest): Promise<void> {
    const propriedade = await this.propriedadeRepository.findOne({
      where: { id: acaoRequest.idPropriedade },
    });
    if (!propriedade) {
      throw new BadRequestException('Propriedade não encontrada.');
    }
    propriedade.contestarDeteccoes = acaoRequest.contestarDeteccoes;
    propriedade.confirmarDeteccoes = acaoRequest.confirmarDeteccoes;
    propriedade.termoAssinado = acaoRequest.termoAssinado;
    propriedade.proporNovaArea = acaoRequest.proporNovaArea;
    propriedade.confirmarEstrategia = acaoRequest.confirmarEstrategia;
    await this.propriedadeRepository.save(propriedade);

  }
}
