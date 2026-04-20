import { BadRequestException, forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PessoaService } from '../shared/service/pessoa.service';
import { Frigorifico, StatusFrigorifico } from './entities/frigorifico.entity';
import { FrigorificoRequest } from './request/frigorifico-request';
import { UploadPayloadType } from '../shared/types/upload-payload.type';
import NegocioException from '../exception/negocio-exception';
import { plainToInstance } from 'class-transformer';
import { DocumentoUploadService } from '../upload/documento-upload.service';
import { CnpjValidator } from '../shared/validators/cnpj.validator';
import { UsuarioService } from '../usuario/usuario.service';
import { UsuarioFrigoficoRequest } from '../usuario/request/usuario-frigorifico-request.dto';
import { StatusUsuario } from '../usuario/enums/usuario-status';
import { Usuario } from '../usuario/entities/usuario.entity';
import {
  SolicitacaoElegibilidade,
  StatusSolicitacaoEligibilidade,
} from '../elegibilidade/entities/solicitacao-elegibilidade.entity';
import { PropriedadeConsulta } from '../elegibilidade/entities/consulta/propriedade-consulta.entity';
import { AgrotoolsService } from '../agrotools/agrotools.service';
import { randomUUID } from 'crypto';
import { ProdutorFrigoficoRequest } from '../usuario/request/produtor-frigorifico-request.dto';
import { StatusVoucher, VoucherEntity } from './entities/voucher.entity';
import { Propriedade } from '../propriedade-prem/entities/propriedade.entity';
import { StatusEtapas } from '../propriedade-prem/enum/etapas-status-propriedade.const';
import { ConsultaVoucherRequest } from './request/consulta-voucher.request';
import * as moment from 'moment';
import { FrigorificoUpdateRequest } from './request/frigorifico-update-request';
import { UpdateUsuarioFrigorifico } from '../usuario/request/update-usuario-frigorifico-request';
import { TerritorioEntity } from '../agrotools/entities/territorio.entity';
import { TerritorioAgrotoolsRequest } from '../agrotools/request/territorio-agrotools-request';
import { TerritorioResponse } from '../agrotools/response/territorio-response';
import { UsuarioResponse } from '../usuario/response/usuario-response';
import { Proprietario } from '../propriedade-prem/entities/proprietario.entity';
import { TipoProprietatioEnum } from '../propriedade-prem/enum/tipo-proprietatio-enum';
import { ListarPropriedadeResponse } from '../propriedade-prem/response/listar-propriedade-response';


/**
 *
 */
