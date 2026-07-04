import { Test, TestingModule } from '@nestjs/testing';
import { PropriedadePremController } from './propriedade-prem.controller';
import { PropriedadePremService } from './propriedade-prem.service';
import { JwtAuthGuard } from '../shared/guards/jwt.guard';
import { DadosBasicosRequest } from './request/dados-basicos-request';
import { ProprietarioProprietarioRequest } from './request/proprietario-proprietario-request';
import { ConsultaPropriedadeRequest } from './dto/consulta-propriedade-request';
import { UploadDocumentosResponse } from './dto/upload-documentos-response';
import { Propriedade } from './entities/propriedade.entity'; // Import necessary entities/DTOs
import { Cidade } from '../elegibilidade/entities/cidade.entity';
import { AtividadePrincipal } from './entities/atividade-principal.entity';
import { CicloProducao } from './entities/ciclo-producao.entity';
import { MensagemResponse } from './response/mensagem-response';
import { UploadDocumentosPropriedadeRequest } from './dto/upload-documentos-propriedade-request';
import { ParametrosArquivo } from '../shared/dto/base-upload-request.dto';
import { AuthenticatedRequest } from '../shared/interfaces/authenticated-request.interface';

import { TypePost, WebhookAssinaturaRequest } from './dto/webhook-assinatura-request';
import { DCSStatus, ValidacaoDCSResponse } from './dto/validacao-dcs-response';
import { Usuario } from '../usuario/entities/usuario.entity';
import { plainToInstance } from 'class-transformer';
const mockJwtAuthGuard = {
  canActivate: jest.fn(() => true),
};

const mockPropriedadePremService = {
  atualizaDadosBasicos: jest.fn(),
  cadastraProprietario: jest.fn(),
  consultaPropriedadeFiltro: jest.fn(),
  consultaPorProprietario: jest.fn(),
  consultaPropriedadePorId: jest.fn(),
  consultaCidadePorNome: jest.fn(),
  listarAtividadePrincipal: jest.fn(),
  listarCicloProducao: jest.fn(),
  uploadDocumentos: jest.fn(),
  deletar: jest.fn(),
  aceitarTermoAdequacao: jest.fn(),
  pegarLinkDocumentoTermoCompromissoAssinado: jest.fn(),
  termoCompromissoAssinado: jest.fn(),
  validarDCS: jest.fn(),
  consultaPropriedadePorIdMultas: jest.fn(),
};

