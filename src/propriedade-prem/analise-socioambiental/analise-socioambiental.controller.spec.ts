import { Test, TestingModule } from '@nestjs/testing';
import { AnaliseSocioambientalController } from './analise-socioambiental.controller';
import { AnaliseSocioambientalService } from './analise-socioambiental.service';
import { JwtAuthGuard } from '../../shared/guards/jwt.guard';
import { CriarContestacaoAutorizacaoSupressaoRequest } from './dto/criar-contestacao-autorizacao-supressao-request';
import { CriarContestacaoLaudoRequest } from './dto/criar-contestacao-laudo-request';
import { ContestacaoAutorizacaoSupressao } from './entities/contestacao-autorizacao-supressao.entity';
import { ContestacaoLaudo } from './entities/contestacao-laudo.entity';
import { TipoAutorizacaoSupressao } from './entities/tipo-autorizacao-supressao.entity';
import { OrgaoEmissorAutorizacaoSupressao } from './entities/orgao-emissor-autorizacao-supressao.entity';
import { BadRequestException } from '@nestjs/common';
import { EnviarArquivosContestacaoAutorizacaoSupressaoRequest } from './dto/enviar-arquivos-contestacao-autorizacao-supressao-request';
import { EnviarArquivosContestacaoLaudoRequest } from './dto/enviar-arquivos-contestacao-laudo-request';
import { RetornoAnaliseEntity } from '../../agrotools/entities/retorno-analise.entity';
import { CriarPlanoAdequacaoRequest } from './dto/criar-plano-adequacao-request';
import { PlanoAdequacao } from './entities/plano-adequacao.entity';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { AuthenticatedRequest } from '../../shared/interfaces/authenticated-request.interface';
import { UploadPayloadType } from '../../shared/types/upload-payload.type';
import { CriarParecerContestacaoRequest } from "./dto/criar-parecer-contestacao-request";
import { CriarParecerContestacaoResponse } from "./dto/criar-parecer-contestacao-response";
import { SituacaoContestacaoEnum } from './enum/situacao-contestacao.enum';

