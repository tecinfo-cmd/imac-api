import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { Cargo } from '../usuario/dto/create-usuario.dto';
import { AuthDto } from './dto/auth.dto';
import { SolicitacaoRedefinicaoSenhaDto } from './dto/solicitacao-redefinicao-senha.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';
import { NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrimeiroAcessoDto } from './dto/primeiro-acesso.dto';
import { SigninUsuarioDto } from '../usuario/dto/signin-usuario.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    signUp: jest.fn(),
    solicitarRecuperacaoSenha: jest.fn(),
    redefinirSenha: jest.fn(),
    primeiroAcesso: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with the correct data', async () => {
      const authData: AuthDto = { email: 'test@example.com', senha: 'password' };
      mockAuthService.login.mockResolvedValue({ accessToken: 'mockToken', email: 'test@example.com' });

      await controller.login(authData);

      expect(mockAuthService.login).toHaveBeenCalledWith(authData);
    });

    it('should return the result from authService.login', async () => {
      const authData: AuthDto = { email: 'test@example.com', senha: 'password' };
      const expectedResult = { accessToken: 'mockToken', email: 'test@example.com' };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(authData);

      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if authService.login throws NotFoundException', async () => {
      const authData: AuthDto = { email: 'test@example.com', senha: 'password' };
      mockAuthService.login.mockRejectedValue(new NotFoundException());

      await expect(controller.login(authData)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if authService.login throws UnauthorizedException', async () => {
      const authData: AuthDto = { email: 'test@example.com', senha: 'password' };
      mockAuthService.login.mockRejectedValue(new UnauthorizedException());

      await expect(controller.login(authData)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signup', () => {
    const createUsuarioDto: SigninUsuarioDto = {
      nome: 'Test User',
      cpf: '12345678900',
      email: 'test@example.com',
      senha: 'password',
      confirmacaoSenha: 'password',
      dataNascimento: '1990-01-01',
      aceitouTermos: true,
      cep: '12234123',
      uf: 'XS',
      logradouro: 'any',
      numero: '1',
      bairro: 'any',
      cidade: 'any',
      telefone: '12341324',
      roles: []
    };

    const mockPessoaResponse = {
      id: 1,
      nome: createUsuarioDto.nome,
      cpfCnpj: createUsuarioDto.cpf,
      email: createUsuarioDto.email,
      dataNascimento: createUsuarioDto.dataNascimento,
    };

    const mockSignedUpUserResponse = {
      id: 1,
      email: createUsuarioDto.email,
      cargo: Cargo.ANALISTA,
      pessoa: mockPessoaResponse,
      accessToken: 'mockSignUpToken',
    };

    it('should call authService.signUp with the correct data', async () => {
      mockAuthService.signUp.mockResolvedValue(mockSignedUpUserResponse);

      await controller.signup(createUsuarioDto);

      expect(mockAuthService.signUp).toHaveBeenCalledWith(createUsuarioDto);
    });

    it('should return the result from authService.signUp', async () => {
        mockAuthService.signUp.mockResolvedValue(mockSignedUpUserResponse);

        const result = await controller.signup(createUsuarioDto);

        expect(result).toEqual(mockSignedUpUserResponse);
    });

    it('should throw BadRequestException if authService.signUp throws BadRequestException', async () => {
        mockAuthService.signUp.mockRejectedValue(new BadRequestException());

        await expect(controller.signup(createUsuarioDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if authService.signUp throws NotFoundException', async () => {
        mockAuthService.signUp.mockRejectedValue(new NotFoundException());

        await expect(controller.signup(createUsuarioDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if authService.signUp throws UnauthorizedException', async () => {
        mockAuthService.signUp.mockRejectedValue(new UnauthorizedException());

        await expect(controller.signup(createUsuarioDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    const solicitacaoDto: SolicitacaoRedefinicaoSenhaDto = { email: 'test@example.com' };

    it('should call authService.solicitarRecuperacaoSenha with the correct email', async () => {
      mockAuthService.solicitarRecuperacaoSenha.mockResolvedValue(undefined);

      await controller.forgotPassword(solicitacaoDto);

      expect(mockAuthService.solicitarRecuperacaoSenha).toHaveBeenCalledWith(solicitacaoDto.email);
    });

    it('should return a success message', async () => {
      mockAuthService.solicitarRecuperacaoSenha.mockResolvedValue(undefined);

      const result = await controller.forgotPassword(solicitacaoDto);

      expect(result).toEqual({ message: 'Solicitação de redefinição de senha enviada com sucesso' });
    });

    it('should throw NotFoundException if authService.solicitarRecuperacaoSenha throws NotFoundException', async () => {
      mockAuthService.solicitarRecuperacaoSenha.mockRejectedValue(new NotFoundException());

      await expect(controller.forgotPassword(solicitacaoDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if authService.solicitarRecuperacaoSenha throws BadRequestException', async () => {
      mockAuthService.solicitarRecuperacaoSenha.mockRejectedValue(new BadRequestException());

      await expect(controller.forgotPassword(solicitacaoDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    const redefinirSenhaDto: RedefinirSenhaDto = { token: 'mockToken', senha: 'newPassword123', confirmacaoSenha: 'newPassword123' };

    it('should call authService.redefinirSenha with the correct token and new password', async () => {
      mockAuthService.redefinirSenha.mockResolvedValue(undefined);

      await controller.resetPassword(redefinirSenhaDto);

      expect(mockAuthService.redefinirSenha).toHaveBeenCalledWith(redefinirSenhaDto.token, redefinirSenhaDto.senha, redefinirSenhaDto.confirmacaoSenha);
    });

    it('should return a success message', async () => {
      mockAuthService.redefinirSenha.mockResolvedValue(undefined);

      const result = await controller.resetPassword(redefinirSenhaDto);

      expect(result).toEqual({ message: 'Senha redefinida com sucesso' });
    });

    it('should throw UnauthorizedException if authService.redefinirSenha throws UnauthorizedException', async () => {
      mockAuthService.redefinirSenha.mockRejectedValue(new UnauthorizedException());

      await expect(controller.resetPassword(redefinirSenhaDto)).rejects.toThrow(UnauthorizedException);
    });
  });
  
  describe('firstAccess', () => {
    const primeiroAcessoDto: PrimeiroAcessoDto = { token: 'mockToken', senha: 'newPassword123', confirmacaoSenha: 'newPassword123' };

    beforeEach(() => {
      mockAuthService.primeiroAcesso = jest.fn();
    });

    it('should call authService.primeiroAcesso with the correct token and new password', async () => {
      mockAuthService.primeiroAcesso.mockResolvedValue(undefined);

      await controller.firstAccess(primeiroAcessoDto);

      expect(mockAuthService.primeiroAcesso).toHaveBeenCalledWith(primeiroAcessoDto.token, primeiroAcessoDto.senha, primeiroAcessoDto.confirmacaoSenha);
    });

    it('should return a success message', async () => {
      mockAuthService.primeiroAcesso.mockResolvedValue(undefined);

      const result = await controller.firstAccess(primeiroAcessoDto);

      expect(result).toEqual({ message: 'Senha definida com sucesso' });
    });

    it('should throw UnauthorizedException if authService.primeiroAcesso throws UnauthorizedException', async () => {
      mockAuthService.primeiroAcesso.mockRejectedValue(new UnauthorizedException());

      await expect(controller.firstAccess(primeiroAcessoDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
