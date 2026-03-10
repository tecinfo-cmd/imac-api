import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Cargo, CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { PessoaService } from '../shared/service/pessoa.service';
import { TokenRedefinicaoSenha } from './entities/token-redefinicao-senha.entity';
import { EmailService } from '../email/email.service';
import { AgrotoolsService } from '../agrotools/agrotools.service';
import { TokenPrimeiroAcesso } from './entities/token-primeiro-acesso.entity';

jest.mock('bcrypt');

jest.mock('class-transformer', () => ({
  ...jest.requireActual('class-transformer'),
  plainToInstance: jest.fn((cls, obj) => ({ ...obj })),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usuarioRepositoryMock;
  let tokenRedefinicaoRepositoryMock;
  let tokenPrimeiroAcessoRepositoryMock;
  let pessoaServiceMock;
  let agrotoolsServiceMock;
  let emailServiceMock;

  const mockUsuario = {
    id: 1,
    email: 'test@example.com',
    senha: 'hashedPassword',
    cargo: Cargo.PRODUTOR,
    pessoa: {
      id: 1,
      nome: 'Test User',
    },
    roles: [{ id: 3, nome: Cargo.PRODUTOR }]
  };

  const mockPessoaSaved = {
    id: 1,
    nome: 'Test User',
    cpfCnpj: '12345678900',
    email: 'test@example.com',
    dataNascimento: '1990-01-01',
  };

  beforeEach(async () => {
    usuarioRepositoryMock = {
      findOneBy: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn()
    };

    tokenRedefinicaoRepositoryMock = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    tokenPrimeiroAcessoRepositoryMock = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    pessoaServiceMock = {
      buscaPessoaEmailCadastro: jest.fn(),
      salvaPessoa: jest.fn(),
      atualizarPessoa: jest.fn(),
    };

    agrotoolsServiceMock = {
      cadastrarProdutorTemp: jest.fn(),
      cadastraPessoaAgrotools: jest.fn()
    };

    emailServiceMock = {
      enviarEmailTemplate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepositoryMock,
        },
        {
          provide: getRepositoryToken(TokenRedefinicaoSenha),
          useValue: tokenRedefinicaoRepositoryMock,
        },
        {
          provide: getRepositoryToken(TokenPrimeiroAcesso),
          useValue: tokenPrimeiroAcessoRepositoryMock,
        },
        {
          provide: PessoaService,
          useValue: pessoaServiceMock,
        },
        {
          provide: AgrotoolsService,
          useValue: agrotoolsServiceMock,
        },
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token on successful login', async () => {
      usuarioRepositoryMock.findOne.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mockAccessToken');

      const result = await service.login({ email: 'test@example.com', senha: 'password' });
      expect(result).toEqual({ email: 'test@example.com', accessToken: 'mockAccessToken' });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: mockUsuario.email,
        cargo: mockUsuario.cargo,
        roles: mockUsuario.roles.map(r => r.nome),
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      usuarioRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.login({ email: 'test@example.com', senha: 'password' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if password is not correct', async () => {
      usuarioRepositoryMock.findOne.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@example.com', senha: 'wrongPassword' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('signUp', () => {
    const signUpData: CreateUsuarioDto = {
      nome: 'Test User',
      cpf: '12345678900',
      email: 'test@example.com',
      senha: 'mockHash',
      confirmacaoSenha: 'mockHash',
      aceitouTermos: true,
      dataNascimento: '1990-01-01',
      cep: '12345000',
      uf: 'SP',
      logradouro: 'Rua Teste',
      numero: '123',
      bairro: 'Bairro Teste',
      cidade: 'Cidade Teste',
      telefone: '11999999999',
      rgie: '',
      profissao: '',
      roles: [{ id: 3, nome: Cargo.PRODUTOR }]
    };

    const mockCreatedUsuario = {
      ...signUpData,
      id: 1,
      pessoa: mockPessoaSaved,
      cargo: Cargo.PRODUTOR
    };

    const expectedSignUpResponse = {
      ...mockCreatedUsuario,
      email: signUpData.email,
      cargo: Cargo.PRODUTOR,
      pessoa: mockPessoaSaved,
      accessToken: 'mockAccessToken',
    };

    beforeEach(() => {
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('mockSalt');
      (bcrypt.hash as jest.Mock).mockImplementation(async (data) => data);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mockAccessToken');
      usuarioRepositoryMock.create.mockImplementation(dto => ({ ...dto }));
      usuarioRepositoryMock.save.mockImplementation(user => Promise.resolve({ ...user, id: 1 }));
      pessoaServiceMock.buscaPessoaEmailCadastro.mockResolvedValue(null);
      pessoaServiceMock.salvaPessoa.mockResolvedValue(mockPessoaSaved);
      usuarioRepositoryMock.findOneBy.mockResolvedValue(null);
      agrotoolsServiceMock.cadastrarProdutorTemp.mockResolvedValue({ idUser: 'agrotoolsUserId' });
    });

    afterEach(() => { // Added to clear mocks between tests in this describe block
      jest.clearAllMocks();
    });

    it('should create a new user, save pessoa, and return user data with access token', async () => {
      const result = await service.signUp(signUpData);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(signUpData.senha, 'mockSalt');
      expect(bcrypt.hash).toHaveBeenCalledWith(signUpData.confirmacaoSenha, 'mockSalt');
      expect(usuarioRepositoryMock.findOne).toHaveBeenCalledWith({ where: { email: signUpData.email }, relations: ['roles'] });
      expect(pessoaServiceMock.buscaPessoaEmailCadastro).toHaveBeenCalledWith(signUpData.email);
      expect(pessoaServiceMock.salvaPessoa).toHaveBeenCalledWith(expect.objectContaining({
        nome: signUpData.nome,
        cpfCnpj: signUpData.cpf,
        email: signUpData.email,
        dataNascimento: signUpData.dataNascimento,
      }));
      expect(usuarioRepositoryMock.create).toHaveBeenCalledWith(expect.objectContaining({
        ...signUpData,
        senha: signUpData.senha,
        confirmacaoSenha: signUpData.confirmacaoSenha,
        pessoa: mockPessoaSaved,
        cargo: Cargo.PRODUTOR,
      }));
      expect(usuarioRepositoryMock.save).toHaveBeenCalledWith(expect.objectContaining({ cargo: Cargo.PRODUTOR }));
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: signUpData.email,
        cargo: Cargo.PRODUTOR,
        roles: [{ id: 3, nome: Cargo.PRODUTOR }].map(r => r.nome)
      });
      expect(result).toEqual(expectedSignUpResponse);
    });

    it('should call agrotools service to register user', async () => {
      await service.signUp(signUpData);
      expect(agrotoolsServiceMock.cadastraPessoaAgrotools).toHaveBeenCalled();
    });

    it('should update and use existing pessoa if found', async () => {
      pessoaServiceMock.buscaPessoaEmailCadastro.mockResolvedValue(mockPessoaSaved);
      // Ensure the mock for saving the updated pessoa is also set
      pessoaServiceMock.salvaPessoa.mockResolvedValue({
        ...mockPessoaSaved,
        nome: signUpData.nome,
        telefone: signUpData.telefone,
        cpfCnpj: signUpData.cpf,
        dataNascimento: signUpData.dataNascimento,
      });

      await service.signUp(signUpData);

      expect(pessoaServiceMock.salvaPessoa).toHaveBeenCalledWith(expect.objectContaining({
        id: mockPessoaSaved.id, // Verifies it's an update
        nome: signUpData.nome,
      }));
    });

    it('should return existing user with a new token if email already exists', async () => {
      usuarioRepositoryMock.findOne.mockResolvedValue(mockUsuario);
      const result = await service.signUp(signUpData);
      expect(result).toEqual(expect.objectContaining({ accessToken: 'mockAccessToken', email: mockUsuario.email }));
      expect(usuarioRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password and confirmation password do not match', async () => {
      usuarioRepositoryMock.findOneBy.mockResolvedValue(null);
      await expect(service.signUp({ ...signUpData, confirmacaoSenha: 'otherPassword' })).rejects.toThrow(UnauthorizedException);
      await expect(service.signUp({ ...signUpData, confirmacaoSenha: 'otherPassword' })).rejects.toThrow('Email ou senha incorreto!');
    });
  });

  describe('solicitarRecuperacaoSenha', () => {
    const email = 'test@example.com';

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2023-01-01T10:00:00.000Z'));
      usuarioRepositoryMock.findOne.mockReset();
      tokenRedefinicaoRepositoryMock.findOne.mockReset();
      tokenRedefinicaoRepositoryMock.save.mockReset();
      (jwtService.signAsync as jest.Mock).mockReset();
      emailServiceMock.enviarEmailTemplate.mockReset();
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
    });

    it('should send a password recovery email if user exists and no active token', async () => {
      usuarioRepositoryMock.findOne.mockResolvedValue(mockUsuario);
      tokenRedefinicaoRepositoryMock.findOne.mockResolvedValue(null); // No active token
      (jwtService.signAsync as jest.Mock).mockResolvedValue('mockRecoveryToken');
      tokenRedefinicaoRepositoryMock.save.mockImplementation(token => Promise.resolve(token));

      await service.solicitarRecuperacaoSenha(email);

      expect(usuarioRepositoryMock.findOne).toHaveBeenCalledWith({ where: { email }, relations: ['pessoa', 'roles'] });
      expect(tokenRedefinicaoRepositoryMock.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ // Check nested where properties
          usuario: { id: mockUsuario.id },
          utilizado: false,
        })
      }));
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUsuario.id,
        email: mockUsuario.email,
        roles: mockUsuario.roles.map(r => r.nome)
      }, { expiresIn: '1h' });
      const expectedExpiration = new Date('2023-01-01T11:00:00.000Z'); // 1 hour later
      expect(tokenRedefinicaoRepositoryMock.save).toHaveBeenCalledWith(expect.objectContaining({
        token: 'mockRecoveryToken',
        usuario: mockUsuario,
        expiraEm: expectedExpiration,
      }));
      expect(emailServiceMock.enviarEmailTemplate).toHaveBeenCalledWith(expect.objectContaining({
        recipients: [email],
        subject: "Redefinição de senha - IMAC",
      }));
    });

    it('should throw NotFoundException if user does not exist', async () => {
      usuarioRepositoryMock.findOne.mockResolvedValue(null);
      await expect(service.solicitarRecuperacaoSenha(email)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if an active recovery token already exists', async () => {
      usuarioRepositoryMock.findOne.mockResolvedValue(mockUsuario);
      tokenRedefinicaoRepositoryMock.findOne.mockResolvedValue({ id: 1, token: 'existingToken', expiraEm: new Date(Date.now() + 100000), utilizado: false }); // Active token exists
      await expect(service.solicitarRecuperacaoSenha(email)).rejects.toThrow(BadRequestException);
      await expect(service.solicitarRecuperacaoSenha(email)).rejects.toThrow('Um link de redefinição já foi enviado. Verifique seu e-mail.');
    });
  });

  describe('redefinirSenha', () => {
    const token = 'validToken';
    const senha = 'newPassword123';
    const confirmacaoSenha = 'newPassword123';
    const mockTokenRedefinicao = {
      id: 1,
      token,
      usuario: mockUsuario,
      expiraEm: new Date(Date.now() + 3600 * 1000), // Expires in 1 hour
      utilizado: false,
    };

    beforeEach(() => {
      // Mock jwtService.verify directly if it's part of the JwtService instance
      (jwtService.verify as jest.Mock) = jest.fn().mockReturnValue({ sub: mockUsuario.id, email: mockUsuario.email });
      tokenRedefinicaoRepositoryMock.findOne.mockReset();
      tokenRedefinicaoRepositoryMock.update.mockReset();
      usuarioRepositoryMock.save.mockReset();
      (bcrypt.compare as jest.Mock).mockReset();
      (bcrypt.hash as jest.Mock).mockReset();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should reset password successfully with a valid token', async () => {
      tokenRedefinicaoRepositoryMock.findOne.mockResolvedValue(mockTokenRedefinicao);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // New password is not the same as old
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');

      await service.redefinirSenha(token, senha, confirmacaoSenha);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(tokenRedefinicaoRepositoryMock.findOne).toHaveBeenCalledWith({ where: { token }, relations: ['usuario'] });
      expect(bcrypt.compare).toHaveBeenCalledWith(senha, mockUsuario.senha);
      expect(bcrypt.hash).toHaveBeenCalledWith(senha, 10);
      expect(usuarioRepositoryMock.update).toHaveBeenCalledWith(expect.objectContaining({ id: mockUsuario.id }), expect.objectContaining({ senha: 'hashedNewPassword', confirmacaoSenha: 'hashedNewPassword' }));
      expect(tokenRedefinicaoRepositoryMock.update).toHaveBeenCalledWith(mockTokenRedefinicao.id, { utilizado: true });
    });

    it('should throw UnauthorizedException if token is invalid (JWT verification fails)', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => { throw new UnauthorizedException('jwt invalid'); });
      await expect(service.redefinirSenha(token, senha, confirmacaoSenha)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is not found, expired, or used', async () => {
      tokenRedefinicaoRepositoryMock.findOne.mockResolvedValue(null); // Token not found
      await expect(service.redefinirSenha(token, senha, confirmacaoSenha)).rejects.toThrow(UnauthorizedException);

      tokenRedefinicaoRepositoryMock.findOne.mockResolvedValue({ ...mockTokenRedefinicao, expiraEm: new Date(Date.now() - 3600 * 1000) }); // Expired
      await expect(service.redefinirSenha(token, senha, confirmacaoSenha)).rejects.toThrow(UnauthorizedException);

      tokenRedefinicaoRepositoryMock.findOne.mockResolvedValue({ ...mockTokenRedefinicao, utilizado: true }); // Used
      await expect(service.redefinirSenha(token, senha, confirmacaoSenha)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if new password is the same as the old one', async () => {
      tokenRedefinicaoRepositoryMock.findOne.mockResolvedValue(mockTokenRedefinicao);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // New password is the same as old
      await expect(service.redefinirSenha(token, senha, confirmacaoSenha)).rejects.toThrow(BadRequestException);
      await expect(service.redefinirSenha(token, senha, confirmacaoSenha)).rejects.toThrow('A nova senha não pode ser igual a senha antiga');
    });

  });

  describe('primeiroAcesso', () => {
    const token = 'validToken';
    const senha = 'newPassword123';

    beforeEach(() => {
      tokenPrimeiroAcessoRepositoryMock.findOne.mockReset();
      tokenPrimeiroAcessoRepositoryMock.update.mockReset();
      usuarioRepositoryMock.save.mockReset();
      (bcrypt.hash as jest.Mock).mockReset();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should set password successfully for first access', async () => {
      const mockTokenPrimeiroAcesso = {
        id: 1,
        token,
        usuario: { ...mockUsuario, senha: null },
        utilizado: false,
      };
      tokenPrimeiroAcessoRepositoryMock.findOne.mockResolvedValue(mockTokenPrimeiroAcesso);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');

      await service.primeiroAcesso(token, senha, senha);

      expect(tokenPrimeiroAcessoRepositoryMock.findOne).toHaveBeenCalledWith({ where: { token }, relations: ['usuario'] });
      expect(bcrypt.hash).toHaveBeenCalledWith(senha, 10);
      expect(usuarioRepositoryMock.update).toHaveBeenCalledWith(
        { id: mockUsuario.id },
        { senha: 'hashedNewPassword', confirmacaoSenha: 'hashedNewPassword' }
      );
      expect(tokenPrimeiroAcessoRepositoryMock.update).toHaveBeenCalledWith(mockTokenPrimeiroAcesso.id, { utilizado: true });
    });

    it('should throw UnauthorizedException if passwords do not match', async () => {
      await expect(service.primeiroAcesso(token, senha, 'mismatchPassword')).rejects.toThrow(UnauthorizedException);
      await expect(service.primeiroAcesso(token, senha, 'mismatchPassword')).rejects.toThrow('As senhas devem ser iguais!');
    });

    it('should throw UnauthorizedException if token is invalid or used', async () => {
      tokenPrimeiroAcessoRepositoryMock.findOne.mockResolvedValue(null); // Token not found
      await expect(service.primeiroAcesso(token, senha, senha)).rejects.toThrow(UnauthorizedException);
      await expect(service.primeiroAcesso(token, senha, senha)).rejects.toThrow('Token inválido ou expirado!');

      const mockTokenUtilizado = {
        id: 1,
        token,
        usuario: { ...mockUsuario, senha: null },
        utilizado: true,
      };
      tokenPrimeiroAcessoRepositoryMock.findOne.mockResolvedValue(mockTokenUtilizado); // Token used
      await expect(service.primeiroAcesso(token, senha, senha)).rejects.toThrow(UnauthorizedException);
      await expect(service.primeiroAcesso(token, senha, senha)).rejects.toThrow('Token inválido ou expirado!');
    });
  });
});