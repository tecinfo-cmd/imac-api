import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { Cargo } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../shared/guards/jwt.guard';
import { ListarUsuarioResponse } from './response/listar-usuario-response';
import { plainToInstance } from 'class-transformer';
import { UsuarioResponse } from './response/usuario-response';
import { UsuarioTipo } from './enums/usuario-tipo';
import { UsuarioRequest } from './request/usuario-request.dto';

describe('UsuarioController', () => {
  let controller: UsuarioController;
  let usuarioService: UsuarioService;

  const mockUsuarioService = {
    criarUsuario: jest.fn(),
    buscaUSuarioPorEmail: jest.fn(),
    buscarUsuarioPorId: jest.fn(),
    atualizarUsuario: jest.fn(),
    deletarUsuario: jest.fn(),
    listarPaginado: jest.fn().mockReturnValue(Promise.resolve([[], 0])),
    redistribuirPropriedadeAnalista: jest.fn(),
  };

  const mockJwtAuthGuard = { canActivate: () => true };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<UsuarioController>(UsuarioController);
    usuarioService = module.get<UsuarioService>(UsuarioService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('criarUsuario', () => {
    const usuarioRequest: UsuarioRequest = {
      nome: 'Test User',
      email: 'test@example.com',
      cpf: '123.456.789-00',
      tipo: UsuarioTipo.PF,
      rgie: '',
      profissao: '',
      roles: [],
      telefone: ''
    };

    it('should call usuarioService.criarUsuario with correct data', async () => {
      mockUsuarioService.criarUsuario.mockResolvedValue(usuarioRequest);

      await controller.criarUsuario(usuarioRequest);

      expect(usuarioService.criarUsuario).toHaveBeenCalledWith(
        usuarioRequest,
      );
    });

    it('should return the result of usuarioService.criarUsuario', async () => {
      mockUsuarioService.criarUsuario.mockResolvedValue(usuarioRequest);

      const expectedResult = {
        nome: 'Test User',
        cpf: '12345678900',
        email: 'test@example.com',
        senha: 'password',
        confirmacaoSenha: 'password',
        aceitouTermos: true,
        dataNascimento: '',
        cep: '',
        uf: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        rgie: '',
        profissao: '',
        roles: [],
        telefone: '',
      };
      mockUsuarioService.criarUsuario.mockResolvedValue(expectedResult);

      const result = await controller.criarUsuario(usuarioRequest);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('listarPorFiltro', () => {
    it('should call usuarioService.listarPaginado', async () => {
      await controller.listarPorFiltro();

      expect(usuarioService.listarPaginado).toHaveBeenCalled();
    });

    it('should return the paginated result from the service', async () => {
      const mockUserResponse = {
        id: 1,
        nome: 'Test User',
        email: 'test@example.com',
        status: 'ATIVO',
      };
      const expectedResult = {
        data: [plainToInstance(ListarUsuarioResponse, mockUserResponse)],
        total: 1,
        page: 1,
        size: 10
      };
      mockUsuarioService.listarPaginado.mockResolvedValue(expectedResult);

      const result = await controller.listarPorFiltro(undefined, undefined, undefined, undefined, 1, 10);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('buscarUsuarioPorEmail', () => {
    it('should call usuarioService.buscaUSuarioPorEmail with correct email', async () => {
      const email = 'test@example.com';
      await controller.buscarUsuarioPorEmail(email);

      expect(usuarioService.buscaUSuarioPorEmail).toHaveBeenCalledWith(email);
    });

    it('should return the result of usuarioService.buscaUSuarioPorEmail', async () => {
      const email = 'test@example.com';
      const expectedResult = {
        id: 1,
        nome: 'Test User',
        cpf: '12345678900',
        email: email,
        senha: 'password',
        confirmacaoSenha: 'password',
        cargo: Cargo.PRODUTOR,
      };
      mockUsuarioService.buscaUSuarioPorEmail.mockResolvedValue(expectedResult);

      const result = await controller.buscarUsuarioPorEmail(email);

      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if usuarioService.buscaUSuarioPorEmail throws NotFoundException', async () => {
      const email = 'test@example.com';
      mockUsuarioService.buscaUSuarioPorEmail.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        controller.buscarUsuarioPorEmail(email),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('buscarUsuarioPorId', () => {
    it('should call usuarioService.buscarUsuarioPorId with correct id', async () => {
      const id = 1;
      await controller.buscarUsuarioPorId(id);

      expect(usuarioService.buscarUsuarioPorId).toHaveBeenCalledWith(id);
    });

    it('should return the result of usuarioService.buscarUsuarioPorId', async () => {
      const id = 1;
      const expectedResult = {
        id: id,
        nome: 'Test User',
        cpf: '12345678900',
        email: 'test@example.com',
        senha: 'password',
        confirmacaoSenha: 'password',
        cargo: Cargo.PRODUTOR,
      };
      mockUsuarioService.buscarUsuarioPorId.mockResolvedValue(expectedResult);

      const result = await controller.buscarUsuarioPorId(id);

      expect(result).toEqual(plainToInstance(UsuarioResponse, expectedResult, { excludeExtraneousValues: true }));
    });

    it('should throw NotFoundException if usuarioService.buscarUsuarioPorId throws NotFoundException', async () => {
      const id = 1;
      mockUsuarioService.buscarUsuarioPorId.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.buscarUsuarioPorId(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('atualizarUsuario', () => {
    const updateUsuarioDto: UpdateUsuarioDto = {
      roles: [],
      telefone: '',
      tipo: undefined,
      profissao: '',
    };
    const id = 1;

    it('should call usuarioService.atualizarUsuario with correct data', async () => {
      mockUsuarioService.atualizarUsuario.mockResolvedValue({
        id: id,
        ...updateUsuarioDto,
        email: 'test@example.com',
        cargo: Cargo.PRODUTOR,
      });

      await controller.atualizarUsuario(id, updateUsuarioDto);

      expect(usuarioService.atualizarUsuario).toHaveBeenCalledWith(
        id,
        updateUsuarioDto,
      );
    });

    it('should return the result of usuarioService.atualizarUsuario', async () => {
      mockUsuarioService.atualizarUsuario.mockResolvedValue({
        id: id,
        ...updateUsuarioDto,
        email: 'test@example.com',
        cargo: Cargo.PRODUTOR,
      });

      const result = await controller.atualizarUsuario(id, updateUsuarioDto);

      expect(result).toEqual({
        id: id,
        ...updateUsuarioDto,
        email: 'test@example.com',
        cargo: Cargo.PRODUTOR,
      });
    });

    it('should throw NotFoundException if usuarioService.atualizarUsuario throws NotFoundException', async () => {
      mockUsuarioService.atualizarUsuario.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        controller.atualizarUsuario(id, updateUsuarioDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletarUsuario', () => {
    it('should call usuarioService.deletarUsuario with correct id', async () => {
      const id = 1;
      await controller.deletarUsuario(id);

      expect(usuarioService.deletarUsuario).toHaveBeenCalledWith(id);
    });

    it('should return the result of usuarioService.deletarUsuario', async () => {
      const id = 1;
      const expectedResult = { id };
      mockUsuarioService.deletarUsuario.mockResolvedValue(expectedResult);

      const result = await controller.deletarUsuario(id);

      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if usuarioService.deletarUsuario throws NotFoundException', async () => {
      const id = 1;
      mockUsuarioService.deletarUsuario.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.deletarUsuario(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('redistribuir', () => {
    it('should call usuarioService.redistribuirPropriedadeAnalista with the correct id', async () => {
      const id = 1;
      const expectedResult = { data: [], total: 0, page: 1, size: 10 };
      mockUsuarioService.redistribuirPropriedadeAnalista.mockResolvedValue(expectedResult);

      await controller.redistribuir(id);

      expect(usuarioService.redistribuirPropriedadeAnalista).toHaveBeenCalledWith(id);
    });
  });
});
