import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';import { EntityManager, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Cargo } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Pessoa } from '../shared/entity/pessoa.entity';
import { plainToInstance } from 'class-transformer';
import { ListarUsuarioResponse } from './response/listar-usuario-response';
import { UsuarioTipo } from './enums/usuario-tipo';
import { PessoaService } from '../shared/service/pessoa.service';
import { TokenPrimeiroAcesso } from '../auth/entities/token-primeiro-acesso.entity';
import { EmailService } from '../email/email.service';
import NegocioException from '../exception/negocio-exception';
import { AgrotoolsService } from '../agrotools/agrotools.service';
import { UsuarioRequest } from './request/usuario-request.dto';
import { StatusUsuario } from './enums/usuario-status';
import { Propriedade } from '../propriedade-prem/entities/propriedade.entity';
import { Frigorifico } from '../frigorico/entities/frigorifico.entity';
import { UsuarioResponse } from './response/usuario-response';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let usuarioRepository: Repository<Usuario>;
  let pessoaServiceMock;
  let tokenPrimeiroAcessoRepositoryMock;
  let emailServiceMock;
  let agrotoolsServiceMock;
  let propriedadeRepository: Repository<Propriedade>;
  let entityManager: EntityManager;

  const mockUsuario: Usuario = {
    id: 1,
    email: 'test@example.com',
    cargo: Cargo.ANALISTA,
    pessoa: new Pessoa(),
    tokensRedefinicaoSenha: [],
    senha: '',
    confirmacaoSenha: '',
    aceitouTermos: false,
    dataCriacao: '',
    dataAtualizacao: '',
    cep: '',
    numero: '',
    logradouro: '',
    rgie: '',
    profissao: '',
    roles: [],
    idFrigorifico: 0,
    frigorifico: new Frigorifico(),
    usuarioAnalista: '',
    quantidadePropriedade: 0,
    tipo: UsuarioTipo.PF,
    status: StatusUsuario.ATIVO,
  };

  const mockUsuarios = [mockUsuario];

  const mockUsuarioRequest: UsuarioRequest = {
    email: 'test@example.com',
    nome: 'Test User',
    cpf: '123.456.789-00',
    tipo: UsuarioTipo.PF,
    rgie: '',
    profissao: '',
    roles: [],
    telefone: '',
  };

  const mockUpdateUsuarioDto: UpdateUsuarioDto = {
    roles: [],
    telefone: '111',
    tipo: UsuarioTipo.PF,
    profissao: 'profissão-mock',
    status: StatusUsuario.ATIVO,
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(mockUsuarios),
    getManyAndCount: jest.fn().mockResolvedValue([mockUsuarios, 1]),
    query: jest.fn(),
  };

  pessoaServiceMock = {
    buscaPessoaEmailCadastro: jest.fn(),
    salvaPessoa: jest.fn(),
    atualizarPessoa: jest.fn(),
    buscaPessoaEmail: jest.fn()
  };

  tokenPrimeiroAcessoRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  emailServiceMock = {
    enviarEmailTemplate: jest.fn(),
  };

  agrotoolsServiceMock = {
    consultarUsuarioCadastrado: jest.fn(),
    cadastrarUsuario: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        PessoaService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            create: jest.fn().mockReturnValue(mockUsuario),
            save: jest.fn().mockResolvedValue(mockUsuario),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder)
          },
        },
        {
          provide: getRepositoryToken(Propriedade),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: PessoaService,
          useValue: pessoaServiceMock,
        },
        {
          provide: getRepositoryToken(TokenPrimeiroAcesso),
          useValue: tokenPrimeiroAcessoRepositoryMock,
        },
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
        {
          provide: AgrotoolsService,
          useValue: agrotoolsServiceMock,
        },
        {
          provide: EntityManager,
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    usuarioRepository = module.get<Repository<Usuario>>(
      getRepositoryToken(Usuario),
    );
    propriedadeRepository = module.get<Repository<Propriedade>>(getRepositoryToken(Propriedade));
    entityManager = module.get<EntityManager>(EntityManager);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('criarUsuario', () => {
    it('should create a new user', async () => {
      const mockPessoa = { id: 1, nome: 'Test User' } as Pessoa;
      jest.spyOn(service, 'validaEmailExistente').mockResolvedValue(undefined);
      pessoaServiceMock.buscaPessoaEmailCadastro.mockResolvedValue(null);
      pessoaServiceMock.salvaPessoa.mockResolvedValue(mockPessoa);
      (usuarioRepository.create as jest.Mock).mockReturnValue(mockUsuario);
      (usuarioRepository.save as jest.Mock).mockResolvedValue(mockUsuario);

      const result = await service.criarUsuario(mockUsuarioRequest);

      expect(service.validaEmailExistente).toHaveBeenCalledWith(mockUsuarioRequest.email);
      expect(pessoaServiceMock.salvaPessoa).toHaveBeenCalled();
      expect(usuarioRepository.create).toHaveBeenCalled();
      expect(usuarioRepository.save).toHaveBeenCalledWith(mockUsuario);
      expect(tokenPrimeiroAcessoRepositoryMock.save).toHaveBeenCalled();
      expect(emailServiceMock.enviarEmailTemplate).toHaveBeenCalled();
      //need to mock the response here
      expect(result).toEqual(plainToInstance(UsuarioResponse, mockUsuario));
    });

    it('should throw NegocioException if email already exists', async () => {
      jest.spyOn(service, 'validaEmailExistente').mockRejectedValue(new NegocioException(422, 'Email já cadastrado'));

      await expect(service.criarUsuario(mockUsuarioRequest)).rejects.toThrow(
        NegocioException,
      );
    });
  });

  describe('buscaUsuarioPorEmail', () => {
    it('should return a user by email', async () => {
      usuarioRepository.findOne = jest.fn().mockResolvedValue(mockUsuario);

      const result = await service.buscaUSuarioPorEmail('test@example.com');

      expect(usuarioRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['pessoa'],
      });
      expect(result).toEqual(plainToInstance(Usuario, mockUsuario));
    });

    it('should throw NotFoundException if user is not found', async () => {
      usuarioRepository.findOne = jest.fn().mockResolvedValue(undefined);

      await expect(
        service.buscaUSuarioPorEmail('test@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('buscarUsuarioPorEmail', () => {
    it('should return a user by email', async () => {
      usuarioRepository.findOne = jest.fn().mockResolvedValue(mockUsuario);

      const result = await service.buscarUsuarioPorEmail('test@example.com');

      expect(usuarioRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['pessoa', 'roles', 'frigorifico'],
      });
      expect(result).toEqual(mockUsuario);
    });

    it('should throw NotFoundException if user is not found', async () => {
      usuarioRepository.findOne = jest.fn().mockResolvedValue(undefined);

      await expect(
        service.buscarUsuarioPorEmail('test@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('buscarUsuarioPorId', () => {
    it('should return a user by id', async () => {
      usuarioRepository.findOne = jest.fn().mockResolvedValue(mockUsuario);

      const result = await service.buscarUsuarioPorId(1);

      expect(usuarioRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['pessoa'] });
      expect(result).toEqual(mockUsuario);
    });

    it('should throw NotFoundException if user is not found', async () => {
      usuarioRepository.findOne = jest.fn().mockResolvedValue(undefined);

      await expect(service.buscarUsuarioPorId(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listar', () => {
    it('should return a list of users', async () => {
      const result = await service.listar();

      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(mockUsuarios);
    });

    it('should filter users by email', async () => {
      await service.listar('test@example.com');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'usuario.email LIKE :email',
        { email: '%test@example.com%' },
      );
    });

    it('should filter users by name', async () => {
      await service.listar(undefined, 'Test User');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'pessoa.nome LIKE :nome',
        { nome: '%Test User%' },
      );
    });
  });

  describe("listarPaginado", () => {
    it('should return a paginated list of users', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockUsuarios, 1]);
      jest.spyOn(service, 'consultaQuantidadePropriedade').mockResolvedValue([]);
      const result = await service.listarPaginado();

      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      const expectedData = plainToInstance(ListarUsuarioResponse, mockUsuarios, { excludeExtraneousValues: true });
      expect(result.data).toEqual(expectedData);
      expect(result.total).toEqual(1);
    });

    it('should filter paginated users by email', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockUsuarios, 1]);
      //need to mock consultaQuantidadePropriedade
      jest.spyOn(service, 'consultaQuantidadePropriedade').mockResolvedValue([]);
      
      await service.listarPaginado('test@example.com');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(usuario.email) LIKE :email',
        { email: '%test@example.com%' },
      );
    });

    it('should filter paginated users by name', async () => {
      jest.spyOn(service, 'consultaQuantidadePropriedade').mockResolvedValue([]);
      await service.listarPaginado(undefined, 'Test User');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(unaccent(pessoa.nome)) LIKE :nome',
        { nome: '%Test User%' },
      );
    });
  });


  describe('atualizarUsuario', () => {
    it('should update a user', async () => {
      const mockPessoa = { id: 1, nome: 'Old Name', telefone: '111' } as Pessoa;
      const mockUsuarioComPessoa = { ...mockUsuario, pessoa: mockPessoa, email: 'test@example.com' };
      (usuarioRepository.findOne as jest.Mock).mockResolvedValue(mockUsuarioComPessoa);
      pessoaServiceMock.buscaPessoaEmail.mockResolvedValue({ ...mockPessoa, telefone: mockUpdateUsuarioDto.telefone });

      const result = await service.atualizarUsuario(1, mockUpdateUsuarioDto);

      expect(usuarioRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['pessoa'] });
      expect(pessoaServiceMock.atualizarPessoa).toHaveBeenCalledWith({ ...mockPessoa, telefone: mockUpdateUsuarioDto.telefone });
      expect(usuarioRepository.save).toHaveBeenCalledWith({
        ...mockUsuarioComPessoa,
        pessoa: mockPessoa,
        profissao: mockUpdateUsuarioDto.profissao,
        roles: mockUpdateUsuarioDto.roles,
        tipo: mockUpdateUsuarioDto.tipo,
        status: mockUpdateUsuarioDto.status,
        erroIntegracao: ''
      });
      expect(result.profissao).toBe(mockUpdateUsuarioDto.profissao);
    });

    it('should throw NotFoundException if user is not found', async () => {
      (usuarioRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.atualizarUsuario(1, mockUpdateUsuarioDto),
      ).rejects.toThrow(NotFoundException);
      expect(usuarioRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['pessoa']
      });
    });
  });

  describe('deletarUsuario', () => {
    it('should delete a user', async () => {
      usuarioRepository.findOne = jest.fn().mockResolvedValue(mockUsuario);

      const result = await service.deletarUsuario(1);

      expect(usuarioRepository.save).toHaveBeenCalledWith({
        ...mockUsuario,
        status: StatusUsuario.INATIVO,
      });
      expect(result).toEqual(mockUsuario);
    });

    it('should throw NotFoundException if user is not found', async () => {
      usuarioRepository.findOne = jest.fn().mockResolvedValue(undefined);

      await expect(service.deletarUsuario(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('redistribuirPropriedadeAnalista', () => {
    it('should redistribute properties from an inactive analyst', async () => {
      const inactiveAnalyst = { id: 1, status: StatusUsuario.INATIVO } as Usuario;
      const activeAnalyst = { id: 2, status: StatusUsuario.ATIVO } as Usuario;
      const properties = [{ id: 101, analista: inactiveAnalyst }] as Propriedade[];

      (usuarioRepository.findOneBy as jest.Mock).mockResolvedValue(inactiveAnalyst);
      (propriedadeRepository.find as jest.Mock).mockResolvedValue(properties);
      jest.spyOn(service, 'consultaAnalista').mockResolvedValue([{ id: 2 }] as any);
      (usuarioRepository.findOneBy as jest.Mock).mockResolvedValueOnce(inactiveAnalyst).mockResolvedValueOnce(activeAnalyst);
      jest.spyOn(service, 'listarPaginado').mockResolvedValue({ data: [], total: 0, page: 1, size: 10 });

      await service.redistribuirPropriedadeAnalista(1);

      expect(propriedadeRepository.find).toHaveBeenCalledWith({ relations: ['analista'], where: { analista: { id: 1 } } });
      expect(service.consultaAnalista).toHaveBeenCalled();
      expect(propriedadeRepository.save).toHaveBeenCalledWith({ ...properties[0], analista: activeAnalyst });
      expect(service.listarPaginado).toHaveBeenCalled();
    });

    it('should throw NegocioException if analyst is active', async () => {
      const activeAnalyst = { id: 1, status: StatusUsuario.ATIVO } as Usuario;
      (usuarioRepository.findOneBy as jest.Mock).mockResolvedValue(activeAnalyst);

      await expect(service.redistribuirPropriedadeAnalista(1)).rejects.toThrow(new NegocioException(422, "Usuario encontra-se ativo"));
    });
  });
});