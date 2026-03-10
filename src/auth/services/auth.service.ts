import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { Cargo } from '../../usuario/dto/create-usuario.dto';
import { AuthDto } from '../dto/auth.dto';
import { Pessoa } from '../../shared/entity/pessoa.entity';
import { plainToInstance } from 'class-transformer';
import { UsuarioResponse } from '../../usuario/response/usuario-response';
import { PessoaService } from '../../shared/service/pessoa.service';
import { ProdutorAgrotools } from '../../agrotools/request/produtor-agrotools';
import { AgrotoolsService } from '../../agrotools/agrotools.service';
import { EnderecoProdutorAgrotools } from '../../agrotools/request/endereco-produtor-agrotools';
import { TokenRedefinicaoSenha } from '../entities/token-redefinicao-senha.entity';
import { EmailService } from '../../email/email.service';
import { SolicitacaoRedefinicaoSenhaTemplate } from '../../email/templates/solicitacao-redefinicao-senha.template';
import { SigninUsuarioDto } from '../../usuario/dto/signin-usuario.dto';
import { TokenPrimeiroAcesso } from '../entities/token-primeiro-acesso.entity';
import { StatusUsuario } from '../../usuario/enums/usuario-status';


@Injectable()
export class AuthService {
  private readonly validApiKeys: string = ''

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(TokenRedefinicaoSenha)
    private readonly tokenRedefinicaoRepository: Repository<TokenRedefinicaoSenha>,
    @InjectRepository(TokenPrimeiroAcesso)
    private readonly tokenPrimeiroAcessoRepository: Repository<TokenPrimeiroAcesso>,
    @Inject(forwardRef(() => PessoaService))
    private readonly pessoaService: PessoaService,
    @Inject(forwardRef(() => AgrotoolsService))
    private readonly agrotoolsService: AgrotoolsService,
    private readonly  emailService: EmailService,
  ) {

  }

  async login({ email, senha }: AuthDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { email },
      relations: ['roles'],
    });

    if (!usuario) throw new NotFoundException('Usuário não encontrado.');

    if (!(await bcrypt.compare(senha, usuario.senha))) {
      throw new UnauthorizedException('Email ou senha incorretos!');
    }

    const payload = {
      email: usuario.email,
      cargo: usuario.cargo,
      roles: usuario.roles.map(role => role.nome),
    };

    const accessToken = await this.jwtService.signAsync(payload);
    return {
      email,
      accessToken,
    };
  }


  async signUp(data: SigninUsuarioDto) {

    const salt = await bcrypt.genSalt();
    const hashSenha = await bcrypt.hash(data.senha, salt);
    const hashConfirmSenha = await bcrypt.hash(data.confirmacaoSenha, salt);

    if (data.senha !== data.confirmacaoSenha) {
      throw new UnauthorizedException('Email ou senha incorreto!');
    }

    if (data.email) {
      const usuarioExiste = await this.usuarioRepository.findOne({ where: { email: data.email }, relations: ['roles'] });
      if (usuarioExiste) {
        const accessToken = await this.jwtService.signAsync({ email: usuarioExiste.email, cargo: usuarioExiste.cargo, roles: usuarioExiste.roles.map(role => role.nome) });
        return plainToInstance(UsuarioResponse, { ...usuarioExiste, accessToken });
      }
    }

    let pessoa = await this.pessoaService.buscaPessoaEmailCadastro(data.email);

    if (!pessoa) {
      const p = {
        cpfCnpj: data.cpf,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        dataNascimento: data.dataNascimento,
      } as Pessoa;
      pessoa = await this.pessoaService.salvaPessoa(p);
    } else {
      pessoa.nome = data.nome;
      pessoa.telefone = data.telefone;
      pessoa.cpfCnpj = data.cpf;
      pessoa.dataNascimento = data.dataNascimento;
      pessoa = await this.pessoaService.salvaPessoa(pessoa);
    }

    const role = [{id:3, nome:Cargo.PRODUTOR}];

    const usuario = this.usuarioRepository.create({
      ...data,
      pessoa: pessoa,
      cargo: Cargo.PRODUTOR,
      roles: role,
      senha: hashSenha,
      status: StatusUsuario.ATIVO,
      confirmacaoSenha: hashConfirmSenha,
    });
    const usuarioSave = await this.usuarioRepository.save(usuario);
    const accessToken = await this.jwtService.signAsync({ email: usuario.email, cargo: usuario.cargo, roles: usuario.roles.map(role => role.nome)});
    this.agrotoolsService.cadastraPessoaAgrotools();
    return plainToInstance(UsuarioResponse, { ...usuarioSave, accessToken });
  }

  /**
   * Cadastra o usuario na Agrotools
   */
  async cadastrarUsuarioAgrotools() {

    const usuarios = await this.usuarioRepository.find({
      relations: ['pessoa'],
    });

    if (usuarios.length > 0) {
      for (const user of usuarios) {
        if (!user.pessoa.idUsuarioAgrotools) {
          const pessoa = await this.pessoaService.buscaPessoaEmailCadastro(user.email);
          if (pessoa) {
            const produtorAgortols = {
              name: pessoa.nome,
              document: pessoa.cpfCnpj,
              email: pessoa.email,
              password: user.senha,
              phone: pessoa.telefone,
              address: { zipCode: user.cep, number: '90', complement: 'CADASTRO MT TESTE' } as EnderecoProdutorAgrotools,
            } as ProdutorAgrotools;
            const produtorResponse = await this.agrotoolsService.cadastrarProdutorTemp(produtorAgortols);
            if (produtorResponse) {
              pessoa.idUsuarioAgrotools = produtorResponse.idUser;
              await this.pessoaService.atualizarPessoa(pessoa);
            }
          }

        }
      }

    }

  }

  async solicitarRecuperacaoSenha(email: string): Promise<void> {
    const usuario = await this.usuarioRepository.findOne({ where: { email }, relations: ['pessoa', 'roles'] });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    const tokenExistente = await this.tokenRedefinicaoRepository.findOne({
      where: {
        usuario: { id: usuario.id },
        expiraEm: MoreThan(new Date()),
        utilizado: false,
      },
    });

    if (tokenExistente) {
      throw new BadRequestException('Um link de redefinição já foi enviado. Verifique seu e-mail.');
    }

    const payload = { sub: usuario.id, email: usuario.email, roles: usuario.roles.map(role => role.nome)};
    const token = await this.jwtService.signAsync(payload, { expiresIn: '1h' });

    const expiraEm = new Date();
    expiraEm.setHours(expiraEm.getHours() + 1);

    const tokenRedefinicao = await this.tokenRedefinicaoRepository.save({ token, usuario, expiraEm });
    await this.tokenRedefinicaoRepository.save(tokenRedefinicao);

    await this.emailService.enviarEmailTemplate({
      recipients: [usuario.email],
      subject: "Redefinição de senha - IMAC",
      template: new SolicitacaoRedefinicaoSenhaTemplate({
        nomeUsuario: usuario.pessoa.nome,
        token,
      })
    });
  }

  async redefinirSenha(token: string, senha: string, confirmacaoSenha: string): Promise<void> {
    const tokenValido = this.jwtService.verify(token);

    if (!tokenValido) {
      throw new UnauthorizedException('Token inválido');
    }

    if (senha !== confirmacaoSenha) {
      throw new UnauthorizedException('As senhas devem ser iguais!');
    }

    const tokenRedefinicao = await this.tokenRedefinicaoRepository.findOne({
      where: { token },
      relations: ['usuario'],
    });

    if (!tokenRedefinicao || tokenRedefinicao.expiraEm < new Date() || tokenRedefinicao.utilizado) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    if (await bcrypt.compare(senha, tokenRedefinicao.usuario.senha)) {
      throw new BadRequestException('A nova senha não pode ser igual a senha antiga');
    }

    const usuario = tokenRedefinicao.usuario;
    const novaSenhaHash = await bcrypt.hash(senha, 10);
    await this.usuarioRepository.update({ id: usuario.id }, { senha: novaSenhaHash, confirmacaoSenha: novaSenhaHash });

    await this.tokenRedefinicaoRepository.update(tokenRedefinicao.id, { utilizado: true });
  }

  async primeiroAcesso(token: string, senha: string, confirmacaoSenha: string): Promise<void> {
    if (senha !== confirmacaoSenha) {
      throw new UnauthorizedException('As senhas devem ser iguais!');
    }

    const tokenPrimeiroAcesso = await this.tokenPrimeiroAcessoRepository.findOne({
      where: { token },
      relations: ['usuario'],
    });

    if (!tokenPrimeiroAcesso || tokenPrimeiroAcesso.utilizado) {
      throw new UnauthorizedException('Token inválido ou expirado!');
    }

    const usuario = tokenPrimeiroAcesso.usuario;

    if (usuario.senha) {
      throw new UnauthorizedException('Usuário já possui senha cadastrada!');
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await this.usuarioRepository.update({ id: usuario.id }, { senha: senhaHash, confirmacaoSenha: senhaHash });

    await this.tokenPrimeiroAcessoRepository.update(tokenPrimeiroAcesso.id, { utilizado: true });
  }



}
