import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { Endereco } from '../endereco/entities/endereco.entity';
import { PaginatedResponseInterface } from '../shared/interfaces/paginated-response.interface';
import { ConsultaResponsavelTecnicoRequest } from './dto/consulta-responsavel-tecnico-request';
import { CriarResponsavelTecnicoRequest } from './dto/criar-responsavel-tecnico-request';
import { ResponsavelTecnicoResponse } from './dto/responsavel-tecnico-response';
import { ResponsavelTecnico } from './entities/responsavel-tecnico.entity';
import { ResponsavelTecnicoController } from './responsavel-tecnico.controller';
import { ResponsavelTecnicoService } from './responsavel-tecnico.service';

jest.mock('./dto/criar-responsavel-tecnico-request', () => ({
  CriarResponsavelTecnicoRequest: class CriarResponsavelTecnicoRequest {},
}));
jest.mock('./dto/responsavel-tecnico-response', () => ({
  ResponsavelTecnicoResponse: class ResponsavelTecnicoResponse {},
}));
jest.mock('./dto/consulta-responsavel-tecnico-request', () => ({
  ConsultaResponsavelTecnicoRequest: class ConsultaResponsavelTecnicoRequest {},
}));
jest.mock('../endereco/entities/endereco.entity', () => ({
  Endereco: class Endereco {},
}));

describe('ResponsavelTecnicoController', () => {
  let controller: ResponsavelTecnicoController;
  let service: ResponsavelTecnicoService;

  const mockResponsavelTecnicoService = {
    criar: jest.fn(),
    consultaResponsavelTecnicoFiltro: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResponsavelTecnicoController],
      providers: [
        {
          provide: ResponsavelTecnicoService,
          useValue: mockResponsavelTecnicoService,
        },
      ],
    }).compile();

    controller = module.get<ResponsavelTecnicoController>(
      ResponsavelTecnicoController,
    );
    service = module.get<ResponsavelTecnicoService>(ResponsavelTecnicoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('cadastrar', () => {
    it('should create a new responsavel tecnico and return it transformed to ResponsavelTecnicoResponse', async () => {
      const createDto: CriarResponsavelTecnicoRequest = {
        nome: 'John Doe',
        cpf: '123.456.789-00',
        email: 'john.doe@example.com',
        profissao: 'Engenheiro Agrônomo',
        registroCrea: '123456',
        telefone: '(11) 99999-9999',
        endereco: {} as Endereco,
      };

      const mockResponsavelTecnico = new ResponsavelTecnico();
      mockResponsavelTecnico.id = 1;
      Object.assign(mockResponsavelTecnico, createDto);

      mockResponsavelTecnicoService.criar.mockResolvedValue(mockResponsavelTecnico);

      const result = await controller.cadastrar(createDto);

      expect(service.criar).toHaveBeenCalledWith(createDto);
      const expectedResponse = plainToInstance(
        ResponsavelTecnicoResponse,
        mockResponsavelTecnico,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('consultar', () => {
    it('should return a paginated list of responsaveis tecnicos', async () => {
      const filtro: ConsultaResponsavelTecnicoRequest = { cpf: '123' };
      const page = 1;
      const size = 5;

      const mockResponsavelTecnico = new ResponsavelTecnico();
      mockResponsavelTecnico.id = 1;
      mockResponsavelTecnico.nome = 'Jane Doe';
      mockResponsavelTecnico.cpf = '98765432100';

      const mockServiceResponse: [ResponsavelTecnico[], number] = [
        [mockResponsavelTecnico],
        1,
      ];
      mockResponsavelTecnicoService.consultaResponsavelTecnicoFiltro.mockResolvedValue(mockServiceResponse);

      const result: PaginatedResponseInterface<ResponsavelTecnicoResponse> =
        await controller.consultar(filtro, page, size);

      expect(service.consultaResponsavelTecnicoFiltro).toHaveBeenCalledWith(
        filtro,
        page,
        size,
      );

      const expectedData = plainToInstance(ResponsavelTecnicoResponse, [
        mockResponsavelTecnico,
      ]);
      expect(result.data).toEqual(expectedData);
      expect(result.total).toBe(1);
      expect(result.page).toBe(page);
      expect(result.size).toBe(size);
    });

    it('should use default values for page and size if not provided', async () => {
      const filtro: ConsultaResponsavelTecnicoRequest = {};

      const mockServiceResponse: [ResponsavelTecnico[], number] = [[], 0];
      mockResponsavelTecnicoService.consultaResponsavelTecnicoFiltro.mockResolvedValue(
        mockServiceResponse,
      );

      await controller.consultar(filtro);

      expect(service.consultaResponsavelTecnicoFiltro).toHaveBeenCalledWith(
        filtro,
        1,
        10,
      );
    });
  });
});