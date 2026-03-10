import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ElegibilidadeService } from './elegibilidade.service';
import { SolicitacaoElegibilidade, StatusSolicitacaoEligibilidade } from './entities/solicitacao-elegibilidade.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateElegibilidadeRequestDto } from './dto/create-elegibilidade-request.dto';
import { BadRequestException } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { AgrotoolsService } from '../agrotools/agrotools.service';
import { of } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { PropriedadeConsulta } from './entities/consulta/propriedade-consulta.entity';
import NegocioException from '../exception/negocio-exception';
import { Propriedade } from '../propriedade-prem/entities/propriedade.entity';

describe('ElegibilidadeService', () => {
  let service: ElegibilidadeService;
  let emailService: EmailService;
  let elegibilidadeRequestRepository: Repository<SolicitacaoElegibilidade>;
  let propriedadeConsultaRepository: Repository<PropriedadeConsulta>;

  const mockElegibilidadeRequestRepository = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getManyAndCount: jest.fn()
    }),
  };

  const mockPropriedadeConsultaRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockPropriedadePremRepository = {
    findOne: jest.fn(),
  };

  const mockEmailService = {
    enviarEmailTemplate: jest.fn(),
  };

  const mockAgrotoolsService = {
    consultarElegibilidade: jest.fn(),
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElegibilidadeService,
        {
          provide: getRepositoryToken(SolicitacaoElegibilidade),
          useValue: mockElegibilidadeRequestRepository,
        },
        {
          provide: getRepositoryToken(PropriedadeConsulta),
          useValue: mockPropriedadeConsultaRepository,
        },
        {
          provide: getRepositoryToken(Propriedade),
          useValue: mockPropriedadePremRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: AgrotoolsService,
          useValue: mockAgrotoolsService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<ElegibilidadeService>(ElegibilidadeService);
    emailService = module.get<EmailService>(EmailService);
    elegibilidadeRequestRepository = module.get<Repository<SolicitacaoElegibilidade>>(getRepositoryToken(SolicitacaoElegibilidade));
    propriedadeConsultaRepository = module.get<Repository<PropriedadeConsulta>>(getRepositoryToken(PropriedadeConsulta));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('criarSolicitacao', () => {
    it('should save request if CAR is found and send email', async () => {
      const createDto: CreateElegibilidadeRequestDto = {
        carFederal: '12345678901234',
        telefone: '(55) 11987654321',
        email: 'email@example.com',
      };

      const foundPropriedade = {
        id: 1,
        carFederal: '12345678901234',
        nomePropriedade: "propriedade",
        cidade: {
          nome: "cidade",
          uf: "estado",
        }
      };

      const savedElegibilidade = {
        id: 1,
        ...createDto,
        status: StatusSolicitacaoEligibilidade.Pendente,
        token: "token",
      };

      mockPropriedadePremRepository.findOne.mockResolvedValue(null);
      mockElegibilidadeRequestRepository.createQueryBuilder().getOne.mockResolvedValueOnce(null);
      mockElegibilidadeRequestRepository.createQueryBuilder().getMany.mockResolvedValueOnce([]);

      mockPropriedadeConsultaRepository.findOne.mockResolvedValue(foundPropriedade);
      mockElegibilidadeRequestRepository.save.mockResolvedValue(savedElegibilidade);

      await service.criarSolicitacao(createDto);

      expect(emailService.enviarEmailTemplate).toHaveBeenCalledWith({
        recipients: [createDto.email],
        subject: "Consulta de Eligibilidade",
        template: expect.any(Object), // Check the template object structure
      });

      expect(propriedadeConsultaRepository.findOne).toHaveBeenCalledWith({
        where: { carFederal: '12345678901234' }
      });
      expect(elegibilidadeRequestRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        telefone: '5511987654321',
        email: 'email@example.com',
        status: StatusSolicitacaoEligibilidade.Pendente,
      }));
    });

    it('should throw BadRequestException if a pending request already exists', async () => {
      const createDto: CreateElegibilidadeRequestDto = {
        carFederal: '12345678901234',
        telefone: '(55) 11987654321',
        email: 'email@example.com',
      };

      const foundPropriedade = {
        id: 1,
        carFederal: '12345678901234',
        nomePropriedade: "propriedade",
        cidade: {
          nome: "cidade",
          uf: "estado",
        }
      };

      const existingSolicitacao = {
        id: 2,
        ...createDto,
        confirmacaoEmail: 'NAO',
      };

      mockPropriedadePremRepository.findOne.mockResolvedValue(null);
      mockPropriedadeConsultaRepository.findOne.mockResolvedValue(foundPropriedade);
      mockElegibilidadeRequestRepository.createQueryBuilder().getOne.mockResolvedValueOnce(existingSolicitacao);

      await expect(service.criarSolicitacao(createDto)).rejects.toThrow('Existe solicitação pendente para este email e car, Confirme a solicitação');
    });

    it('should throw BadRequestException if CAR is not found', async () => {
      const createDto: CreateElegibilidadeRequestDto = {
        carFederal: '12345678901234',
        telefone: '(55) 11987654321',
        email: 'email@example.com',
      };

      mockPropriedadePremRepository.findOne.mockResolvedValue(null);
      mockPropriedadeConsultaRepository.findOne.mockResolvedValue(null);

      await expect(service.criarSolicitacao(createDto)).rejects.toThrow(NegocioException);
      expect(propriedadeConsultaRepository.findOne).toHaveBeenCalledWith({
        where: { carFederal: '12345678901234' }
      });
      expect(elegibilidadeRequestRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NegocioException if property is already registered in PREM', async () => {
      const createDto: CreateElegibilidadeRequestDto = {
        carFederal: '12345678901234',
        telefone: '(55) 11987654321',
        email: 'email@example.com',
      };

      mockPropriedadePremRepository.findOne.mockResolvedValue({ id: 1, carFederal: '12345678901234' });

      await expect(service.criarSolicitacao(createDto)).rejects.toThrow(
        new NegocioException(422,'Propriedade já cadastrada. Acesse aplicação ou procure o suporte. ')
      );
    });
  });

  describe('consultaPropriedadeCar', () => {
    it('should return properties when valid CPF, CNPJ, and carEstadual are provided', async () => {
      const cpf = '12345678901';
      const carEstatual = '12345';
      const propriedadesMock = [{ carEstadual: '12345', nomePropriedade: 'Propriedade Teste' }];
      const carMock = { simcarDados: [{ car: '12345', ativo: true, propriedade: 'Propriedade Teste' }] };

      mockHttpService.post.mockReturnValue(of({ data: carMock }));
      mockPropriedadeConsultaRepository.findOneBy.mockResolvedValueOnce(propriedadesMock[0]);

      const result = await service.consultaPropriedadeConsultaCar(cpf, undefined, carEstatual);

      expect(result).toEqual(propriedadesMock);
      expect(mockHttpService.post).toHaveBeenCalled();
      expect(mockPropriedadeConsultaRepository.findOneBy).toHaveBeenCalled();
    });

    it('should throw BadRequestException when no properties are found', async () => {
      const cpf = '12345678901';
      const carEstatual = '12345';

      mockHttpService.post.mockReturnValue(of({ data: { simcarDados: [] } }));
      mockPropriedadeConsultaRepository.findOneBy.mockResolvedValueOnce(null); // No property found

      await expect(service.consultaPropriedadeConsultaCar(cpf, undefined, carEstatual)).rejects.toThrow(BadRequestException);
    });
  });


  describe('listarPaginado', () => {
    it('should return a paginated list of eligibilities', async () => {
      const mockResult = [
        [{
          id: 1,
          email: 'test@example.com',
          carFederal: '12345',
          status: 'APROVADO',
          telefone: '123456789',
          nomePropriedade: 'Propriedade Teste',
          cpfCnpj: '11122233344',
          nomeProdutor: 'Produtor Teste',
        }],
        1
      ];

      mockElegibilidadeRequestRepository.createQueryBuilder = jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue(mockResult),
      });

      const [result, total] = await service.listarPaginado(
        'test@example.com',
        '12345',
        StatusSolicitacaoEligibilidade.Aprovado,
        'Produtor Teste',
        'Propriedade Teste',
        '11122233344',
        0,
        10,
      );

      expect(result).toEqual(mockResult[0]);
      expect(total).toEqual(mockResult[1]);
      expect(mockElegibilidadeRequestRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('buscarPorId', () => {
    it('should return a solicitacao by id', async () => {
      const mockSolicitacao = {
        id: 1,
        nomePropriedade: 'Propriedade Teste',
        telefone: '123456789',
        email: 'test@example.com',
        cpfCnpj: '11122233344',
        carFederal: '12345',
        status: 'APROVADO',
        retornoAgrotools: {
          deteccoes: [
            {
              id: 1,
              nome: 'Detecção Teste',
              descricao: 'Descrição Teste',
            },
          ],
        },
      };

      mockElegibilidadeRequestRepository.findOne.mockResolvedValue(mockSolicitacao);

      const result = await service.buscarPorId(1);

      expect(result).toEqual(expect.objectContaining({
        id: 1,
        nomePropriedade: 'Propriedade Teste',
        telefone: '123456789',
        email: 'test@example.com',
        retornoAgrotools: expect.objectContaining({
          deteccoes: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
            }),
          ]),
        }),
      }));
      expect(mockElegibilidadeRequestRepository.findOne).toHaveBeenCalledWith({
        relations: ['retornoAgrotools', 'retornoAgrotools.deteccoes'],
        where: { id: 1 },
      });
    });
  });
});
