import { Test, TestingModule } from '@nestjs/testing';
import { ElegibilidadeController } from './elegibilidade.controller';
import { ElegibilidadeService } from './elegibilidade.service';
import { CreateElegibilidadeRequestDto } from './dto/create-elegibilidade-request.dto';
import { Response } from 'express';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ConsultaCarQueryDto } from './dto/consulta-car-query-dto';
import { WebhookElegibilidadeDTO } from './dto/webhook-eligibilidade-dto';
import { plainToInstance } from 'class-transformer';
import { ListarEligibilidadeResponse } from './response/listar-eligibilidade-response';

describe('ElegibilidadeController', () => {
  let controller: ElegibilidadeController;
  let service: ElegibilidadeService;

  const mockElegibilidadeService = {
    criarSolicitacao: jest.fn(),
    consultaPropriedadeConsultaCar: jest.fn(),
    listarPaginado: jest.fn(),
    buscarPorId: jest.fn(),
    consultaSolicitacaoElegibilidade: jest.fn(),
    buscarElegidibilidadePorEmail: jest.fn(),
    graficoAcompanhamentoGeral: jest.fn(),
    validarSolicitacao: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElegibilidadeController],
      providers: [
        {
          provide: ElegibilidadeService,
          useValue: mockElegibilidadeService,
        },
      ],
    }).compile();

    controller = module.get<ElegibilidadeController>(ElegibilidadeController);
    service = module.get<ElegibilidadeService>(ElegibilidadeService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /solicitacoes', () => {
    it('should create a solicitacao and return a success message', async () => {
      const createDto: CreateElegibilidadeRequestDto = {
        carFederal: '12345678901234',
        telefone: '(55) 11987654321',
        email: 'email@example.com',
      };

      const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      mockElegibilidadeService.criarSolicitacao.mockResolvedValue(undefined);

      await controller.criarSolicitacao(createDto, mockResponse);

      expect(mockElegibilidadeService.criarSolicitacao).toHaveBeenCalledWith(createDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Solicitação enviada com sucesso!',
        statusCode: 200,
      });
    });

    it('should throw an error if the service fails', async () => {
      const createDto: CreateElegibilidadeRequestDto = {
        carFederal: '12345678901234',
        telefone: '(55) 11987654321',
        email: 'email@example.com',
      };

      const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      mockElegibilidadeService.criarSolicitacao.mockRejectedValue(new BadRequestException('CAR não encontrado'));

      await expect(controller.criarSolicitacao(createDto, mockResponse)).rejects.toThrow(new BadRequestException('CAR não encontrado'));
      expect(mockElegibilidadeService.criarSolicitacao).toHaveBeenCalledWith(createDto);
    });
  });

  describe('GET /listar', () => {
    it('should call listarPaginado and return a paginated response', async () => {
      const page = 1;
      const size = 10;
      const email = 'test@example.com';
      const mockResult = [[{ id: 1, email }], 1];
      const expectedData = plainToInstance(ListarEligibilidadeResponse, mockResult[0], { excludeExtraneousValues: true });

      mockElegibilidadeService.listarPaginado.mockResolvedValue(mockResult);

      const result = await controller.listar(email, undefined, undefined, undefined, undefined, undefined, page, size);

      expect(service.listarPaginado).toHaveBeenCalledWith(email, undefined, undefined, undefined, undefined, undefined, page, size);
      expect(result).toEqual({
        data: expectedData,
        total: mockResult[1],
        page,
        size,
      });
    });
  });

  describe('GET /buscar-por-id/:id', () => {
    it('should call buscarPorId and return the result', async () => {
      const id = 1;
      const mockSolicitacao = { id, email: 'test@example.com' };
      mockElegibilidadeService.buscarPorId.mockResolvedValue(mockSolicitacao);

      const result = await controller.buscarPorId(id);

      expect(service.buscarPorId).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockSolicitacao);
    });
  });

  describe('GET /solicitacoes (by filter)', () => {
    it('should call consultaSolicitacaoElegibilidade with filter', async () => {
      const filtro = { nomePropriedade: 'Fazenda Teste' };
      mockElegibilidadeService.consultaSolicitacaoElegibilidade.mockResolvedValue([]);

      await controller.consultaElegibilidade(filtro);

      expect(service.consultaSolicitacaoElegibilidade).toHaveBeenCalledWith(filtro);
    });
  });

  describe('GET /solicitacoes/:email', () => {
    it('should call buscarElegidibilidadePorEmail with email', async () => {
      const email = 'test@example.com';
      mockElegibilidadeService.buscarElegidibilidadePorEmail.mockResolvedValue([]);
      await controller.buscarUsuarioPorEmail(email);
      expect(service.buscarElegidibilidadePorEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('GET /consulta-car', () => {
    it('should return properties based on CPF, CNPJ, or carEstadual', async () => {
      const query: ConsultaCarQueryDto = { cpf: '12345678901' };
      const propriedadesMock = [{ carEstadual: '12345', nomePropriedade: 'Propriedade Teste' }];

      mockElegibilidadeService.consultaPropriedadeConsultaCar.mockResolvedValue(propriedadesMock);

      const result = await controller.consultaCar(query);

      expect(mockElegibilidadeService.consultaPropriedadeConsultaCar).toHaveBeenCalledWith(query.cpf, query.cnpj, query.carEstadual);
      expect(result).toEqual(propriedadesMock);
    });

    it('should throw BadRequestException when no properties are found', async () => {
      const query: ConsultaCarQueryDto = { cpf: '12345678901' };

      mockElegibilidadeService.consultaPropriedadeConsultaCar.mockRejectedValue(new BadRequestException('Propriedade/Car não encontrado'));

      await expect(controller.consultaCar(query)).rejects.toThrow(new BadRequestException('Propriedade/Car não encontrado'));
    });
  });

  describe('POST /webhook', () => {
    it('should handle the webhook', async () => {
      const webhookDto: WebhookElegibilidadeDTO = { 
        transactionId: 'some-id', 
        areas_desmatamento_total: 0, 
        createdAt: new Date().toISOString(), 
        hasDocuments: false, 
        modulo_fiscal: 0 
      };
      console.log = jest.fn();

      controller.webhook(webhookDto);

      expect(console.log).toHaveBeenCalledWith(webhookDto);
    });
  });

  describe('GET /grafico-acompanhamento-geral', () => {
    it('should call graficoAcompanhamentoGeral with date filters', async () => {
      const dataInicio = '2023-01-01';
      const dataFim = '2023-12-31';
      mockElegibilidadeService.graficoAcompanhamentoGeral.mockResolvedValue({});

      await controller.graficoAcompanhamentoGeral(dataInicio, dataFim);
      expect(service.graficoAcompanhamentoGeral).toHaveBeenCalledWith(dataInicio, dataFim);
    });
  });
});