const mockAnaliseSocioambientalService = {
  criarContestacaoAutorizacaoSupressao: jest.fn(),
  criarContestacaoLaudo: jest.fn(),
  buscarTipoAutorizacaoSupressao: jest.fn(),
  buscarOrgaoEmissorAutorizacaoSupressao: jest.fn(),
  enviarArquivosContestacaoAutorizacaoSupressao: jest.fn(),
  enviarArquivosContestacaoLaudo: jest.fn(),
  buscarAnaliseSocioambiental: jest.fn(),
  criarPlanoAdequacao: jest.fn(),
  criarParecerContestacao: jest.fn(),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

const mockRolesGuard = {
  canActivate: jest.fn(() => true),
};

describe('AnaliseSocioambientalController', () => {
  let controller: AnaliseSocioambientalController;
  let service: AnaliseSocioambientalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnaliseSocioambientalController],
      providers: [
        {
          provide: AnaliseSocioambientalService,
          useValue: mockAnaliseSocioambientalService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<AnaliseSocioambientalController>(
      AnaliseSocioambientalController,
    );
    service = module.get<AnaliseSocioambientalService>(
      AnaliseSocioambientalService,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

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

  const mockUser = { email: 'user@test.com', roles: ['PRODUTOR'] };
  const mockRequest = { user: mockUser } as AuthenticatedRequest;
  const idPropriedade = 1;
  const idAnalise = 1;
  const idContestacao = 1;

  // Atualizando mock do body para incluir a lista de autorizações supressões
  const mockBodyAutorizacaoSupressaoRequest: CriarContestacaoAutorizacaoSupressaoRequest = {
    autorizacoesSupressoes: [
      {
        idTipo: 1,
        idOrgaoEmissor: 1,
        areaAutorizadaParaSupressaoHa: 123,
        dataEmissao: new Date().toDateString(),
        dataValidade: new Date().toDateString(),
        nomeArquivo: 'autorizacao.pdf',
      },
    ],
    idResponsavelTecnico: 1,
    motivo: 'Test contestation',
    parametros: [{ nome: 'test.pdf', tipo: 'TIPO_TESTE' }],
    arquivos: [mockFile],
  };

  const mockBodyContestacaoLaudoRequest: CriarContestacaoLaudoRequest = {
    motivo: '456',
    idResponsavelTecnico: 1,
    parametros: [{ nome: 'test.pdf', tipo: 'LAUDO' }],
    arquivos: [mockFile]
  };

  const mockBodyCriarPlanoAdequacaoRequest: CriarPlanoAdequacaoRequest = {
    idResponsavelTecnico: 1,
    motivo: "123",
    parametros: [{ nome: 'plano.pdf', tipo: 'PLANO_ADEQUACAO' }],
    arquivos: [mockFile]
  };

  describe('cadastrarContestacaoAutorizacaoSupressao', () => {
    it('should call service to create contestation and return the result', async () => {
      // Criação de um mock payload que corresponde ao novo formato
      const mockPayload: UploadPayloadType<CriarContestacaoAutorizacaoSupressaoRequest> = {
        body: {
          ...mockBodyAutorizacaoSupressaoRequest,
          autorizacoesSupressoes: [
            {
              idTipo: 1,
              idOrgaoEmissor: 1,
              areaAutorizadaParaSupressaoHa: 123,
              dataEmissao: new Date('2023-01-01').toDateString(),
              dataValidade: new Date('2024-01-01').toDateString(),
              nomeArquivo: 'autorizacao.pdf',
            }
          ],
          parametros: [],
          motivo: 'Motivo de teste',
          idResponsavelTecnico: 1
        },
        arquivos: [
          { ...mockFile, originalname: 'autorizacao.pdf' },
          { ...mockFile, originalname: 'outro-doc.pdf' }
        ],
      };
      const expectedResult = new ContestacaoAutorizacaoSupressao();
      mockAnaliseSocioambientalService.criarContestacaoAutorizacaoSupressao.mockResolvedValue(expectedResult);

      const result = await controller.cadastrarContestacaoAutorizacaoSupressao(
        mockPayload,
        idPropriedade,
        idAnalise,
        mockRequest,
      );

      expect(service.criarContestacaoAutorizacaoSupressao).toHaveBeenCalledWith(
        idPropriedade,
        idAnalise,
        mockRequest,
        mockPayload,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the service', async () => {
      const mockPayload: UploadPayloadType<CriarContestacaoAutorizacaoSupressaoRequest> = {
        body: mockBodyAutorizacaoSupressaoRequest,
        arquivos: [mockFile],
      };
      const error = new BadRequestException('Service error');
      mockAnaliseSocioambientalService.criarContestacaoAutorizacaoSupressao.mockRejectedValue(error);

      await expect(controller.cadastrarContestacaoAutorizacaoSupressao(
        mockPayload,
        idPropriedade,
        idAnalise,
        mockRequest,
      )).rejects.toThrow(BadRequestException);
    });
  });

  describe('cadastarContestacaoLaudo', () => {
    it('should call service to create laudo contestation and return the result', async () => {
      const mockPayload: UploadPayloadType<CriarContestacaoLaudoRequest> = {
        body: mockBodyContestacaoLaudoRequest,
        arquivos: [mockFile],
      };
      const expectedResult = new ContestacaoLaudo();
      mockAnaliseSocioambientalService.criarContestacaoLaudo.mockResolvedValue(expectedResult);

      const result = await controller.cadastarContestacaoLaudo(
        mockPayload,
        idPropriedade,
        idAnalise,
        mockRequest,
      );

      expect(service.criarContestacaoLaudo).toHaveBeenCalledWith(
        idPropriedade,
        idAnalise,
        mockRequest,
        mockPayload,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the service', async () => {
      const mockPayload: UploadPayloadType<CriarContestacaoLaudoRequest> = {
        body: mockBodyContestacaoLaudoRequest,
        arquivos: [mockFile],
      };
      const error = new Error('Service failed');
      mockAnaliseSocioambientalService.criarContestacaoLaudo.mockRejectedValue(error);

      await expect(controller.cadastarContestacaoLaudo(
        mockPayload,
        idPropriedade,
        idAnalise,
        mockRequest,
      )).rejects.toThrow(error);
    });
  });

  describe('buscarTiposContestacaoAutorizacaoSupressao', () => {
    it('should call service to get contestation types and return the result', async () => {
      const expectedResult: TipoAutorizacaoSupressao[] = [new TipoAutorizacaoSupressao()];
      mockAnaliseSocioambientalService.buscarTipoAutorizacaoSupressao.mockResolvedValue(expectedResult);

      const result = await controller.buscarTiposContestacaoAutorizacaoSupressao();

      expect(service.buscarTipoAutorizacaoSupressao).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('buscarOrgaosEmissoresAutorizacaoSupressao', () => {
    it('should call service to get emitting organs and return the result', async () => {
      const expectedResult: OrgaoEmissorAutorizacaoSupressao[] = [new OrgaoEmissorAutorizacaoSupressao()];
      mockAnaliseSocioambientalService.buscarOrgaoEmissorAutorizacaoSupressao.mockResolvedValue(expectedResult);

      const result = await controller.buscarOrgaosEmissoresAutorizacaoSupressao();

      expect(service.buscarOrgaoEmissorAutorizacaoSupressao).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('buscarAnaliseSocioambiental', () => {
    it('should call service to get socio-environmental analysis and return the result', async () => {
      const expectedResult = new RetornoAnaliseEntity();
      mockAnaliseSocioambientalService.buscarAnaliseSocioambiental.mockResolvedValue(expectedResult);

      const result = await controller.buscarAnaliseSocioambiental(idPropriedade, idAnalise, mockRequest);

      expect(service.buscarAnaliseSocioambiental).toHaveBeenCalledWith(
        idPropriedade,
        idAnalise,
        mockRequest,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the service', async () => {
      const error = new BadRequestException('Analysis not found');
      mockAnaliseSocioambientalService.buscarAnaliseSocioambiental.mockRejectedValue(error);

      await expect(controller.buscarAnaliseSocioambiental(
        idPropriedade,
        idAnalise,
        mockRequest,
      )).rejects.toThrow(BadRequestException);
    });
  });

  describe('enviarArquivosContestacaoAutorizacaoSupressao', () => {
    const mockBodyRequest: EnviarArquivosContestacaoAutorizacaoSupressaoRequest = {
      parametros: [{ nome: 'new-file.pdf', tipo: 'NOVO_DOC' }],
      arquivos: [mockFile]
    };

    it('should call service to send files to authorization contestation and return the result', async () => {
      const mockPayload: UploadPayloadType<EnviarArquivosContestacaoAutorizacaoSupressaoRequest> = {
        body: mockBodyRequest,
        arquivos: [mockFile],
      };
      const expectedResult = new ContestacaoAutorizacaoSupressao();
      mockAnaliseSocioambientalService.enviarArquivosContestacaoAutorizacaoSupressao.mockResolvedValue(expectedResult);

      const result = await controller.enviarArquivosContestacaoAutorizacaoSupressao(
        mockPayload,
        idPropriedade,
        idAnalise,
        idContestacao,
        mockRequest,
      );

      expect(service.enviarArquivosContestacaoAutorizacaoSupressao).toHaveBeenCalledWith(
        idPropriedade,
        idAnalise,
        idContestacao,
        mockRequest,
        mockPayload,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the service', async () => {
      const mockPayload: UploadPayloadType<EnviarArquivosContestacaoAutorizacaoSupressaoRequest> = {
        body: mockBodyRequest,
        arquivos: [mockFile],
      };
      const error = new BadRequestException('Failed to send files');
      mockAnaliseSocioambientalService.enviarArquivosContestacaoAutorizacaoSupressao.mockRejectedValue(error);

      await expect(controller.enviarArquivosContestacaoAutorizacaoSupressao(
        mockPayload,
        idPropriedade,
        idAnalise,
        idContestacao,
        mockRequest,
      )).rejects.toThrow(BadRequestException);
    });
  });

  describe('enviarArquivosLaudo', () => {
    const mockBodyRequest: EnviarArquivosContestacaoLaudoRequest = {
      parametros: [{ nome: 'another-file.pdf', tipo: 'NOVO_LAUDO_DOC' }],
      arquivos: [mockFile]
    };

    it('should call service to send files to laudo contestation and return the result', async () => {
      const mockPayload: UploadPayloadType<EnviarArquivosContestacaoLaudoRequest> = {
        body: mockBodyRequest,
        arquivos: [mockFile],
      };
      const expectedResult = new ContestacaoLaudo();
      mockAnaliseSocioambientalService.enviarArquivosContestacaoLaudo.mockResolvedValue(expectedResult);

      const result = await controller.enviarArquivosLaudo(
        mockPayload,
        idPropriedade,
        idAnalise,
        idContestacao,
        mockRequest,
      );

      expect(service.enviarArquivosContestacaoLaudo).toHaveBeenCalledWith(
        idPropriedade,
        idAnalise,
        idContestacao,
        mockRequest,
        mockPayload,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the service', async () => {
      const mockPayload: UploadPayloadType<EnviarArquivosContestacaoLaudoRequest> = {
        body: mockBodyRequest,
        arquivos: [mockFile],
      };
      const error = new BadRequestException('Failed to send laudo files');
      mockAnaliseSocioambientalService.enviarArquivosContestacaoLaudo.mockRejectedValue(error);

      await expect(controller.enviarArquivosLaudo(
        mockPayload,
        idPropriedade,
        idAnalise,
        idContestacao,
        mockRequest,
      )).rejects.toThrow(BadRequestException);
    });
  });

  describe('criarPlanoAdequacao', () => {
    it('should call service to create adequacy plan and return the result', async () => {
      const mockPayload: UploadPayloadType<CriarPlanoAdequacaoRequest> = {
        body: mockBodyCriarPlanoAdequacaoRequest,
        arquivos: [mockFile],
      };
      const expectedResult = new PlanoAdequacao();
      mockAnaliseSocioambientalService.criarPlanoAdequacao.mockResolvedValue(expectedResult);

      const result = await controller.cadastrarPlanoAdequacao(
        mockPayload,
        idPropriedade,
        idAnalise,
        mockRequest,
      );

      expect(service.criarPlanoAdequacao).toHaveBeenCalledWith(
        idPropriedade,
        idAnalise,
        mockRequest,
        mockPayload,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should propagate BadRequestException when adequacy plan already exists', async () => {
      const mockPayload: UploadPayloadType<CriarPlanoAdequacaoRequest> = {
        body: mockBodyCriarPlanoAdequacaoRequest,
        arquivos: [mockFile],
      };
      const error = new BadRequestException('Já existe um plano de adequação para esta análise.');
      mockAnaliseSocioambientalService.criarPlanoAdequacao.mockRejectedValue(error);

      await expect(controller.cadastrarPlanoAdequacao(
        mockPayload,
        idPropriedade,
        idAnalise,
        mockRequest,
      )).rejects.toThrow(BadRequestException);
    });

    it('should propagate BadRequestException when responsible technician is not found', async () => {
      const mockPayload: UploadPayloadType<CriarPlanoAdequacaoRequest> = {
        body: { ...mockBodyCriarPlanoAdequacaoRequest, idResponsavelTecnico: 999 },
        arquivos: [mockFile],
      };
      const error = new BadRequestException('Responsável Técnico não encontrado.');
      mockAnaliseSocioambientalService.criarPlanoAdequacao.mockRejectedValue(error);

      await expect(controller.cadastrarPlanoAdequacao(
        mockPayload,
        idPropriedade,
        idAnalise,
        mockRequest,
      )).rejects.toThrow(BadRequestException);
    });

    it('should propagate other errors from the service', async () => {
      const mockPayload: UploadPayloadType<CriarPlanoAdequacaoRequest> = {
        body: mockBodyCriarPlanoAdequacaoRequest,
        arquivos: [mockFile],
      };
      const error = new Error('Generic service error');
      mockAnaliseSocioambientalService.criarPlanoAdequacao.mockRejectedValue(error);

      await expect(controller.cadastrarPlanoAdequacao(
        mockPayload,
        idPropriedade,
        idAnalise,
        mockRequest,
      )).rejects.toThrow(error);
    });
  });

  describe('cadastrarParecerContestacao', () => {
    const mockParecerContestacaoRequest: CriarParecerContestacaoRequest = {
      status: SituacaoContestacaoEnum.DEFERIDO,
      poligonos: [{ idTad: 1, areaARegenerar: 10, poligono: '', tipo: 'Contestação por laudo', wkt: '' }],
      valorMulta: 5,
      parametros: [{ nome: 'parecer.pdf', tipo: 'PARECER' }],
      arquivos: []
    };

    const mockPayload: UploadPayloadType<CriarParecerContestacaoRequest> = {
      body: mockParecerContestacaoRequest,
      arquivos: [mockFile],
    };

    const mockResponse: CriarParecerContestacaoResponse = {
      id: 1
    };

    it('should call service to create parecer and return the result', async () => {
      mockAnaliseSocioambientalService.criarParecerContestacao.mockResolvedValue(mockResponse);

      const result = await controller.cadastrarParecerContestacao(
        mockPayload,
        idPropriedade,
        idAnalise,
        mockRequest,
      );

      expect(service.criarParecerContestacao).toHaveBeenCalledWith(
        idPropriedade,
        idAnalise,
        mockRequest,
        mockPayload,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should propagate BadRequestException from the service', async () => {
      const error = new BadRequestException('Não é possível criar um parecer para uma contestação que não esteja em análise ou com pendências.');
      mockAnaliseSocioambientalService.criarParecerContestacao.mockRejectedValue(error);

      await expect(controller.cadastrarParecerContestacao(
        mockPayload,
        idPropriedade,
        idAnalise,
        mockRequest,
      )).rejects.toThrow(BadRequestException);
    });

    it('should propagate other errors from the service', async () => {
      const error = new Error('Generic service error');
      mockAnaliseSocioambientalService.criarParecerContestacao.mockRejectedValue(error);

      await expect(controller.cadastrarParecerContestacao(
        mockPayload,
        idPropriedade,
        idAnalise,
        mockRequest,
      )).rejects.toThrow(error);
    });
  });
});