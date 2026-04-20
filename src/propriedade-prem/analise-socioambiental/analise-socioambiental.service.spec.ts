import { Test, TestingModule } from '@nestjs/testing';
import { AnaliseSocioambientalService } from './analise-socioambiental.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RetornoAnaliseEntity } from '../../agrotools/entities/retorno-analise.entity';
import { ContestacaoAutorizacaoSupressao } from './entities/contestacao-autorizacao-supressao.entity';
import { ContestacaoLaudo } from './entities/contestacao-laudo.entity';
import { TipoAutorizacaoSupressao } from './entities/tipo-autorizacao-supressao.entity';
import { OrgaoEmissorAutorizacaoSupressao } from './entities/orgao-emissor-autorizacao-supressao.entity';
import { Documento } from '../../shared/entity/documento.entity';
import { DocumentoUploadService, UploadDocumento } from '../../upload/documento-upload.service';
import { BadRequestException } from '@nestjs/common';
import { CriarContestacaoAutorizacaoSupressaoRequest } from './dto/criar-contestacao-autorizacao-supressao-request';
import { CriarContestacaoLaudoRequest } from './dto/criar-contestacao-laudo-request';
import { EnviarArquivosContestacaoAutorizacaoSupressaoRequest } from './dto/enviar-arquivos-contestacao-autorizacao-supressao-request';
import { EnviarArquivosContestacaoLaudoRequest } from './dto/enviar-arquivos-contestacao-laudo-request';
import { ResponsavelTecnico } from '../../responsavel-tecnico/entities/responsavel-tecnico.entity';
import { PlanoAdequacao } from './entities/plano-adequacao.entity';
import { CriarPlanoAdequacaoRequest } from './dto/criar-plano-adequacao-request';
import { UploadPayloadType } from '../../shared/types/upload-payload.type';
import { AuthenticatedRequest } from '../../shared/interfaces/authenticated-request.interface';
import { CriarParecerContestacaoRequest } from './dto/criar-parecer-contestacao-request';
import { SituacaoContestacaoEnum } from './enum/situacao-contestacao.enum';
import { EmailService } from '../../email/email.service';
import { CriarParecerPlanoAdequacaoRequest } from './dto/criar-parecer-plano-adequacao-request';
import { UsuarioService } from '../../usuario/usuario.service';
import { SituacaoPlanoAdequacaoEnum } from './enum/situacao-plano-adequacao.enum';

const mockAnaliseRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};
const mockContestacaoAutorizacaoRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};
const mockContestacaoLaudoRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};
const mockTipoAutorizacaoRepository = {
  find: jest.fn(),
};
const mockOrgaoEmissorRepository = {
  find: jest.fn(),
};
const mockDocumentoRepository = {
  save: jest.fn(),
};
const mockDocumentoUploadService = {
  uploadFiles: jest.fn(),
};
const mockResponsavelTecnicoRepository = {
  findOne: jest.fn(),
};
const mockPlanoAdequacaoRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};
const mockEmailService = {
  enviarEmailTemplate: jest.fn(),
};
const mockUsuarioService = {
  buscarUsuarioPorEmail: jest.fn(),
};

