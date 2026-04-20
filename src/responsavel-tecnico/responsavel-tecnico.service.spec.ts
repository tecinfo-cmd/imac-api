import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Endereco } from '../endereco/entities/endereco.entity';
import { Repository } from 'typeorm';
import { ConsultaResponsavelTecnicoRequest } from './dto/consulta-responsavel-tecnico-request';
import { CriarResponsavelTecnicoRequest } from './dto/criar-responsavel-tecnico-request';
import { ResponsavelTecnico } from './entities/responsavel-tecnico.entity';
import { ResponsavelTecnicoService } from './responsavel-tecnico.service';

describe('ResponsavelTecnicoService', () => {
  let service: ResponsavelTecnicoService;
  let repository: Repository<ResponsavelTecnico>;

  const mockResponsavelTecnicoRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponsavelTecnicoService,
        {
          provide: getRepositoryToken(ResponsavelTecnico),
          useValue: mockResponsavelTecnicoRepository,
        },
      ],
    }).compile();

    service = module.get<ResponsavelTecnicoService>(ResponsavelTecnicoService);
    repository = module.get<Repository<ResponsavelTecnico>>(
      getRepositoryToken(ResponsavelTecnico),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('criar', () => {
    it('should create a new responsavel tecnico successfully', async () => {
      const createDto: CriarResponsavelTecnicoRequest = {
        nome: 'John Doe',
        cpf: '123.456.789-00',
        email: 'john.doe@example.com',
        profissao: 'Engenheiro',
        registroCrea: '12345',
        telefone: '11999999999',
        endereco: {} as Endereco,
      };

      const expectedResult = { id: 1, ...createDto } as ResponsavelTecnico;

      mockResponsavelTecnicoRepository.findOneBy.mockResolvedValue(null);
      mockResponsavelTecnicoRepository.save.mockResolvedValue(expectedResult);

      const result = await service.criar(createDto);

      expect(repository.findOneBy).toHaveBeenCalledWith([
        { cpf: createDto.cpf },
        { email: createDto.email },
      ]);
      expect(repository.save).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException if responsavel tecnico already exists', async () => {
      const createDto: CriarResponsavelTecnicoRequest = {
        nome: 'Jane Doe',
        cpf: '009.876.543-21',
        email: 'jane.doe@example.com',
        profissao: 'Arquiteta',
        registroCrea: '54321',
        telefone: '11888888888',
        endereco: {} as Endereco,
      };

      const existingResponsavel = { id: 2, ...createDto };

      mockResponsavelTecnicoRepository.findOneBy.mockResolvedValue(
        existingResponsavel,
      );

      await expect(service.criar(createDto)).rejects.toThrow(
        new BadRequestException('Responsável Técnico já cadastrado'),
      );
      expect(repository.findOneBy).toHaveBeenCalledWith([
        { cpf: createDto.cpf },
        { email: createDto.email },
      ]);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('consultaResponsavelTecnicoFiltro', () => {
    const mockQueryBuilder = {
      orderBy: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getMany: jest.fn(),
    };

    beforeEach(() => {
      mockResponsavelTecnicoRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );
    });
    afterEach(() => jest.clearAllMocks());

    it('should return a paginated list with cpf filter', async () => {
      const filtro: ConsultaResponsavelTecnicoRequest = { cpf: '123' };
      const page = 1;
      const size = 5;
      const expectedResult: [ResponsavelTecnico[], number] = [[], 0];

      mockQueryBuilder.getManyAndCount.mockResolvedValue(expectedResult);

      const result = await service.consultaResponsavelTecnicoFiltro(
        filtro,
        page,
        size,
      );

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('rt.nome', 'ASC');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'rt.endereco',
        'endereco',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(rt.cpf) LIKE :cpf',
        { cpf: `%${filtro.cpf}%` },
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith((page - 1) * size);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(size);
      expect(result).toEqual(expectedResult);
    });

    it('should apply all filters when provided', async () => {
      const filtro: ConsultaResponsavelTecnicoRequest = {
        cpf: '123',
        email: 'test@test.com',
        municipio: 'rio branco',
        profissao: 'engenheiro',
      };
      const page = 1;
      const size = 10;
      const expectedResult: [ResponsavelTecnico[], number] = [[], 0];

      mockQueryBuilder.getManyAndCount.mockResolvedValue(expectedResult);

      const result = await service.consultaResponsavelTecnicoFiltro(
        filtro,
        page,
        size,
      );

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('rt.nome', 'ASC');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'rt.endereco',
        'endereco',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(rt.cpf) LIKE :cpf',
        { cpf: `%${filtro.cpf}%` },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(rt.email) LIKE :email',
        { email: `%${filtro.email?.toLowerCase()}%` },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(endereco.municipio) LIKE :municipio',
        { municipio: `%${filtro.municipio?.toLowerCase()}%` },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(rt.profissao) LIKE :profissao',
        { profissao: `%${filtro.profissao?.toLowerCase()}%` },
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith((page - 1) * size);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(size);
      expect(result).toEqual(expectedResult);
    });

    it('should handle query with no filters', async () => {
      const filtro: ConsultaResponsavelTecnicoRequest = {};
      const page = 2;
      const size = 20;
      const expectedResult: [ResponsavelTecnico[], number] = [[], 0];

      mockQueryBuilder.getManyAndCount.mockResolvedValue(expectedResult);

      const result = await service.consultaResponsavelTecnicoFiltro(
        filtro,
        page,
        size,
      );

      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const filtro: ConsultaResponsavelTecnicoRequest = {};
      const errorMessage = 'Database connection error';
      mockQueryBuilder.getManyAndCount.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(service.consultaResponsavelTecnicoFiltro(filtro)).rejects.toThrow(
        new InternalServerErrorException(errorMessage),
      );
    });
  });
});