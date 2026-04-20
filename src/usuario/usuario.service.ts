import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cargo } from './dto/create-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { plainToInstance } from 'class-transformer';
import NegocioException from '../exception/negocio-exception';
import { PessoaService } from '../shared/service/pessoa.service';
import { Pessoa } from '../shared/entity/pessoa.entity';
import { UsuarioResponse } from './response/usuario-response';
import { StatusUsuario } from './enums/usuario-status';
import { UsuarioRequest } from './request/usuario-request.dto';
import { TokenPrimeiroAcesso } from '../auth/entities/token-primeiro-acesso.entity';
import { EmailService } from '../email/email.service';
import { PrimeiroAcessoTemplate } from '../email/templates/primeiro-acesso.template';
import { randomUUID } from 'crypto';
import { EnderecoProdutorAgrotools } from '../agrotools/request/endereco-produtor-agrotools';
import { ProdutorAgrotools } from '../agrotools/request/produtor-agrotools';
import { AgrotoolsService } from '../agrotools/agrotools.service';
import { UsuarioFrigoficoRequest } from './request/usuario-frigorifico-request.dto';
import { ProdutorFrigoficoRequest } from './request/produtor-frigorifico-request.dto';
import { UpdateUsuarioFrigorifico } from './request/update-usuario-frigorifico-request';
import { AnalistaDto } from './dto/analista-dto';
import { ListarUsuarioResponse } from './response/listar-usuario-response';
import { PaginatedResponseInterface } from '../shared/interfaces/paginated-response.interface';
import { Propriedade } from '../propriedade-prem/entities/propriedade.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly pessoaService: PessoaService,
    @InjectRepository(TokenPrimeiroAcesso)
    private readonly tokenPrimeiroAcessoRepository: Repository<TokenPrimeiroAcesso>,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => AgrotoolsService))
    private readonly agrotoolsService: AgrotoolsService,
    private readonly entityManager: EntityManager,
    @InjectRepository(Propriedade)
    private readonly propriedadeRepository: Repository<Propriedade>,
  ) {
  }

  async   criarUsuario(data: UsuarioRequest): Promise<UsuarioResponse> {
    try {

      await this.validaEmailExistente(data.email);

      let pessoa = await this.pessoaService.buscaPessoaEmailCadastro(data.email);

      if (!pessoa) {
        const p = { cpfCnpj: data.cpf, telefone: data?.telefone, nome: data.nome, email: data.email, tipoPessoa: data.tipo } as Pessoa;
        pessoa = await this.pessoaService.salvaPessoa(p);
      }

      const usuario = this.usuarioRepository.create({
        ...data,
        pessoa: pessoa,
        status: StatusUsuario.ATIVO,
        cargo: Cargo.ANALISTA,
      });

      const usuarioSave = await this.usuarioRepository.save(usuario);

      const token = randomUUID();

      await this.tokenPrimeiroAcessoRepository.save({ token, usuario });

      await this.emailService.enviarEmailTemplate({
        recipients: [usuario.email],
        subject: 'Primeiro acesso - IMAC',
        template: new PrimeiroAcessoTemplate({
          token,
        }),
      });

      return plainToInstance(UsuarioResponse, usuarioSave);
    } catch (error) {
      throw new NegocioException(error.statusCode, error.message);
    }

  }

  async buscaUSuarioPorEmail(email: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { email }, relations: ['pessoa'] });
    if (!usuario) {
      throw new NotFoundException('Usuario não encontrado');
    }
    return plainToInstance(Usuario, usuario);
  }

  async buscarUsuarioPorEmail(email: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { email }, relations: ['pessoa', 'roles', 'frigorifico'] });
    if (!usuario) {
      throw new NotFoundException('Usuario não encontrado');
    }
    return usuario;
  }

  async buscarUsuarioPorId(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id }, relations: ['pessoa'] });
    if (!usuario) {
      throw new NotFoundException('Usuario não encontrado');
    }
    return usuario;
  }

  async listar(
    email?: string,
    nome?: string,
    status?: StatusUsuario,
  ): Promise<Usuario[]> {
    const query = this.usuarioRepository.createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.pessoa', 'pessoa');

    if (email) {
      query.andWhere('usuario.email LIKE :email', { email: `%${email}%` });
    }

    if (nome) {
      query.andWhere('pessoa.nome LIKE :nome', { nome: `%${nome}%` });
    }

    if (status) {
      query.andWhere('usuario.status = :status', { status });
    }

    return await query.getMany();
  }

  async listarPaginado(
    email?: string,
    nome?: string,
    status?: StatusUsuario,
    role?: string,
    page = 1,
    size = 10,
  ): Promise<PaginatedResponseInterface<ListarUsuarioResponse>> {
    const query = this.usuarioRepository.createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.pessoa', 'pessoa')
      .leftJoinAndSelect('usuario.roles', 'roles');

    if (email) {
      query.andWhere('LOWER(usuario.email) LIKE :email', { email: `%${email}%` });
    }

    if (nome) {
      query.andWhere('LOWER(unaccent(pessoa.nome)) LIKE :nome', { nome: `%${nome}%` });
    }

    if (status) {
      query.andWhere('usuario.status = :status', { status });
    }

    if (role) {
      query.andWhere('LOWER(roles.nome) LIKE :nomeRole', { nomeRole: `%${role.toLowerCase()}%` });
    }

    query.skip((page - 1) * size).take(size);

    const [result, total] = await query.getManyAndCount();

    const usuariosAnalistas = await this.consultaQuantidadePropriedade()
    result.forEach(usuario => {
     usuariosAnalistas.forEach((analista) => {
       if(usuario.email == analista.email) {
         usuario.quantidadePropriedade = analista.quantidade;
         usuario.usuarioAnalista = "SIM";
       }
     })
    })

    const data = plainToInstance(ListarUsuarioResponse, result, { excludeExtraneousValues: true });
    return { data, total, page, size };
  }

  async atualizarUsuario(id: number, data: UpdateUsuarioDto): Promise<Usuario> {

    const updatedUsuario = await this.usuarioRepository.findOne({
      where: { id }, relations: ['pessoa'],
    });

    if (!updatedUsuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    let pessoa = await this.pessoaService.buscaPessoaEmail(updatedUsuario.email);
    if (pessoa && data.telefone) {
      pessoa.telefone = data.telefone;
      await this.pessoaService.atualizarPessoa(pessoa);
    }

    updatedUsuario.pessoa = pessoa;

    if (data.profissao) {
      updatedUsuario.profissao = data.profissao;
    }

    if (data.roles) {
      updatedUsuario.roles = data.roles;
    }

    if (data.tipo) {
      updatedUsuario.tipo = data.tipo;
    }

    updatedUsuario.erroIntegracao = '';
    updatedUsuario.status = data.status;
    await this.usuarioRepository.save(updatedUsuario);


    return updatedUsuario;
  }

  async deletarUsuario(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    usuario.status = StatusUsuario.INATIVO;
    await this.usuarioRepository.save(usuario);

    return usuario;
  }

  async consultarUsuariosCadastroAgrotools() {
    const query = this.usuarioRepository.createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.pessoa', 'pessoa')
      .where('pessoa.idUsuarioAgrotools IS NULL')
      .andWhere(`usuario.erroIntegracao IS NULL`);

    return await query.getMany();
  }

  async criarUsuarioFrigorifico(data: UsuarioFrigoficoRequest, idFrigorifico: number): Promise<UsuarioResponse> {
    try {

      await this.validaEmailExistente(data.email);

      let pessoa = await this.pessoaService.buscaPessoaEmailCadastro(data.email);

      if (!pessoa) {
        const p = { cpfCnpj: data.cpf.replace(/[^\d]/g, ''), nome: data.nome, email: data.email } as Pessoa;
        pessoa = await this.pessoaService.salvaPessoa(p);
      }

      const usuario = this.usuarioRepository.create({
        ...data,
        pessoa: pessoa,
        status: StatusUsuario.ATIVO,
        cargo: Cargo.FRIGORIFICO,
        roles: [{id: 4, nome: Cargo.FRIGORIFICO }],
        idFrigorifico: idFrigorifico,
      });

      const usuarioSave = await this.usuarioRepository.save(usuario);

      const token = randomUUID();

      await this.tokenPrimeiroAcessoRepository.save({ token, usuario });

      this.emailService.enviarEmailTemplate({
        recipients: [usuario.email],
        subject: 'Primeiro acesso - IMAC',
        template: new PrimeiroAcessoTemplate({
          token,
        }),
      });

      return plainToInstance(UsuarioResponse, usuarioSave);
    } catch (error) {
      throw new NegocioException(error.statusCode, error);
    }

  }

  async ativarInativarUsuarioFrigorifico(idFrigorifico: number, status: StatusUsuario) {

    await this.usuarioRepository.createQueryBuilder()
      .update(Usuario)
      .set({ status: status })
      .where('idFrigorifico = :idFrigorifico', { idFrigorifico: idFrigorifico })
      .execute();
  }

  async atualizarUsuarioFrigorifico(id: number, data: UpdateUsuarioFrigorifico): Promise<Usuario> {

    const updatedUsuario = await this.usuarioRepository.findOne({
      where: { id }, relations: ['pessoa'],
    });

    if (!updatedUsuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    let pessoa = await this.pessoaService.buscaPessoaEmail(updatedUsuario.email);
    if (pessoa) {
      pessoa.nome = data.nome;
      await this.pessoaService.atualizarPessoa(pessoa);
    }
    updatedUsuario.status = data.status;
    return await this.usuarioRepository.save(updatedUsuario);
  }

  async  criarProdutorFrigorifico(data: ProdutorFrigoficoRequest): Promise<UsuarioResponse> {
    try {

      await this.validaEmailExistente(data.email);

      let pessoa = await this.pessoaService.buscaPessoaEmailCadastro(data.email);

      if (!pessoa) {
        const p = { cpfCnpj: data.cpf, nome: data.nome, email: data.email, telefone: data.telefone } as Pessoa;
        pessoa = await this.pessoaService.salvaPessoa(p);
      }

      const usuario = this.usuarioRepository.create({
        ...data,
        pessoa: pessoa,
        status: StatusUsuario.ATIVO,
        cargo: Cargo.PRODUTOR,
        roles: [{id: 3, nome: Cargo.PRODUTOR}],
      });

      const usuarioSave = await this.usuarioRepository.save(usuario);

      const token = randomUUID();

      await this.tokenPrimeiroAcessoRepository.save({ token, usuario });

      const produtorAgortols = {
        name: usuario.pessoa.nome,
        document: usuario.pessoa.cpfCnpj,
        email: usuario.email,
        password: 'Temp@123456',
        phone: usuario.pessoa.telefone,
        address: {
          zipCode: usuario.cep ? usuario.cep : '78048250',
          number: usuario.numero ? usuario.cep : '525',
          complement: usuario.logradouro ? usuario.cep : 'Av. Dr. Hélio Ribeiro, 525 - Sala 701',
        } as EnderecoProdutorAgrotools,
      } as ProdutorAgrotools;

      const response = await this.agrotoolsService.consultarUsuarioCadastrado(usuario.pessoa.email);

      if (response) {
        pessoa.idUsuarioAgrotools = response.idUser ?? response.userId;
        await this.pessoaService.salvaPessoa(pessoa);
      } else {
        const produtorResponse = await this.agrotoolsService.cadastrarProdutorJob(produtorAgortols);
        if (produtorResponse) {
          pessoa.idUsuarioAgrotools = produtorResponse.idUser ?? produtorResponse.userId;
          await this.pessoaService.salvaPessoa(pessoa);
        }
      }

      await this.emailService.enviarEmailTemplate({
        recipients: [usuario.email],
        subject: 'Primeiro acesso - IMAC',
        template: new PrimeiroAcessoTemplate({
          token,
        }),
      });

      return plainToInstance(UsuarioResponse, usuarioSave);
    } catch (error) {
      throw new NegocioException(error.statusCode, error);
    }
  }

  async validaEmailExistente(email: string) {
    if (email) {
      const usuarioExiste = await this.usuarioRepository.findOneBy({ email: email });
      if (usuarioExiste) {
        throw new NegocioException(422,'Email já cadastrado');
      }
    }
  }

  async salvarUsuario(usuario: Usuario) {
    await this.usuarioRepository.save(usuario);
  }

  async consultaQuantidadePropriedade(): Promise<AnalistaDto[]>{
    const sql = `select u."EMAIL" email, count(tp."ID_USUARIO_ANALISTA") quantidade
                 from "IMAC"."TB_USUARIOS" u
                          inner join "IMAC"."TB_USUARIO_ROLE" tur on tur."ID_USUARIO" = u."ID"
                          left join "IMAC"."TB_PROPRIEDADES" tp on u."ID" = tp."ID_USUARIO_ANALISTA"
                 where tur."ID_ROLE" = 2
                   and u."STATUS" != 'INATIVO'
                 group by u."EMAIL", u."STATUS"
                 order by quantidade asc;`
    return await this.entityManager.query(sql)

  }

  async consultaAnalista(): Promise<AnalistaDto>{
    const sql = `select u."EMAIL" email, count(tp."ID_USUARIO_ANALISTA") quantidade, u."ID" as id
                 from "IMAC"."TB_USUARIOS" u
                          inner join "IMAC"."TB_USUARIO_ROLE" tur on tur."ID_USUARIO" = u."ID"
                          left join "IMAC"."TB_PROPRIEDADES" tp on u."ID" = tp."ID_USUARIO_ANALISTA"
                 where tur."ID_ROLE" = 2
                   and u."STATUS" != 'INATIVO'
                 group by u."EMAIL", u."STATUS", u."ID"
                 order by quantidade asc
                     limit 1;
    ;`
    return await this.entityManager.query(sql)

  }

  async redistribuirPropriedadeAnalista(id: number){
    const usuario =  await this.usuarioRepository.findOneBy({ id: id });
    if(usuario?.status == StatusUsuario.ATIVO){
      throw new NegocioException(422,"Usuario encontra-se ativo")
    }

    const propriedades = await this.propriedadeRepository.find({
      relations: ['analista'],
      where: { analista: { id: id}},
    })

    for(const prop of propriedades) {
      const analista = await this.consultaAnalista();
      const analistaVinculo = await this.usuarioRepository.findOneBy({ id: analista[0].id });
      if(analistaVinculo){
        prop.analista = analistaVinculo;
        await this.propriedadeRepository.save(prop);
      }
    }

    return this.listarPaginado();


  }

}