describe('AnaliseSocioambientalService', () => {
  let service: AnaliseSocioambientalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnaliseSocioambientalService,
        {
          provide: getRepositoryToken(RetornoAnaliseEntity),
          useValue: mockAnaliseRepository,
        },
        {
          provide: getRepositoryToken(ContestacaoAutorizacaoSupressao),
          useValue: mockContestacaoAutorizacaoRepository,
        },
        {
          provide: getRepositoryToken(ContestacaoLaudo),
          useValue: mockContestacaoLaudoRepository,
        },
        {
          provide: getRepositoryToken(TipoAutorizacaoSupressao),
          useValue: mockTipoAutorizacaoRepository,
        },
        {
          provide: getRepositoryToken(OrgaoEmissorAutorizacaoSupressao),
          useValue: mockOrgaoEmissorRepository,
        },
        {
          provide: getRepositoryToken(ResponsavelTecnico),
          useValue: mockResponsavelTecnicoRepository,
        },
        {
          provide: getRepositoryToken(Documento),
          useValue: mockDocumentoRepository,
        },
        {
          provide: DocumentoUploadService,
          useValue: mockDocumentoUploadService,
        },
        {
          provide: getRepositoryToken(PlanoAdequacao),
          useValue: mockPlanoAdequacaoRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
      ],
    }).compile();

    service = module.get<AnaliseSocioambientalService>(AnaliseSocioambientalService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const mockUserRequest: AuthenticatedRequest = { user: { email: 'owner@test.com', roles: ['PRODUTOR'] } } as AuthenticatedRequest;
  const mockAnalistaRequest: AuthenticatedRequest = { user: { email: 'analista@test.com', roles: ['ANALISTA'] } } as AuthenticatedRequest;
  const mockIdPropriedade = 1;
  const mockIdAnalise = 1;
  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024,
    buffer: Buffer.from('test'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };
  const mockAnalise = {
    id: mockIdAnalise,
    propriedade: {
      id: mockIdPropriedade,
      proprietarios: [{ pessoa: { email: mockUserRequest.user.email } }],
      ...({} as any)
    },
  } as unknown as RetornoAnaliseEntity;

  const mockResponsavelTecnico = { id: 1, nome: 'Responsavel Teste' } as ResponsavelTecnico;
  const mockTipoAutorizacao = { id: 1, nome: 'Tipo Teste' } as TipoAutorizacaoSupressao;
  const mockOrgaoEmissor = { id: 1, nome: 'Orgao Teste' } as OrgaoEmissorAutorizacaoSupressao;

  const mockDefaultRelations = [
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
    'planoAdequacao.responsavelTecnico'
  ];

  beforeEach(() => {
    mockUsuarioService.buscarUsuarioPorEmail.mockResolvedValue({ id: 1, email: mockUserRequest.user.email });
  });

  describe('criarContestacaoAutorizacaoSupressao', () => {
    const request: CriarContestacaoAutorizacaoSupressaoRequest = {
      autorizacoesSupressoes: [{
        idTipo: 1,
        idOrgaoEmissor: 1,
        areaAutorizadaParaSupressaoHa: 10,
        dataEmissao: new Date().toISOString(),
        dataValidade: new Date().toISOString(),
        nomeArquivo: 'test.pdf',
      }],
      idResponsavelTecnico: 1,
      motivo: 'test',
      parametros: [{ nome: 'test.pdf', tipo: 'TIPO_TESTE' }],
      arquivos: []
    };
    const payload: UploadPayloadType<CriarContestacaoAutorizacaoSupressaoRequest> = {
      body: request,
      arquivos: [mockFile],
    };

    beforeEach(() => {
      mockAnaliseRepository.findOne.mockResolvedValue(mockAnalise);
      mockContestacaoAutorizacaoRepository.findOne.mockResolvedValue(null);
      mockResponsavelTecnicoRepository.findOne.mockResolvedValue(mockResponsavelTecnico);
      mockTipoAutorizacaoRepository.find.mockResolvedValue([mockTipoAutorizacao]);
      mockOrgaoEmissorRepository.find.mockResolvedValue([mockOrgaoEmissor]);
      const uploadedDocs: UploadDocumento[] = [{ originalName: 'test.pdf', filename: 'saved-test.pdf', url: 'http://some.url/saved-test.pdf' }];
      mockDocumentoUploadService.uploadFiles.mockResolvedValue(uploadedDocs);
      const savedDocs: Documento[] = [{
        id: 1, nomeArquivo: 'saved-test.pdf', urlArquivo: 'http://some.url/saved-test.pdf', tipo: 'TIPO_TESTE', nomeArquivoOriginal: 'test.pdf',
        dataUpload: new Date()
      }];
      mockDocumentoRepository.save.mockResolvedValue(savedDocs);
      mockContestacaoAutorizacaoRepository.save.mockResolvedValue(new ContestacaoAutorizacaoSupressao());
    });

    it('should create a contestation successfully', async () => {
      const result = await service.criarContestacaoAutorizacaoSupressao(
        mockIdPropriedade,
        mockIdAnalise,
        mockUserRequest,
        payload,
      );

      expect(mockAnaliseRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: mockIdAnalise,
          propriedade: {
            id: mockIdPropriedade,
            proprietarios: [{ pessoa: { email: mockUserRequest.user.email } }],
          },
        },
        relations: mockDefaultRelations,
      });
      expect(mockContestacaoAutorizacaoRepository.findOne).toHaveBeenCalledWith({ where: { idAnalise: mockIdAnalise } });
      expect(mockResponsavelTecnicoRepository.findOne).toHaveBeenCalledWith({ where: { id: request.idResponsavelTecnico } });
      expect(mockTipoAutorizacaoRepository.find).toHaveBeenCalledWith({ where: { id: expect.any(Object) } });
      expect(mockOrgaoEmissorRepository.find).toHaveBeenCalledWith({ where: { id: expect.any(Object) } });
      expect(mockDocumentoUploadService.uploadFiles).toHaveBeenCalledWith(payload.arquivos);
      expect(mockDocumentoRepository.save).toHaveBeenCalled();
      expect(mockContestacaoAutorizacaoRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(ContestacaoAutorizacaoSupressao);
    });

    it('should throw BadRequestException if analysis not found', async () => {
      mockAnaliseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.criarContestacaoAutorizacaoSupressao(
          mockIdPropriedade,
          mockIdAnalise,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Análise socioambiental não encontrada.'));
    });

    it('should throw BadRequestException if file parameter is not found', async () => {
      const uploadedDocs: UploadDocumento[] = [{ originalName: 'wrong-name.pdf', filename: 'saved-test.pdf', url: 'http://some.url/saved-test.pdf' }];
      mockDocumentoUploadService.uploadFiles.mockResolvedValue(uploadedDocs);

      await expect(
        service.criarContestacaoAutorizacaoSupressao(
          mockIdPropriedade,
          mockIdAnalise,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException(`Parâmetro não encontrado para o arquivo: wrong-name.pdf`));
    });

    it('should throw BadRequestException if a contestation already exists', async () => {
      mockContestacaoAutorizacaoRepository.findOne.mockResolvedValue(new ContestacaoAutorizacaoSupressao());

      await expect(
        service.criarContestacaoAutorizacaoSupressao(
          mockIdPropriedade,
          mockIdAnalise,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Já existe uma contestação de autorização de supressão deste tipo para esta análise.'));
    });

    it('should throw BadRequestException if Responsavel Tecnico not found', async () => {
      mockResponsavelTecnicoRepository.findOne.mockResolvedValue(null);

      await expect(
        service.criarContestacaoAutorizacaoSupressao(
          mockIdPropriedade,
          mockIdAnalise,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Responsável Técnico não encontrado.'));
    });

    it('should throw BadRequestException if Tipo Autorizacao Supressao not found', async () => {
      mockTipoAutorizacaoRepository.find.mockResolvedValue([]);

      await expect(
        service.criarContestacaoAutorizacaoSupressao(
          mockIdPropriedade,
          mockIdAnalise,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Um ou mais tipos de autorização de supressão não foram encontrados.'));
    });

    it('should throw BadRequestException if Orgao Emissor Autorizacao Supressao not found', async () => {
      mockTipoAutorizacaoRepository.find.mockResolvedValue([mockTipoAutorizacao]);
      mockOrgaoEmissorRepository.find.mockResolvedValue([]);

      await expect(
        service.criarContestacaoAutorizacaoSupressao(
          mockIdPropriedade,
          mockIdAnalise,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Um ou mais órgãos emissores não foram encontrados.'));
    });
  });

  describe('criarContestacaoLaudo', () => {
    const request: CriarContestacaoLaudoRequest = {
      motivo: 'test laudo',
      idResponsavelTecnico: 1,
      parametros: [{ nome: 'test.pdf', tipo: 'LAUDO' }],
      arquivos: []
    };
    const payload: UploadPayloadType<CriarContestacaoLaudoRequest> = {
      body: request,
      arquivos: [mockFile],
    };

    beforeEach(() => {
      mockAnaliseRepository.findOne.mockResolvedValue(mockAnalise);
      mockContestacaoLaudoRepository.findOne.mockResolvedValue(null);
      mockResponsavelTecnicoRepository.findOne.mockResolvedValue(mockResponsavelTecnico);
      const uploadedDocs: UploadDocumento[] = [{ originalName: 'test.pdf', filename: 'saved-test.pdf', url: 'http://some.url/saved-test.pdf' }];
      mockDocumentoUploadService.uploadFiles.mockResolvedValue(uploadedDocs);
      const savedDocs: Documento[] = [{
        id: 1, nomeArquivo: 'saved-test.pdf', urlArquivo: 'http://some.url/saved-test.pdf', tipo: 'LAUDO', nomeArquivoOriginal: 'test.pdf',
        dataUpload: new Date()
      }];
      mockDocumentoRepository.save.mockResolvedValue(savedDocs);
      mockContestacaoLaudoRepository.save.mockResolvedValue(new ContestacaoLaudo());
    });

    it('should create a laudo contestation successfully', async () => {
      const result = await service.criarContestacaoLaudo(
        mockIdPropriedade,
        mockIdAnalise,
        mockUserRequest,
        payload,
      );

      expect(mockAnaliseRepository.findOne).toHaveBeenCalled();
      expect(mockContestacaoLaudoRepository.findOne).toHaveBeenCalledWith({ where: { idAnalise: mockIdAnalise } });
      expect(mockResponsavelTecnicoRepository.findOne).toHaveBeenCalledWith({ where: { id: request.idResponsavelTecnico } });
      expect(mockDocumentoUploadService.uploadFiles).toHaveBeenCalledWith(payload.arquivos);
      expect(mockDocumentoRepository.save).toHaveBeenCalled();
      expect(mockContestacaoLaudoRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(ContestacaoLaudo);
    });

    it('should throw an error if analysis not found', async () => {
      mockAnaliseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.criarContestacaoLaudo(
          mockIdPropriedade,
          mockIdAnalise,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Análise socioambiental não encontrada.'));
    });

    it('should throw BadRequestException if a contestation already exists', async () => {
      mockContestacaoLaudoRepository.findOne.mockResolvedValue(new ContestacaoLaudo());

      await expect(
        service.criarContestacaoLaudo(
          mockIdPropriedade,
          mockIdAnalise,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Já existe uma contestação por laudo deste tipo para esta análise.'));
    });

    it('should throw BadRequestException if file parameter is not found', async () => {
      const uploadedDocs: UploadDocumento[] = [{ originalName: 'wrong-name.pdf', filename: 'saved-test.pdf', url: 'http://some.url/saved-test.pdf' }];
      mockDocumentoUploadService.uploadFiles.mockResolvedValue(uploadedDocs);

      await expect(
        service.criarContestacaoLaudo(
          mockIdPropriedade,
          mockIdAnalise,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException(`Parâmetro não encontrado para o arquivo: wrong-name.pdf`));
    });

    it('should throw BadRequestException if Responsavel Tecnico not found', async () => {
      mockResponsavelTecnicoRepository.findOne.mockResolvedValue(null);

      await expect(
        service.criarContestacaoLaudo(
          mockIdPropriedade,
          mockIdAnalise,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Responsável Técnico não encontrado.'));
    });
  });

  describe('enviarArquivosContestacaoAutorizacaoSupressao', () => {
    const mockIdContestacao = 1;
    const request: EnviarArquivosContestacaoAutorizacaoSupressaoRequest = {
      parametros: [{ nome: 'new-file.pdf', tipo: 'NOVO_DOCUMENTO' }],
      arquivos: []
    };
    const payload: UploadPayloadType<EnviarArquivosContestacaoAutorizacaoSupressaoRequest> = {
      body: request,
      arquivos: [mockFile],
    };
    const existingContestacao = {
      id: mockIdContestacao,
      idAnalise: mockIdAnalise,
      documentos: [],
      analiseSocioambiental: {
        propriedade: { id: mockIdPropriedade },
      },
      // ... outras propriedades
    } as unknown as ContestacaoAutorizacaoSupressao;

    beforeEach(() => {
      mockContestacaoAutorizacaoRepository.findOne.mockResolvedValue(existingContestacao);
      mockAnaliseRepository.findOne.mockResolvedValue(mockAnalise);
      const uploadedDocs: UploadDocumento[] = [{ originalName: 'new-file.pdf', filename: 'saved-new-file.pdf', url: 'http://some.url/saved-new-file.pdf' }];
      mockDocumentoUploadService.uploadFiles.mockResolvedValue(uploadedDocs);
      const savedNewDocs: Documento[] = [{
        id: 2, nomeArquivo: 'saved-new-file.pdf', urlArquivo: 'http://some.url/saved-new-file.pdf', tipo: 'NOVO_DOCUMENTO', nomeArquivoOriginal: 'new-file.pdf',
        dataUpload: new Date()
      }];
      mockDocumentoRepository.save.mockResolvedValue(savedNewDocs);
      mockContestacaoAutorizacaoRepository.save.mockResolvedValue({ ...existingContestacao, documentos: savedNewDocs });
    });

    it('should successfully add new files to an existing contestation', async () => {
      const result = await service.enviarArquivosContestacaoAutorizacaoSupressao(
        mockIdPropriedade,
        mockIdAnalise,
        mockIdContestacao,
        mockUserRequest,
        payload,
      );

      expect(mockContestacaoAutorizacaoRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockIdContestacao, idAnalise: mockIdAnalise, analiseSocioambiental: { propriedade: { id: mockIdPropriedade } } },
        relations: ['analiseSocioambiental', 'analiseSocioambiental.propriedade', 'documentos']
      });
      expect(mockAnaliseRepository.findOne).toHaveBeenCalled();
      expect(mockDocumentoUploadService.uploadFiles).toHaveBeenCalledWith(payload.arquivos);
      expect(mockDocumentoRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            nomeArquivo: 'saved-new-file.pdf',
            tipo: 'NOVO_DOCUMENTO',
          }),
        ])
      );
      expect(mockContestacaoAutorizacaoRepository.save).toHaveBeenCalled();
      expect(result.documentos).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 2, nomeArquivo: 'saved-new-file.pdf', urlArquivo: 'http://some.url/saved-new-file.pdf', tipo: 'NOVO_DOCUMENTO', nomeArquivoOriginal: 'new-file.pdf' })])
      );
    });

    it('should throw BadRequestException if contestation not found', async () => {
      mockContestacaoAutorizacaoRepository.findOne.mockResolvedValue(null);

      await expect(
        service.enviarArquivosContestacaoAutorizacaoSupressao(
          mockIdPropriedade,
          mockIdAnalise,
          mockIdContestacao,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Contestação de autorização de supressão não encontrada para a propriedade informada.'));
    });

    it('should throw BadRequestException if analysis not found', async () => {
      mockAnaliseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.enviarArquivosContestacaoAutorizacaoSupressao(
          mockIdPropriedade,
          mockIdAnalise,
          mockIdContestacao,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Análise socioambiental não encontrada.'));
    });

    it('should throw BadRequestException if file parameter is not found', async () => {
      const uploadedDocs: UploadDocumento[] = [{ originalName: 'wrong-name.pdf', filename: 'saved-new-file.pdf', url: 'http://some.url/saved-new-file.pdf' }];
      mockDocumentoUploadService.uploadFiles.mockResolvedValue(uploadedDocs);

      await expect(
        service.enviarArquivosContestacaoAutorizacaoSupressao(
          mockIdPropriedade,
          mockIdAnalise,
          mockIdContestacao,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException(`Parâmetro não encontrado para o arquivo: wrong-name.pdf`));
    });
  });

  describe('enviarArquivosContestacaoLaudo', () => {
    const mockIdContestacao = 1;
    const request: EnviarArquivosContestacaoLaudoRequest = {
      parametros: [{ nome: 'new-file.pdf', tipo: 'NOVO_DOCUMENTO' }],
      arquivos: []
    };
    const payload: UploadPayloadType<EnviarArquivosContestacaoLaudoRequest> = {
      body: request,
      arquivos: [mockFile],
    };
    const existingContestacao = {
      id: mockIdContestacao,
      idAnalise: mockIdAnalise,
      documentos: [],
      analiseSocioambiental: {
        propriedade: { id: mockIdPropriedade },
      },
      // ... outras propriedades
    } as unknown as ContestacaoLaudo;

    beforeEach(() => {
      mockContestacaoLaudoRepository.findOne.mockResolvedValue(existingContestacao);
      mockAnaliseRepository.findOne.mockResolvedValue(mockAnalise);
      const uploadedDocs: UploadDocumento[] = [{ originalName: 'new-file.pdf', filename: 'saved-new-file.pdf', url: 'http://some.url/saved-new-file.pdf' }];
      mockDocumentoUploadService.uploadFiles.mockResolvedValue(uploadedDocs);
      const savedNewDocs: Documento[] = [{
        id: 2, nomeArquivo: 'saved-new-file.pdf', urlArquivo: 'http://some.url/saved-new-file.pdf', tipo: 'NOVO_DOCUMENTO', nomeArquivoOriginal: 'new-file.pdf',
        dataUpload: new Date()
      }];
      mockDocumentoRepository.save.mockResolvedValue(savedNewDocs);
      mockContestacaoLaudoRepository.save.mockResolvedValue({ ...existingContestacao, documentos: savedNewDocs });
    });

    it('should successfully add new files to an existing laudo contestation', async () => {
      const result = await service.enviarArquivosContestacaoLaudo(
        mockIdPropriedade,
        mockIdAnalise,
        mockIdContestacao,
        mockUserRequest,
        payload,
      );

      expect(mockContestacaoLaudoRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockIdContestacao, idAnalise: mockIdAnalise, analiseSocioambiental: { propriedade: { id: mockIdPropriedade } } },
        relations: ['analiseSocioambiental', 'analiseSocioambiental.propriedade', 'documentos']
      });
      expect(mockAnaliseRepository.findOne).toHaveBeenCalled();
      expect(mockDocumentoUploadService.uploadFiles).toHaveBeenCalledWith(payload.arquivos);
      expect(mockDocumentoRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            nomeArquivo: 'saved-new-file.pdf',
            tipo: 'NOVO_DOCUMENTO',
          }),
        ])
      );
      expect(mockContestacaoLaudoRepository.save).toHaveBeenCalled();
      expect(result.documentos).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 2, nomeArquivo: 'saved-new-file.pdf', urlArquivo: 'http://some.url/saved-new-file.pdf', tipo: 'NOVO_DOCUMENTO', nomeArquivoOriginal: 'new-file.pdf' })])
      );
    });

    it('should throw BadRequestException if contestation not found', async () => {
      mockContestacaoLaudoRepository.findOne.mockResolvedValue(null);

      await expect(
        service.enviarArquivosContestacaoLaudo(
          mockIdPropriedade,
          mockIdAnalise,
          mockIdContestacao,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Contestação por laudo não encontrada para a propriedade informada.'));
    });

    it('should throw BadRequestException if analysis not found', async () => {
      mockAnaliseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.enviarArquivosContestacaoLaudo(
          mockIdPropriedade,
          mockIdAnalise,
          mockIdContestacao,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Análise socioambiental não encontrada.'));
    });

    it('should throw BadRequestException if file parameter is not found', async () => {
      const uploadedDocs: UploadDocumento[] = [{ originalName: 'wrong-name.pdf', filename: 'saved-new-file.pdf', url: 'http://some.url/saved-new-file.pdf' }];
      mockDocumentoUploadService.uploadFiles.mockResolvedValue(uploadedDocs);

      await expect(
        service.enviarArquivosContestacaoLaudo(
          mockIdPropriedade,
          mockIdAnalise,
          mockIdContestacao,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException(`Parâmetro não encontrado para o arquivo: wrong-name.pdf`));
    });
  });

  describe('criarPlanoAdequacao', () => {
    const request: CriarPlanoAdequacaoRequest = {
      idResponsavelTecnico: 1,
      parametros: [{ nome: 'test-plano.pdf', tipo: 'PLANO' }],
      motivo: '',
      arquivos: []
    };
    const payload: UploadPayloadType<CriarPlanoAdequacaoRequest> = {
      body: request,
      arquivos: [mockFile],
    };

    beforeEach(() => {
      mockAnaliseRepository.findOne.mockResolvedValue(mockAnalise);
      mockPlanoAdequacaoRepository.findOne.mockResolvedValue(null);
      mockResponsavelTecnicoRepository.findOne.mockResolvedValue(mockResponsavelTecnico);
      const uploadedDocs: UploadDocumento[] = [{ originalName: 'test-plano.pdf', filename: 'saved-plano.pdf', url: 'http://some.url/saved-plano.pdf' }];
      mockDocumentoUploadService.uploadFiles.mockResolvedValue(uploadedDocs);
      const savedDocs: Documento[] = [{
        id: 1, nomeArquivo: 'saved-plano.pdf', urlArquivo: 'http://some.url/saved-plano.pdf', tipo: 'PLANO', nomeArquivoOriginal: 'test-plano.pdf',
        dataUpload: new Date()
      }];
      mockDocumentoRepository.save.mockResolvedValue(savedDocs);
      mockPlanoAdequacaoRepository.save.mockResolvedValue(new PlanoAdequacao());
    });

    it('should create a new plano de adequacao successfully', async () => {
      const result = await service.criarPlanoAdequacao(
        mockIdPropriedade,
        mockIdAnalise,
        mockUserRequest,
        payload,
      );

      expect(mockAnaliseRepository.findOne).toHaveBeenCalled();
      expect(mockPlanoAdequacaoRepository.findOne).toHaveBeenCalledWith({ where: { idAnalise: mockIdAnalise } });
      expect(mockResponsavelTecnicoRepository.findOne).toHaveBeenCalledWith({ where: { id: request.idResponsavelTecnico } });
      expect(mockDocumentoUploadService.uploadFiles).toHaveBeenCalledWith(payload.arquivos);
      expect(mockDocumentoRepository.save).toHaveBeenCalled();
      expect(mockPlanoAdequacaoRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(PlanoAdequacao);
    });

    it('should throw an error if analysis not found', async () => {
      mockAnaliseRepository.findOne.mockResolvedValue(null);

      await expect(
        service.criarPlanoAdequacao(
          mockIdPropriedade,
          mockIdAnalise,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Análise socioambiental não encontrada.'));
    });

    it('should throw BadRequestException if a plano de adequacao already exists', async () => {
      mockPlanoAdequacaoRepository.findOne.mockResolvedValue(new PlanoAdequacao());

      await expect(
        service.criarPlanoAdequacao(
          mockIdPropriedade,
          mockIdAnalise,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Já existe um plano de adequação para esta análise.'));
    });

    it('should throw BadRequestException if file parameter is not found', async () => {
      const uploadedDocs: UploadDocumento[] = [{ originalName: 'wrong-name.pdf', filename: 'saved-plano.pdf', url: 'http://some.url/saved-plano.pdf' }];
      mockDocumentoUploadService.uploadFiles.mockResolvedValue(uploadedDocs);

      await expect(
        service.criarPlanoAdequacao(
          mockIdPropriedade,
          mockIdAnalise,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException(`Parâmetro não encontrado para o arquivo: wrong-name.pdf`));
    });

    it('should throw BadRequestException if Responsavel Tecnico not found', async () => {
      mockResponsavelTecnicoRepository.findOne.mockResolvedValue(null);

      await expect(
        service.criarPlanoAdequacao(
          mockIdPropriedade,
          mockIdAnalise,
          mockUserRequest,
          payload,
        ),
      ).rejects.toThrow(new BadRequestException('Responsável Técnico não encontrado.'));
    });
  });

  describe('criarParecerContestacao', () => {
  // Shared mock data for parecer tests
  const mockPayload: UploadPayloadType<CriarParecerContestacaoRequest> = {
    body: {
      status: SituacaoContestacaoEnum.DEFERIDO,
      poligonos: [{
        idTad: 1,
        areaARegenerar: 10,
        wkt: 'POLYGON ((-58.812630243834334 -10.171487121129939, -58.812601094781236 -10.171455709529086, -58.81257912370929 -10.171412777094684, -58.812630243834334 -10.171487121129939))',
        tipo: 'Contestação por laudo',
        poligono: ''
      }],
      valorMulta: 5,
      descontoPercentual: 2,
      parametros: [{ nome: 'parecer.pdf', tipo: 'PARECER' }],
      arquivos: []
    },
    arquivos: [mockFile],
  };

  const mockContestacaoAutorizacaoSupressao = {
    id: 1,
    situacao: SituacaoContestacaoEnum.EM_ANALISE,
    idAnalise: mockIdAnalise,
  } as ContestacaoAutorizacaoSupressao;

  const mockContestacaoLaudo = {
    id: 2,
    situacao: SituacaoContestacaoEnum.EM_ANALISE,
    idAnalise: mockIdAnalise,
  } as ContestacaoLaudo;

  const mockAnaliseComContestacoesEmAnalise = {
    ...mockAnalise,
    contestacaoAutorizacaoSupressao: mockContestacaoAutorizacaoSupressao,
    contestacaoLaudo: mockContestacaoLaudo,
    deteccoes: [{ idAgrotools: 1, wkt: 'poligono-original' }]
  } as unknown as RetornoAnaliseEntity;

  const mockAnaliseComApenasContestacaoAutorizacao = {
    ...mockAnalise,
    contestacaoAutorizacaoSupressao: mockContestacaoAutorizacaoSupressao,
    contestacaoLaudo: null,
    propriedade: { proprietarios: [{ pessoa: { email: 'test@test.com' } }] },
    deteccoes: [{ idAgrotools: 1, wkt: 'poligono-original' }]
  } as unknown as RetornoAnaliseEntity;

  beforeEach(() => {
    // Mocks comuns para o cenário de sucesso
    mockAnaliseRepository.findOne.mockResolvedValue(mockAnaliseComContestacoesEmAnalise);
    mockDocumentoUploadService.uploadFiles.mockResolvedValue([{ originalName: 'parecer.pdf', filename: 'parecer-saved.pdf', url: 'url' }]);
    mockDocumentoRepository.save.mockResolvedValue([{ id: 1, nomeArquivo: 'parecer-saved.pdf', tipo: 'PARECER', nomeArquivoOriginal: 'parecer.pdf' }]);
    mockContestacaoAutorizacaoRepository.update.mockResolvedValue({});
    mockContestacaoLaudoRepository.update.mockResolvedValue({});
    mockAnaliseRepository.save.mockResolvedValue({ id: mockIdAnalise });
    mockEmailService.enviarEmailTemplate.mockResolvedValue({});
  });

  // Cenários de sucesso
  it('should successfully create a parecer for DEFERIDO status on a contestacao autorizacao', async () => {
    mockAnaliseRepository.findOne.mockResolvedValue(mockAnaliseComApenasContestacaoAutorizacao);
    const result = await service.criarParecerContestacao(
      mockIdPropriedade,
      mockIdAnalise,
      mockAnalistaRequest,
      mockPayload
    );

    // Assegura que o update na contestação foi chamado
    expect(mockContestacaoAutorizacaoRepository.update).toHaveBeenCalledWith(
      mockContestacaoAutorizacaoSupressao.id,
      { situacao: mockPayload.body.status }
    );
    expect(mockAnaliseRepository.save).toHaveBeenCalled();
    expect(mockEmailService.enviarEmailTemplate).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
  
  it('should successfully create a parecer for DEFERIDO_PARCIALMENTE status on contestacao laudo', async () => {
    const deferidoParcialPayload = { ...mockPayload, body: { ...mockPayload.body, status: SituacaoContestacaoEnum.DEFERIDO_PARCIALMENTE, valorMulta: 10 } };
    mockAnaliseRepository.findOne.mockResolvedValue({
      ...mockAnalise,
      contestacaoAutorizacaoSupressao: null,
      contestacaoLaudo: mockContestacaoLaudo,
      propriedade: { proprietarios: [{ pessoa: { email: 'test@test.com' } }] },
      deteccoes: [{ idAgrotools: 1, wkt: 'poligono-original' }]
    });

    const result = await service.criarParecerContestacao(
      mockIdPropriedade,
      mockIdAnalise,
      mockAnalistaRequest,
      deferidoParcialPayload
    );

    // Assegura que o update na contestação foi chamado
    expect(mockContestacaoLaudoRepository.update).toHaveBeenCalledWith(
      mockContestacaoLaudo.id,
      { situacao: SituacaoContestacaoEnum.DEFERIDO_PARCIALMENTE }
    );
    expect(mockAnaliseRepository.save).toHaveBeenCalled();
    expect(mockEmailService.enviarEmailTemplate).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  // Cenários de exceção (BadRequestException)
  it('should throw BadRequestException if status is EM_ANALISE', async () => {
    const invalidPayload = { ...mockPayload, body: { ...mockPayload.body, status: SituacaoContestacaoEnum.EM_ANALISE } };
    await expect(
      service.criarParecerContestacao(mockIdPropriedade, mockIdAnalise, mockAnalistaRequest, invalidPayload)
    ).rejects.toThrow(new BadRequestException('Não é possível colocar em análise um parecer de contestação'));
  });

  it('should throw BadRequestException if status is DEFERIDO but poligonos is missing', async () => {
    const invalidPayload = { ...mockPayload, body: { ...mockPayload.body, poligonos: undefined } };
    await expect(
      service.criarParecerContestacao(mockIdPropriedade, mockIdAnalise, mockAnalistaRequest, invalidPayload)
    ).rejects.toThrow(new BadRequestException('Para deferir ou deferir parcialmente a contestação, os campos poligonos, valorMulta e descontoPercentual são obrigatórios.'));
  });

  it('should throw BadRequestException if status is INDEFERIDO but poligonos is present', async () => {
    const invalidPayload = { ...mockPayload, body: { ...mockPayload.body, status: SituacaoContestacaoEnum.INDEFERIDO, poligonos: mockPayload.body.poligonos } };
    await expect(
      service.criarParecerContestacao(mockIdPropriedade, mockIdAnalise, mockAnalistaRequest, invalidPayload)
    ).rejects.toThrow(new BadRequestException('Para indeferir ou colocar a contestação com pendências, os campos poligonos, valorMulta e descontoPercentual não devem ser informados.'));
  });

  it('should throw BadRequestException if status is COM_PENDENCIAS but valorMulta is present', async () => {
    const invalidPayload = { ...mockPayload, body: { ...mockPayload.body, status: SituacaoContestacaoEnum.COM_PENDENCIAS, valorMulta: 10 } };
    await expect(
      service.criarParecerContestacao(mockIdPropriedade, mockIdAnalise, mockAnalistaRequest, invalidPayload)
    ).rejects.toThrow(new BadRequestException('Para indeferir ou colocar a contestação com pendências, os campos poligonos, valorMulta e descontoPercentual não devem ser informados.'));
  });

  it('should throw BadRequestException if contestation is not found', async () => {
    mockAnaliseRepository.findOne.mockResolvedValue({
      ...mockAnalise,
      contestacaoAutorizacaoSupressao: null,
      contestacaoLaudo: null,
    });
    await expect(
      service.criarParecerContestacao(mockIdPropriedade, mockIdAnalise, mockAnalistaRequest, mockPayload)
    ).rejects.toThrow(new BadRequestException('Não é possível criar um parecer sem que haja uma contestação existente.'));
  });

  it('should throw BadRequestException if contestation autorizacao status is not EM_ANALISE or COM_PENDENCIAS', async () => {
    mockAnaliseRepository.findOne.mockResolvedValue({
      ...mockAnalise,
      contestacaoAutorizacaoSupressao: { ...mockContestacaoAutorizacaoSupressao, situacao: SituacaoContestacaoEnum.DEFERIDO },
      contestacaoLaudo: null,
    });

    await expect(
      service.criarParecerContestacao(mockIdPropriedade, mockIdAnalise, mockAnalistaRequest, mockPayload)
    ).rejects.toThrow(new BadRequestException('Não é possível criar um parecer para uma contestação de autorização de supressão que não esteja em análise ou com pendências.'));
  });

  it('should throw BadRequestException if contestation laudo status is not EM_ANALISE or COM_PENDENCIAS', async () => {
    mockAnaliseRepository.findOne.mockResolvedValue({
      ...mockAnalise,
      contestacaoAutorizacaoSupressao: null,
      contestacaoLaudo: { ...mockContestacaoLaudo, situacao: SituacaoContestacaoEnum.INDEFERIDO },
    });

    await expect(
      service.criarParecerContestacao(mockIdPropriedade, mockIdAnalise, mockAnalistaRequest, mockPayload)
    ).rejects.toThrow(new BadRequestException('Não é possível criar um parecer para uma contestação por laudo que não esteja em análise ou com pendências.'));
  });
});

  describe('criarParecerPlanoAdequacao', () => {
    const idPlanoAdequacao = 1;
    const mockPayload: UploadPayloadType<CriarParecerPlanoAdequacaoRequest> = {
      body: {
        status: SituacaoContestacaoEnum.DEFERIDO,
        wkt: 'POLYGON(...)',
        parametros: [{ nome: 'parecer.pdf', tipo: 'PARECER' }],
        arquivos: []
      },
      arquivos: [mockFile],
    };

    const mockPlanoAdequacao = {
      id: idPlanoAdequacao,
      situacao: SituacaoPlanoAdequacaoEnum.EM_ANALISE,
      documentos: [],
    } as unknown as PlanoAdequacao;

    const mockAnaliseComPlano = {
      ...mockAnalise,
      planoAdequacao: mockPlanoAdequacao,
      propriedade: { proprietarios: [{ pessoa: { email: 'test@test.com' } }] }
    } as unknown as RetornoAnaliseEntity;

    beforeEach(() => {
      mockAnaliseRepository.findOne.mockResolvedValue(mockAnaliseComPlano);
      mockDocumentoUploadService.uploadFiles.mockResolvedValue([{ originalName: 'parecer.pdf', filename: 'parecer-saved.pdf', url: 'url' }]);
      mockDocumentoRepository.save.mockResolvedValue([{ id: 1, nomeArquivo: 'parecer-saved.pdf', tipo: 'PARECER', nomeArquivoOriginal: 'parecer.pdf' }]);
      mockPlanoAdequacaoRepository.save.mockResolvedValue({ ...mockPlanoAdequacao, situacao: mockPayload.body.status });
      mockEmailService.enviarEmailTemplate.mockResolvedValue({});
    });

    it('should successfully create a parecer for DEFERIDO status', async () => {
      const result = await service.criarParecerPlanoAdequacao(
        mockIdPropriedade,
        mockIdAnalise,
        idPlanoAdequacao,
        mockAnalistaRequest,
        mockPayload
      );

      expect(mockPlanoAdequacaoRepository.save).toHaveBeenCalled();
      expect(mockEmailService.enviarEmailTemplate).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if status is EM_ANALISE', async () => {
      const invalidPayload = { ...mockPayload, body: { ...mockPayload.body, status: SituacaoContestacaoEnum.EM_ANALISE } };
      await expect(
        service.criarParecerPlanoAdequacao(mockIdPropriedade, mockIdAnalise, idPlanoAdequacao, mockAnalistaRequest, invalidPayload)
      ).rejects.toThrow(new BadRequestException('Não é possível colocar em análise um parecer de plano de adequação'));
    });

    it('should throw BadRequestException if status is DEFERIDO but wkt is missing', async () => {
      const invalidPayload = { ...mockPayload, body: { ...mockPayload.body, wkt: undefined } };
      await expect(
        service.criarParecerPlanoAdequacao(mockIdPropriedade, mockIdAnalise, idPlanoAdequacao, mockAnalistaRequest, invalidPayload)
      ).rejects.toThrow(new BadRequestException('Para deferir ou deferir parcialmente o plano de adequação, o campo wkt é obrigatório.'));
    });

    it('should throw BadRequestException if planoAdequacao id does not match', async () => {
      await expect(
        service.criarParecerPlanoAdequacao(mockIdPropriedade, mockIdAnalise, 999, mockAnalistaRequest, mockPayload)
      ).rejects.toThrow(new BadRequestException('Não é possível criar um parecer sem que haja um plano de adequação existente.'));
    });

    it('should throw BadRequestException if planoAdequacao status is not valid for parecer', async () => {
      mockAnaliseRepository.findOne.mockResolvedValue({
        ...mockAnaliseComPlano,
        planoAdequacao: { ...mockPlanoAdequacao, situacao: SituacaoPlanoAdequacaoEnum.DEFERIDO },
      });

      await expect(
        service.criarParecerPlanoAdequacao(mockIdPropriedade, mockIdAnalise, idPlanoAdequacao, mockAnalistaRequest, mockPayload)
      ).rejects.toThrow(new BadRequestException('Não é possível criar um parecer para uma contestação de autorização de supressão que não esteja em análise ou com pendências.'));
    });

    it('should throw BadRequestException if status is INDEFERIDO but wkt is present', async () => {
      const invalidPayload = {
        ...mockPayload,
        body: {
          ...mockPayload.body,
          status: SituacaoContestacaoEnum.INDEFERIDO,
          wkt: 'POLYGON(...)'
        }
      };
      await expect(
        service.criarParecerPlanoAdequacao(mockIdPropriedade, mockIdAnalise, idPlanoAdequacao, mockAnalistaRequest, invalidPayload)
      ).rejects.toThrow(new BadRequestException('Para indeferir ou colocar a contestação com pendências, os campo wkt não deve ser informado.'));
    });

    it('should throw BadRequestException if status is COM_PENDENCIAS but wkt is present', async () => {
      const invalidPayload = {
        ...mockPayload,
        body: {
          ...mockPayload.body,
          status: SituacaoContestacaoEnum.COM_PENDENCIAS,
          wkt: 'POLYGON(...)'
        }
      };
      await expect(
        service.criarParecerPlanoAdequacao(mockIdPropriedade, mockIdAnalise, idPlanoAdequacao, mockAnalistaRequest, invalidPayload)
      ).rejects.toThrow(new BadRequestException('Para indeferir ou colocar a contestação com pendências, os campo wkt não deve ser informado.'));
    });

    it('should successfully create a parecer for INDEFERIDO status', async () => {
      const payloadIndeferido = { ...mockPayload, body: { ...mockPayload.body, status: SituacaoContestacaoEnum.INDEFERIDO, wkt: undefined } };
      mockPlanoAdequacaoRepository.save.mockResolvedValue({ ...mockPlanoAdequacao, situacao: payloadIndeferido.body.status });

      await service.criarParecerPlanoAdequacao(mockIdPropriedade, mockIdAnalise, idPlanoAdequacao, mockAnalistaRequest, payloadIndeferido);

      expect(mockPlanoAdequacaoRepository.save).toHaveBeenCalled();
      expect(mockEmailService.enviarEmailTemplate).toHaveBeenCalled();
    });
  });

  describe('buscarTipoAutorizacaoSupressao', () => {
    it('should return a list of authorization types', async () => {
      const mockTypes = [{ id: 1, nome: 'Tipo 1' }];
      mockTipoAutorizacaoRepository.find.mockResolvedValue(mockTypes);

      const result = await service.buscarTipoAutorizacaoSupressao();

      expect(mockTipoAutorizacaoRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockTypes);
    });
  });

  describe('buscarOrgaoEmissorAutorizacaoSupressao', () => {
    it('should return a list of issuing bodies', async () => {
      const mockBodies = [{ id: 1, nome: 'Orgao 1' }];
      mockOrgaoEmissorRepository.find.mockResolvedValue(mockBodies);

      const result = await service.buscarOrgaoEmissorAutorizacaoSupressao();

      expect(mockOrgaoEmissorRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockBodies);
    });
  });
});