describe('PropriedadePremController', () => {
  let controller: PropriedadePremController;
  let service: PropriedadePremService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropriedadePremController],
      providers: [
        {
          provide: PropriedadePremService,
          useValue: mockPropriedadePremService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<PropriedadePremController>(PropriedadePremController);
    service = module.get<PropriedadePremService>(PropriedadePremService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });


  describe('cadastraEnderecoPropriedade', () => {
    it('should call service.atualizaDadosBasicos and return the result', async () => {
      const idPropriedade = 1;
      const dadosBasicosRequest: DadosBasicosRequest = { /* mock data */ } as DadosBasicosRequest;
      const expectedResult: MensagemResponse = { sucesso: true, message: 'Dados atualizados com sucesso' };
      mockPropriedadePremService.atualizaDadosBasicos.mockResolvedValue(expectedResult);

      const mockRequest = { user: { email: 'test@example.com' } } as AuthenticatedRequest;

      const result = await controller.cadastraEnderecoPropriedade(dadosBasicosRequest, idPropriedade, mockRequest);

      expect(service.atualizaDadosBasicos).toHaveBeenCalledWith(idPropriedade, dadosBasicosRequest, mockRequest);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('cadastrarProprietario', () => {
    it('should call service.cadastraProprietario and return the result', async () => {
      const idPropriedade = 1;
      const proprietarioRequest: ProprietarioProprietarioRequest[] = [/* mock data */] as ProprietarioProprietarioRequest[];
      const expectedResult: MensagemResponse = { sucesso: true, message: 'Dados atualizados com sucesso' };
      mockPropriedadePremService.cadastraProprietario.mockResolvedValue(expectedResult);

      const result = await controller.cadastrarProprietario(proprietarioRequest, idPropriedade);

      expect(service.cadastraProprietario).toHaveBeenCalledWith(idPropriedade, proprietarioRequest);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('consultaElegibilidade', () => {
    it('should call service.consultaPropriedadeFiltro and return the result', async () => {
      const filtro: ConsultaPropriedadeRequest = { carFederal: '123', nomePropriedade: 'Test', codigoMunicipio: 123, statusVoucher: true };
      const request = { user: { email: 'test@example.com', roles: ['ANALISTA'] } } as AuthenticatedRequest;
      const page = 1;
      const size = 10;
      const mockPropriedades: Propriedade[] = [{
        id: 1,
        nomePropriedade: 'Test Prop',
        carFederal: '123',
        proprietarios: [],
        documentos: [],
        retornoAnalises: [],
        territorios: [],
        voucher: '123',
        tamanhoPropriedade: 123,
        statusVoucher: true,
        moduloFiscal: 123,
        cidade: new Cidade,
        termoAdequacaoAceito: false,
        pagamentoMultas: [],
        vouches: [],
        analista: new Usuario()
      }];
      const total = 1;
      mockPropriedadePremService.consultaPropriedadeFiltro.mockResolvedValue([mockPropriedades, total]);

      const result = await controller.consultaElegibilidade(request, filtro, page, size);

      expect(service.consultaPropriedadeFiltro).toHaveBeenCalledWith(filtro, request, page, size);
      expect(result.data[0].id).toEqual(mockPropriedades[0].id);
      expect(result.total).toEqual(total);
      expect(result.page).toEqual(page);
      expect(result.size).toEqual(size);
    });
  });

  describe('consultaPorProprietario', () => {
    it('should call service.consultaPorProprietario and return the result', async () => {
      const email = 'test@example.com';
      const expectedResult: Propriedade[] = [/* mock data */] as Propriedade[];
      mockPropriedadePremService.consultaPorProprietario.mockResolvedValue(expectedResult);

      const result = await controller.consultaPorProprietario(email);

      expect(service.consultaPorProprietario).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('consultaPropriedadePorId', () => {
    it('should call service.consultaPropriedadePorId and return the result', async () => {
      const id = 1;
      const expectedResult: Propriedade = { /* mock data */ } as Propriedade;
      mockPropriedadePremService.consultaPropriedadePorId.mockResolvedValue(expectedResult);
      const mockUser = { email: 'user@test.com', roles: ['PRODUTOR'] };
      const mockRequest = { user: mockUser } as AuthenticatedRequest;

      const result = await controller.consultaPropriedadePorId(id, mockRequest);
      
      expect(service.consultaPropriedadePorId).toHaveBeenCalledWith(id, mockRequest);
      expect(result).toEqual(plainToInstance(Propriedade, expectedResult, { excludeExtraneousValues: true }));
    });
  });

  describe('consultaCidade', () => {
    it('should call service.consultaCidadePorNome and return the result', async () => {
      const nome = 'Test City';
      const expectedResult: Cidade[] = [/* mock data */] as Cidade[];
      mockPropriedadePremService.consultaCidadePorNome.mockResolvedValue(expectedResult);

      const result = await controller.consultaCidade(nome);

      expect(service.consultaCidadePorNome).toHaveBeenCalledWith(nome);
      expect(result).toEqual(expectedResult);
    });

     it('should call service.consultaCidadePorNome without name', async () => {
      const expectedResult: Cidade[] = [/* mock data */] as Cidade[];
      mockPropriedadePremService.consultaCidadePorNome.mockResolvedValue(expectedResult);

      const result = await controller.consultaCidade(undefined); // Test with undefined name

      expect(service.consultaCidadePorNome).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('listarAtividadePrincipal', () => {
    it('should call service.listarAtividadePrincipal and return the result', async () => {
      const expectedResult: AtividadePrincipal[] = [/* mock data */] as AtividadePrincipal[];
      mockPropriedadePremService.listarAtividadePrincipal.mockResolvedValue(expectedResult);

      const result = await controller.listarAtividadePrincipal();

      expect(service.listarAtividadePrincipal).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('listarCicloProducao', () => {
    it('should call service.listarCicloProducao and return the result', async () => {
      const expectedResult: CicloProducao[] = [/* mock data */] as CicloProducao[];
      mockPropriedadePremService.listarCicloProducao.mockResolvedValue(expectedResult);

      const result = await controller.listarCicloProducao();

      expect(service.listarCicloProducao).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('uploadDocumentos', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'files',
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
    const mockUser = { email: 'user@test.com', sub: 1, roles: ['PRODUTOR'] };
    const mockRequest = { user: mockUser } as unknown as AuthenticatedRequest;
    const idPropriedade = 1;
    const mockParametros: ParametrosArquivo[] = [{ nome: 'test.pdf', tipo: 'TEST_TIPO' }];
    const mockArquivos: Express.Multer.File[] = [mockFile];
    const mockBody: UploadDocumentosPropriedadeRequest = {
      parametros: mockParametros,
      arquivos: []
    };
    const mockPayload = { body: mockBody, arquivos: mockArquivos };

    it('should call service.uploadDocumentos and return the result', async () => {
      const files = [mockFile];
      const expectedResult: UploadDocumentosResponse[] = [
        { urlArquivo: 'some-url', nomeArquivo: 'test.pdf', id: 1, tipo: 'TEST_TIPO' }
      ];
      mockPropriedadePremService.uploadDocumentos.mockResolvedValue(expectedResult);

      const result = await controller.uploadDocumentos(idPropriedade, mockPayload, mockRequest);

      expect(service.uploadDocumentos).toHaveBeenCalledWith(idPropriedade, mockUser.email, files, mockBody.parametros);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the service', async () => {
        const files = [mockFile];
        const serviceError = new Error("Service failed");
        mockPropriedadePremService.uploadDocumentos.mockRejectedValue(serviceError);

        await expect(controller.uploadDocumentos(idPropriedade, mockPayload, mockRequest))
            .rejects.toThrow(serviceError);

        expect(service.uploadDocumentos).toHaveBeenCalledWith(idPropriedade, mockUser.email, files, mockBody.parametros);
    });
  });

  describe('deletarPropriedade', () => {
    it('should call service.deletar with the correct id', async () => {
      const id = 1;
      mockPropriedadePremService.deletar.mockResolvedValue(undefined as void);

      await controller.deletarPropriedade(id);

      expect(service.deletar).toHaveBeenCalledWith(id);
    });

    it('should propagate errors from the service', async () => {
      const id = 1;
      const serviceError = new Error("Service failed");
      mockPropriedadePremService.deletar.mockRejectedValue(serviceError);

      await expect(controller.deletarPropriedade(id))
        .rejects.toThrow(serviceError);
    });
  });

  describe('aceitarTermoAdequacao', () => {
    it('should call service.aceitarTermoAdequacao and return the result', async () => {
      const id = 1;
      const expectedResult = { id: 1, termoAdequacaoAceito: true } as Propriedade;
      mockPropriedadePremService.aceitarTermoAdequacao.mockResolvedValue(expectedResult);

      const result = await controller.aceitarTermoAdequacao(id);

      expect(service.aceitarTermoAdequacao).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the service', async () => {
      const id = 1;
      const serviceError = new Error("Service failed");
      mockPropriedadePremService.aceitarTermoAdequacao.mockRejectedValue(serviceError);

      await expect(controller.aceitarTermoAdequacao(id))
        .rejects.toThrow(serviceError);
    });
  });

  describe('consultaPropriedadePorIdMultas', () => {
    it('should call service.consultaPropriedadePorIdMultas and return the result', async () => {
      const id = 1;
      const expectedResult = { id: 1, nomePropriedade: 'Teste' } as Propriedade;
      const mockRequest = { user: { email: 'test@example.com' } } as AuthenticatedRequest;
      mockPropriedadePremService.consultaPropriedadePorIdMultas.mockResolvedValue(expectedResult);

      const result = await controller.consultaPropriedadePorIdMultas(id, mockRequest);

      expect(service.consultaPropriedadePorIdMultas).toHaveBeenCalledWith(id, mockRequest);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('webhookAssinatura', () => {
    it('should call service methods when type_post is DocumentoAssinado', async () => {
      const body: WebhookAssinaturaRequest = {
        uuid: 'test-uuid',
        email: 'test@example.com',
        type_post: TypePost.DocumentoAssinado,
        message: ''
      };

      await controller.webhookAssinatura(body);

      expect(service.pegarLinkDocumentoTermoCompromissoAssinado).toHaveBeenCalledWith(body.uuid);
      expect(service.termoCompromissoAssinado).toHaveBeenCalledWith(body.uuid, body.email);
    });

    it('should not call service methods when type_post is not DocumentoAssinado', async () => {
      const body: WebhookAssinaturaRequest = {
        uuid: 'test-uuid',
        email: 'test@example.com',
        type_post: 'outro_tipo' as TypePost,
        message: ''
      };

      await controller.webhookAssinatura(body);

      expect(service.pegarLinkDocumentoTermoCompromissoAssinado).not.toHaveBeenCalled();
      expect(service.termoCompromissoAssinado).not.toHaveBeenCalled();
    });
  });

  describe('getStatusAutorizacaoComercializacao', () => {
    it('should call service.validarDCS with idPropriedade and return the result', async () => {
      const idPropriedade = 1;
      const expectedResult: ValidacaoDCSResponse = {
        id: idPropriedade,
        status: DCSStatus.Apto,
      } as ValidacaoDCSResponse;
      mockPropriedadePremService.validarDCS.mockResolvedValue(expectedResult);

      const result = await controller.getStatusAutorizacaoComercializacao(idPropriedade, undefined);

      expect(service.validarDCS).toHaveBeenCalledWith(idPropriedade, undefined);
      expect(result).toEqual(expectedResult);
    });

    it('should call service.validarDCS with carFederal and return the result', async () => {
      const carFederal = 'CAR-123';
      const expectedResult: ValidacaoDCSResponse = {
        carFederal,
        status: DCSStatus.Suspenso,
      } as ValidacaoDCSResponse;
      mockPropriedadePremService.validarDCS.mockResolvedValue(expectedResult);

      const result = await controller.getStatusAutorizacaoComercializacao(undefined, carFederal);

      expect(service.validarDCS).toHaveBeenCalledWith(undefined, carFederal);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the service', async () => {
      const idPropriedade = 1;
      const serviceError = new Error('Service failed');
      mockPropriedadePremService.validarDCS.mockRejectedValue(serviceError);

      await expect(controller.getStatusAutorizacaoComercializacao(idPropriedade)).rejects.toThrow(serviceError);
    });
  });
});