@Injectable()
export class FrigorificoService {
  private readonly logger = new Logger(FrigorificoService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Frigorifico)
    private readonly repository: Repository<Frigorifico>,
    @Inject(forwardRef(() => PessoaService))
    private readonly pessoaService: PessoaService,
    private readonly usuarioService: UsuarioService,
    private readonly documentoUploadService: DocumentoUploadService,
    @InjectRepository(PropriedadeConsulta)
    private readonly consultaRepository: Repository<PropriedadeConsulta>,
    @InjectRepository(SolicitacaoElegibilidade)
    private readonly elegibilidadeRepository: Repository<SolicitacaoElegibilidade>,
    private readonly agroToolsService: AgrotoolsService,
    @InjectRepository(VoucherEntity)
    private readonly voucherRepository: Repository<VoucherEntity>,
    @InjectRepository(Propriedade)
    private readonly propriedadeRepository: Repository<Propriedade>,
    @InjectRepository(TerritorioEntity)
    private readonly territorioRepository: Repository<TerritorioEntity>,
    @InjectRepository(Proprietario)
    private proprietarioRepository: Repository<Proprietario>,

  ) {

  }


  async cadastrarFrigorifico(payload: UploadPayloadType<FrigorificoRequest>): Promise<any> {
    const { body, arquivos } = payload;
    const json = body;
    const request = JSON.parse(json?.parametros);
    let arquivoUpload;

    await this.validaFrigorifico(request, arquivos);
    const frigorico = plainToInstance(Frigorifico, request);
    const existeCadastro = await this.repository.findOne({
      where: { cnpj: frigorico.cnpj.replace(/[^\d]/g, '') },
    });
    if (existeCadastro) {
      throw new NegocioException(422, `Cnpj já cadastrado`);
    }

    try {
      const documentosUpload = await this.documentoUploadService.uploadFiles(arquivos);

      documentosUpload.forEach(file => {
        arquivoUpload = {
          nomeArquivo: file.filename,
          urlArquivo: file.url,
          nomeArquivoOriginal: file.originalName,
          tipo: 'pdf',
        };
      });

      frigorico.urlTermoCooperacao = arquivoUpload.urlArquivo;
      frigorico.status = StatusFrigorifico.ATIVO;
      frigorico.cnpj = frigorico.cnpj.replace(/[^\d]/g, '');

      return await this.repository.save(frigorico);
    } catch (error) {
      throw new NegocioException(500, error.message);
    }

  }

  async alterarFrigorifico(updateFrigorifico: FrigorificoUpdateRequest): Promise<any> {
    try {

      const frigorifico = await this.repository.findOne({
        where: { id: updateFrigorifico.id },
      });

      if (!frigorifico) {
        throw new NegocioException(422, 'Frigorifico não encontrado.');
      }

      frigorifico.nomeFantasia = updateFrigorifico.nomeFantasia;
      frigorifico.telefone = updateFrigorifico.telefone;
      frigorifico.cep = updateFrigorifico.cep;
      frigorifico.endereco = updateFrigorifico.endereco;
      frigorifico.municipio = updateFrigorifico.municipio;
      frigorifico.quantidadeVoucher = updateFrigorifico.quantidadeVoucher;
      frigorifico.dataInicioVigencia =  updateFrigorifico.dataInicioVigencia;
      frigorifico.dataFimVigencia =  updateFrigorifico.dataFimVigencia;
      return await this.repository.save(frigorifico);

    } catch (error) {
      throw new NegocioException(500, error.message);
    }

  }

  async cadastrarUsuarioFrigorico(createUsuarioDto: UsuarioFrigoficoRequest, idFrigorifico: number) {
    try {
      const frigorico = await this.repository.findOne({
        where: { id: idFrigorifico },
      });

      if (!frigorico) {
        throw new NegocioException(422, `Frigorifico não cadastrado`);
      }
      return await this.usuarioService.criarUsuarioFrigorifico(createUsuarioDto, idFrigorifico);
    } catch (error) {
      throw new NegocioException(error.status, error.message.message);
    }
  }

  async alterarUsuario(id: number, data: UpdateUsuarioFrigorifico): Promise<Usuario> {
    try {
      return await this.usuarioService.atualizarUsuarioFrigorifico(id, data);
    } catch (error) {
      throw new NegocioException(error.message.status, error.message.message);
    }
  }

  async ativararFrigorifico(idFrigorifico: number) {
    try {
      const frigorico = await this.repository.findOne({
        where: { id: idFrigorifico },
      });

      if (!frigorico) {
        throw new NegocioException(422, `Frigorifico não cadastrado`);
      }

      frigorico.status = StatusFrigorifico.ATIVO;
      await this.repository.save(frigorico);
      await this.usuarioService.ativarInativarUsuarioFrigorifico(idFrigorifico, StatusUsuario.ATIVO);

      return { mensagem: 'Frigorifico ativado com sucesso' };

    } catch (error) {
      throw new NegocioException(error.message.status, error.message.message);
    }
  }

  async inativarFrigorifico(idFrigorifico: number) {
    try {
      const frigorico = await this.repository.findOne({
        where: { id: idFrigorifico },
      });

      if (!frigorico) {
        throw new NegocioException(422, `Frigorifico não cadastrado`);
      }

      frigorico.status = StatusFrigorifico.INATIVO;
      await this.repository.save(frigorico);
      await this.usuarioService.ativarInativarUsuarioFrigorifico(idFrigorifico, StatusUsuario.INATIVO);

      return { mensagem: 'Frigorifico inativado com sucesso' };

    } catch (error) {
      throw new NegocioException(error.message.status, error.message.message);
    }
  }

  async listarFrigorifico(nome?: string, cnpj?: string, status?: StatusFrigorifico, page = 1, pageSize = 10) {
    try {

      const query = this.repository
        .createQueryBuilder('frigorifico')
        .leftJoinAndSelect('frigorifico.usuarios', 'usuarios')
        .leftJoinAndSelect('usuarios.pessoa', 'pessoa')
        .leftJoinAndSelect('frigorifico.vouches', 'vouches')
        .where('1=1');

      if (status) {
        query.andWhere('frigorifico.status = :status', { status });
      }

      if (nome) {
        query.andWhere('LOWER(unaccent(frigorifico.nomeFantasia)) LIKE :nome', {
          nome: `%${nome.toLowerCase()}%`,
        });
      }

      if (cnpj) {
        query.andWhere('frigorifico.cnpj LIKE :cnpj', { cnpj: `%${cnpj}%` });
      }

      query.groupBy('frigorifico.id');
      query.addGroupBy('usuarios.id');
      query.addGroupBy('pessoa.id');
      query.addGroupBy('vouches.id');
      query.orderBy('frigorifico.dataAtualizacao', 'DESC');

      query.skip((page - 1) * pageSize).take(pageSize);

      return query.getManyAndCount();
    } catch (e) {
      Logger.error(e);
    }
    return [[], 0];
  }

  async listarElegibilidade(nomePropriedade?: string, cpfCnpj?: string, numeroCar?: string, status?: StatusSolicitacaoEligibilidade, page = 1, pageSize = 10, email?: string) {
    const query = this.elegibilidadeRepository
      .createQueryBuilder('elegibilidade')
      .leftJoinAndSelect('elegibilidade.propriedades', 'propriedades')
      .leftJoinAndSelect('elegibilidade.retornoAgrotools', 'retornoAgrotools')
      .leftJoinAndSelect('retornoAgrotools.deteccoes', 'deteccoes')
      .where('elegibilidade."CONFIRMACAO_EMAIL" = :confirmacaoEmail', { confirmacaoEmail: 'SIM' });

    if (email) {
      query.andWhere('LOWER(elegibilidade."EMAIL") LIKE :email', { email: `%${email.toLowerCase()}%` });
    }

    if (numeroCar) {
      query.andWhere('elegibilidade."CAR_FEDERAL" LIKE :numeroCar', { numeroCar: `%${numeroCar}%` });
    }

    if (status) {
      query.andWhere('elegibilidade."STATUS" = :status', { status });
    }

    if (nomePropriedade) {
      query.andWhere('LOWER(unaccent(elegibilidade.nomePropriedade)) LIKE :nomePropriedade', {
        nomePropriedade: `%${nomePropriedade.toLowerCase()}%`,
      });
    }

    if (cpfCnpj) {
      query.andWhere('elegibilidade."CPF_CNPJ" LIKE :cpfCnpj', { cpfCnpj: `%${cpfCnpj}%` });
    }

    query.orderBy('elegibilidade.dataAtualizacao', 'DESC');

    query.skip((page - 1) * pageSize).take(pageSize);

    return await query.getManyAndCount();
  }

  async validaFrigorifico(frigorifico: FrigorificoRequest, files: Express.Multer.File[]): Promise<void> {
    if (frigorifico.cnpj == null || frigorifico.cnpj == '') {
      throw new NegocioException(422, `Cnpj é obrigatório`);
    } else if (!CnpjValidator.isValidCNPJ(frigorifico.cnpj)) {
      throw new NegocioException(422, `Cnpj é inválido`);
    }


    if ((frigorifico.cep == null || frigorifico.cep == '') || (frigorifico.endereco == null || frigorifico.endereco == '')) {
      throw new NegocioException(422, `Cep e endereço são obrigatoórios`);

    }
    if ((frigorifico.razaoSocial == null || frigorifico.razaoSocial == '') || (frigorifico.nomeFantasia == null || frigorifico.nomeFantasia == '')) {
      throw new NegocioException(422, `Razao social e nome fantasia são obrigatórios`);
    }

    files.map(file => {
      if (file.mimetype != 'application/pdf') {
        throw new NegocioException(422, `Arquivo deve ser do tipo PDF`);
      }
    });

  }

  async consultaElegibilidade(numeroCar: string, email: string): Promise<SolicitacaoElegibilidade> {
    try {
      const carFederal = numeroCar.replace(/[.]/g, '');
      const propriedadeConsulta = await this.consultaRepository.findOne({
        where: { carFederal: carFederal },
      });

      const pessoa = await this.pessoaService.buscaPessoaEmail(email);

      if (!propriedadeConsulta) {
        throw new BadRequestException('CAR não encontrado');
      }

      const solicitacaoExistente = await this.retornoSolicitacao(carFederal);
      if (solicitacaoExistente) {
        return solicitacaoExistente;
      }

      const elegibilidadeRequest = plainToInstance(SolicitacaoElegibilidade, {
        email: pessoa.email,
        cpfCnpj: pessoa.cpfCnpj,
        status: StatusSolicitacaoEligibilidade.Consultado,
        nomePropriedade: propriedadeConsulta.nomePropriedade.toUpperCase(),
        codigoMunicipio: propriedadeConsulta.codigoMunicipio,
        confirmacaoEmail: 'SIM',
        token: randomUUID(),
        carFederal: carFederal,
      });

      const solicitacao = await this.elegibilidadeRepository.save(elegibilidadeRequest);
      return await this.agroToolsService.consultaSolicitacaoFrigorifico(solicitacao);

    } catch (error) {
      throw new NegocioException(error.status, error.message);
    }

  }

  async retornoSolicitacao(car: string) {
    const solicitacao = await this.elegibilidadeRepository.createQueryBuilder('solicitacaoElegibilidade')
      .where('solicitacaoElegibilidade.retornoAgrotools is not null')
      .andWhere('solicitacaoElegibilidade.carFederal =  :car', { car })
      .getOne();
    if (solicitacao) {
      return solicitacao;
    }
    return null;

  }

  async cadastrarProdutor(produtorRequest: ProdutorFrigoficoRequest) {
    const soliciatacao = await this.elegibilidadeRepository.findOne({
      where: { id: produtorRequest.idSolicitacao },
      relations: ['retornoAgrotools', 'retornoAgrotools.deteccoes'],
    });
    if (!soliciatacao) {
      throw new NegocioException(422, 'Solicitação não encontrada');
    }
    if (soliciatacao.status == 'REPROVADO') {
      throw new NegocioException(422, 'Solicitação não elegível');
    }

    if (produtorRequest.idFrogorifico == null) {
      throw new NegocioException(422, 'ID frigorifico é obrigatório');
    }

    try{
      const usuario = await this.usuarioService.criarProdutorFrigorifico(produtorRequest);
      const propriedade = await this.agroToolsService.cadastrarPropriedadeEProprietarioFrigorifico(usuario, soliciatacao);
      let voucherCadastrado: VoucherEntity;
      if (propriedade) {
        const voucher = {
          voucher: randomUUID(),
          status: StatusVoucher.PENDENTE,
          idPropriedade: propriedade.id,
          idFrigorifico: produtorRequest.idFrogorifico,
        } as VoucherEntity;
       voucherCadastrado =  await this.voucherRepository.save(voucher);

        const proprietarios = propriedade.proprietarios.filter(p => p.pessoa.idUsuarioAgrotools != null);
        const territorioBase = await this.consultaTerritorioBase(propriedade.id);

        if (!territorioBase && proprietarios.length > 0) {
          let territorioResponse = await this.agroToolsService.consultarTerritorio(propriedade.id);
          if (!territorioResponse) {
            const territorio = {
              car: propriedade.carFederal,
              vlOwnerCode: propriedade.id.toString(),
              territoryName: propriedade.nomePropriedade,
              producersId: proprietarios.map(p => p.pessoa.idUsuarioAgrotools),
              agents: [{
                name: propriedade.proprietarios[0].pessoa.nome,
                document: propriedade.proprietarios[0].pessoa.cpfCnpj,
              }],
            } as TerritorioAgrotoolsRequest;
            territorioResponse = await this.agroToolsService.criarTerritorio(territorio);
            await this.salvaTerritorio(territorioResponse, propriedade);
          } else {
            await this.salvaTerritorio(territorioResponse, propriedade);
          }
        }
        return voucherCadastrado;
      }
    }catch (error) {
      throw new NegocioException(error.message.status, error.message.message);
    }

  }


  async salvaTerritorio(territorioResponse: TerritorioResponse, propriedade: Propriedade) {
    const territorioEntity = {
      idPropriedade: propriedade.id,
      codigoTerritorio: territorioResponse.cdTerritory,
      codigoAgents: territorioResponse.cdAgents ? territorioResponse.cdAgents.toString() : [],
      car: propriedade.carFederal,
      geometry: territorioResponse.geom,
    } as TerritorioEntity;
    await this.territorioRepository.save(territorioEntity);
  }

  async consultaVoucher(email: string): Promise<VoucherEntity[]> {
    try {
      return await this.voucherRepository.createQueryBuilder('voucher')
        .innerJoinAndSelect('voucher.propriedade', 'propriedade')
        .innerJoin('propriedade.proprietarios', 'proprietario')
        .innerJoin('proprietario.pessoa', 'pessoa')
        .where('pessoa.email = :email', { email: email })
        .getMany();
    } catch (error) {
      throw new NegocioException(422, error.message());
    }
  }

  async ativarVoucher(codigoVoucher: string): Promise<VoucherEntity> {
    const voucher = await this.voucherRepository.createQueryBuilder('voucher')
      .innerJoinAndSelect('voucher.propriedade', 'propriedade')
      .where('voucher.voucher = :codigoVoucher', { codigoVoucher: codigoVoucher })
      .getOne();

    if (voucher) {
      voucher.status = StatusVoucher.ATIVO;
      const propriedade = voucher.propriedade;
      if (propriedade) {
        propriedade.statusVoucher = true;
        propriedade.status = StatusEtapas.Frigorifico.Ativado;
        await this.propriedadeRepository.save(propriedade);
      }
      return await this.voucherRepository.save(voucher);
    } else {
      throw new NegocioException(422, 'Voucher não encontrado');
    }

  }

  async consultarVoucherAcompanhamento(consultaVoucher: ConsultaVoucherRequest, idFrigorifico: number, page = 1, pageSize = 10) {
    try {

      const query = await this.voucherRepository.createQueryBuilder('voucher')
        .innerJoinAndSelect('voucher.propriedade', 'propriedade')
        .innerJoinAndSelect('propriedade.proprietarios', 'proprietario')
        .innerJoinAndSelect('proprietario.pessoa', 'pessoa')
        .where('voucher.idFrigorifico = :idFrigorifico', { idFrigorifico: idFrigorifico });

      await this.validaData(consultaVoucher);

      if (consultaVoucher.dataInicio != null && consultaVoucher.dataInicio != '' && consultaVoucher.dataFim != null) {
        query.andWhere(`voucher.dataCriacao BETWEEN '${moment(consultaVoucher.dataInicio).format('YYYY-MM-DD HH:mm:ss')}' 
        AND '${moment(consultaVoucher.dataFim).format('YYYY-MM-DD HH:mm:ss')}'`);
      }

      if (consultaVoucher.cpfCnpj) {
        query.andWhere('pessoa.cpfCnpj = :cpfCnpj', { cpfCnpj: consultaVoucher.cpfCnpj });
      }

      if (consultaVoucher.numeroCar) {
        query.andWhere('propriedade.carFederal = :numeroCar', { numeroCar: consultaVoucher.numeroCar });
      }

      if (consultaVoucher.email) {
        query.andWhere('pessoa.email = :email', { email: consultaVoucher.email });
      }

      if (consultaVoucher.status) {
        query.andWhere('voucher.status = :status', { status: consultaVoucher.status });
      }

      if (consultaVoucher.nomeProdutor) {
        query.andWhere('LOWER(unaccent(pessoa.nome)) LIKE :nomeProdutor', {
          nomeProdutor: `%${consultaVoucher.nomeProdutor.toLowerCase()}%`,
        });
      }

      query.orderBy('voucher.dataAtualizacao', 'DESC');

      query.skip((page - 1) * pageSize).take(pageSize);

      return query.getManyAndCount();

    } catch (error) {
      throw new NegocioException(error.status, error.message);
    }


  }

  async validaData(consultaVoucher: ConsultaVoucherRequest) {
    if ((consultaVoucher.dataInicio != null && consultaVoucher.dataInicio != '') && (consultaVoucher.dataFim == null || consultaVoucher.dataFim == '')) {
      throw new NegocioException(422, 'Ao preencher período, data inicio e fim são obrigatórias');
    }

    if ((consultaVoucher.dataFim != null && consultaVoucher.dataFim != '') && (consultaVoucher.dataInicio == null || consultaVoucher.dataInicio == '')) {
      throw new NegocioException(422, 'Ao preencher período, data inicio e fim são obrigatórias');
    }
  }

  async consultarFrigorificoUsuarioLogado(email: string): Promise<Frigorifico> {
    const usurio = await this.usuarioService.buscarUsuarioPorEmail(email);
    if (usurio.frigorifico) {
      return usurio.frigorifico;
    } else {
      throw new NegocioException(422, 'Usuario não vinculado a frigorifico.');
    }
  }

  async consultaTerritorioBase(idPropriedade: number): Promise<TerritorioEntity | null> {
    return this.territorioRepository.findOne({
      where: { idPropriedade: idPropriedade },
    });
  }

  async consultarUsuario(email: string): Promise<UsuarioResponse | null> {
    const usuario = await this.usuarioService.buscarUsuarioPorEmail(email);
    return plainToInstance(UsuarioResponse, usuario);
  }


  async associarUsuario(idUsuario: number, idSolicitacaoElegibilidade: number, idFrogorifico: number): Promise<VoucherEntity> {
    const propriedade =  await this.propriedadeRepository.findOne({
      where: { idSolicitacaoElegibilidade: idSolicitacaoElegibilidade },
      relations: ['proprietarios', 'proprietarios.pessoa']
    });

    const usuario = await this.usuarioService.buscarUsuarioPorId(idUsuario);
    if (!usuario) {
      throw new NegocioException(422, 'Usuario não encontrado');
    }

    if(!propriedade){
      const solicitacao = await this.elegibilidadeRepository.findOne({
        where: { id: idSolicitacaoElegibilidade },
        relations: ['retornoAgrotools', 'retornoAgrotools.deteccoes'],
      });
      if(!solicitacao){
        throw new NegocioException(422, 'Solicitação não encontrado');
      }

      const propriedadeSave = await this.agroToolsService.cadastrarPropriedadeEProprietarioFrigorifico(usuario, solicitacao);
      if (!propriedadeSave) {
        throw new NegocioException(422, 'Propriedade não cadastrada');
      }
      return await this.cadastrarVoucher(propriedadeSave, idFrogorifico)
    }else{
      const proprietarios = propriedade.proprietarios;
      const proprietario =      await this.proprietarioRepository.createQueryBuilder('proprietario')
        .innerJoinAndSelect('proprietario.pessoa', 'pessoa')
        .where('pessoa.email = :email', { email: usuario.email })
        .getOne();
      if(!propriedade){
        const proprietario = {
          pessoa: usuario.pessoa,
          telefone: usuario.pessoa.telefone,
          tipoProprietario: TipoProprietatioEnum.PROPRIETARIO,
        } as Proprietario;
        proprietarios.push(await this.proprietarioRepository.save(proprietario));
      }else{
        if (proprietario instanceof Proprietario) {
          proprietarios.push(proprietario);
        }
      }
      return this.cadastrarVoucher(propriedade, idFrogorifico);
    }

  }


    async cadastrarVoucher(propriedade: Propriedade, idFrogorifico: number): Promise<VoucherEntity>{
      const voucher = {
        voucher: randomUUID(),
        status: StatusVoucher.PENDENTE,
        idPropriedade: propriedade.id,
        idFrigorifico: idFrogorifico,
      };
      const proprietarios = propriedade.proprietarios.filter(p => p.pessoa.idUsuarioAgrotools != null);

      if(proprietarios.length == 0){
        throw new NegocioException(422, 'Proprietario não vinculado a agrotools');
      }

      const territorioBase = await this.consultaTerritorioBase(propriedade.id);

      if (!territorioBase) {
        let territorioResponse = await this.agroToolsService.consultarTerritorio(propriedade.id);
        if (!territorioResponse) {
          const territorio = {
            car: propriedade.carFederal,
            vlOwnerCode: propriedade.id.toString(),
            territoryName: propriedade.nomePropriedade,
            producersId: proprietarios.map(p => p.pessoa.idUsuarioAgrotools),
            agents: [{
              name: propriedade.proprietarios[0].pessoa.nome,
              document: propriedade.proprietarios[0].pessoa.cpfCnpj,
            }],
          } as TerritorioAgrotoolsRequest;
          territorioResponse = await this.agroToolsService.criarTerritorio(territorio);
          await this.salvaTerritorio(territorioResponse, propriedade);
        } else {
          await this.salvaTerritorio(territorioResponse, propriedade);
        }
      }
      const voucherBase = await this.voucherRepository.findOne({
        where: { idPropriedade: propriedade.id },
      })
      if(!voucherBase){
        return await this.voucherRepository.save(voucher);
      }
      return voucherBase;

    }



}
