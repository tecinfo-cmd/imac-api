import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PropriedadePremService } from './propriedade-prem.service';
import { ProprietarioPremService } from './proprietario-prem.service';
import { DocumentoUploadService } from '../upload/documento-upload.service';
import { Propriedade } from './entities/propriedade.entity';
import { Endereco } from '../endereco/entities/endereco.entity';
import { CicloProducao } from './entities/ciclo-producao.entity';
import { AtividadePrincipal } from './entities/atividade-principal.entity';
import { Cidade } from '../elegibilidade/entities/cidade.entity';
import { Documento } from '../shared/entity/documento.entity';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DadosBasicosRequest } from './request/dados-basicos-request';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProprietarioProprietarioRequest } from './request/proprietario-proprietario-request';
import { Proprietario } from './entities/proprietario.entity';
import { ConsultaPropriedadeRequest } from './dto/consulta-propriedade-request';
import { ParametrosArquivo } from '../shared/dto/base-upload-request.dto';
import { AuthenticatedRequest } from '../shared/interfaces/authenticated-request.interface';
import { UsuarioService } from '../usuario/usuario.service';
import { PdfService } from '../pdf/pdf-service';
import { AssinaturaService } from '../assinatura/assinatura.service';
import { AutoVistoriaEntity, Vistoria } from './auto-vistoria/entities/auto-vistoria.entity';
import { Etapas, StatusEtapas } from './enum/etapas-status-propriedade.const';
import { DCSStatus } from './dto/validacao-dcs-response';
import NegocioException from '../exception/negocio-exception';
import { PagamentoMulta } from '../cobranca/entities/pagamento-multa.entities';
import { StatusPagamento } from '../shared/enums/enums';

type MockRepository<T> = Partial<Record<string, jest.Mock>>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
  })),
});

const mockProprietarioPremService = {
  cadastraAtualizaProprietario: jest.fn(),
  excluirLigacoesDaPropriedade: jest.fn(),
};

const mockDocumentoUploadService = {
  uploadFiles: jest.fn(),
};

const mockUsuarioService = {
  buscarUsuarioPorEmail: jest.fn(),
};

const mockPdfService = {
  generate: jest.fn(),
};

const mockAssinaturaService = {
  enviarDocumentoParaAssinatura: jest.fn(),
  pegarLinkDocumentoAssinado: jest.fn(),
};

const mockEventEmitter = {
  emitAsync: jest.fn(),
};

describe('PropriedadePremService', () => {
  let service: PropriedadePremService;
  let propriedadeRepository: MockRepository<Propriedade>;
  let enderecoRepository: MockRepository<Endereco>;
  let documentoRepository: MockRepository<Documento>;
  let cicloProducaoRepository: MockRepository<CicloProducao>;
  let atividadePrincipalRepository: MockRepository<AtividadePrincipal>;
  let cidadeRepository: MockRepository<Cidade>;
  let documentoPropriedadeRepository: MockRepository<Documento>;
  let proprietarioService: typeof mockProprietarioPremService;
  let documentoUploadService: typeof mockDocumentoUploadService;
  let pdfService: typeof mockPdfService;
  let assinaturaService: typeof mockAssinaturaService;
  let autoVistoriaRepository: MockRepository<AutoVistoriaEntity>;
  let pagamentoMultaRepository: MockRepository<PagamentoMulta>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropriedadePremService,
        { provide: getRepositoryToken(Propriedade), useFactory: createMockRepository },
        { provide: getRepositoryToken(Endereco), useFactory: createMockRepository },
        { provide: getRepositoryToken(CicloProducao), useFactory: createMockRepository },
        { provide: getRepositoryToken(AtividadePrincipal), useFactory: createMockRepository },
        { provide: getRepositoryToken(Cidade), useFactory: createMockRepository },
        { provide: getRepositoryToken(Documento), useFactory: createMockRepository },
        { provide: getRepositoryToken(AutoVistoriaEntity), useFactory: createMockRepository },
        { provide: getRepositoryToken(PagamentoMulta), useFactory: createMockRepository },
        { provide: ProprietarioPremService, useValue: mockProprietarioPremService },
        { provide: DocumentoUploadService, useValue: mockDocumentoUploadService },
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: PdfService, useValue: mockPdfService },
        { provide: AssinaturaService, useValue: mockAssinaturaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<PropriedadePremService>(PropriedadePremService);
    propriedadeRepository = module.get(getRepositoryToken(Propriedade));
    enderecoRepository = module.get(getRepositoryToken(Endereco));
    cicloProducaoRepository = module.get(getRepositoryToken(CicloProducao));
    atividadePrincipalRepository = module.get(getRepositoryToken(AtividadePrincipal));
    cidadeRepository = module.get(getRepositoryToken(Cidade));
    documentoRepository = module.get(getRepositoryToken(Documento));
    proprietarioService = module.get(ProprietarioPremService);
    documentoUploadService = module.get(DocumentoUploadService);
    pdfService = module.get<PdfService>(PdfService) as any;
    assinaturaService = module.get<AssinaturaService>(AssinaturaService) as any;
    autoVistoriaRepository = module.get(getRepositoryToken(AutoVistoriaEntity));
    pagamentoMultaRepository = module.get(getRepositoryToken(PagamentoMulta));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('listarAtividadePrincipal', () => {
    it('should return a list of AtividadePrincipal', async () => {
      const expectedResult: AtividadePrincipal[] = [{ id: 1, nome: 'Agricultura', descricao: 'Fazenda' } as AtividadePrincipal];
      atividadePrincipalRepository.find!.mockResolvedValue(expectedResult);
      const result = await service.listarAtividadePrincipal();
      expect(result).toEqual(expectedResult);
      expect(atividadePrincipalRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('listarCicloProducao', () => {
    it('should return a list of CicloProducao', async () => {
      const expectedResult: CicloProducao[] = [{ id: 1, nome: 'Anual', descricao: 'Fazenda' } as CicloProducao];
      cicloProducaoRepository.find!.mockResolvedValue(expectedResult);
      const result = await service.listarCicloProducao();
      expect(result).toEqual(expectedResult);
      expect(cicloProducaoRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('cadastrarPropriedade', () => {
    it('should save and return the property', async () => {
      const propriedadeInput = { nomePropriedade: 'Fazenda Teste' } as Propriedade;
      const expectedResult = {...propriedadeInput } as Propriedade;
      propriedadeRepository.save!.mockResolvedValue(expectedResult);

      const result = await service.cadastrarPropriedade(propriedadeInput);

      expect(result).toEqual(expectedResult);
      expect(propriedadeRepository.save).toHaveBeenCalledWith(propriedadeInput);
    });

    it('should throw BadRequestException on repository error', async () => {
      const propriedadeInput = { nomePropriedade: 'Fazenda Teste' } as Propriedade;
      const errorMessage = 'Database error';
      propriedadeRepository.save!.mockRejectedValue({ message: errorMessage });

      await expect(service.cadastrarPropriedade(propriedadeInput))
        .rejects.toThrow(new BadRequestException(JSON.stringify(errorMessage)));
    });
  });

  describe('cadastraProprietario', () => {
    const idPropriedade = 1;
    const proprietarioRequest: ProprietarioProprietarioRequest[] = [
      { nome: 'Prop 1', email: 'prop1@test.com' } as ProprietarioProprietarioRequest,
      { nome: 'Prop 2', email: 'prop2@test.com' } as ProprietarioProprietarioRequest,
    ];
    const mockProprietario1 = { id: 10, pessoa: { id: 100 } } as Proprietario;
    const mockProprietario2 = { id: 11, pessoa: { id: 101 } } as Proprietario;
    const mockPropriedade = {
      id: idPropriedade,
      carFederal: '123456789',
      nomePropriedade: 'Fazenda Teste',
      proprietarios: [],
      voucher: '123',
      statusVoucher: true,
      tamanhoPropriedade: 100,
      numeroProprietarios: 2,
      idClicloProducao: 1,
      idAtividadePrincipal: 2,
      moduloFiscal: 1,
      documentos: [],
      cidade: {
        id: 1,
        nome: 'Cuiabá',
        uf: 'MT',
        codigo: 5103403
      }
    } as unknown as Propriedade;
    const expectedSuccessResponse = { sucesso: true, mensagem: 'Dados atualizados com sucesso' };

    it('should call proprietarioService, find property, save property with new owners, and return success', async () => {
      proprietarioService.cadastraAtualizaProprietario
        .mockResolvedValueOnce(mockProprietario1)
        .mockResolvedValueOnce(mockProprietario2);
      jest.spyOn(service, 'consultaPropriedadePorId').mockResolvedValue(mockPropriedade);
      propriedadeRepository.save!.mockResolvedValue({ ...mockPropriedade, proprietarios: [mockProprietario1, mockProprietario2] });

      const result = await service.cadastraProprietario(idPropriedade, proprietarioRequest);

      expect(proprietarioService.cadastraAtualizaProprietario).toHaveBeenCalledTimes(2);
      expect(proprietarioService.cadastraAtualizaProprietario).toHaveBeenCalledWith(proprietarioRequest[0]);
      expect(proprietarioService.cadastraAtualizaProprietario).toHaveBeenCalledWith(proprietarioRequest[1]);
      expect(service.consultaPropriedadePorId).toHaveBeenCalledWith(idPropriedade);
      expect(propriedadeRepository.save).toHaveBeenCalledWith({ ...mockPropriedade, proprietarios: [mockProprietario1, mockProprietario2] });
      expect(result).toEqual(expectedSuccessResponse);
    });

    it('should throw NegocioException if property is not found', async () => {
      proprietarioService.cadastraAtualizaProprietario.mockResolvedValue(mockProprietario1);
      jest.spyOn(service, 'consultaPropriedadePorId').mockResolvedValue(null); // Property not found

      await expect(service.cadastraProprietario(idPropriedade, proprietarioRequest))
        .rejects.toThrow("Propriedade não encontrada");

      expect(proprietarioService.cadastraAtualizaProprietario).toHaveBeenCalled(); // Service is called before check
      expect(propriedadeRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException on error during proprietarioService call', async () => {
      const errorMessage = 'Error saving proprietario';
      proprietarioService.cadastraAtualizaProprietario.mockRejectedValue({ message: errorMessage });

      await expect(service.cadastraProprietario(idPropriedade, proprietarioRequest))
        .rejects.toThrow(new BadRequestException(JSON.stringify(errorMessage)));
    });
  });

  describe('atualizaDadosBasicos', () => {
    const idPropriedade = 1;
    const dadosBasicosRequest: DadosBasicosRequest = {
      endereco: { 
        id: 1,
        rua: 'Rua Teste',
        numero: '123',
        cep: '123',
        municipio: 'Cuiabá',
        estado: 'MT',
        logradouro: 'Rua Teste'
      } as Endereco,
      tamanhoPropriedade: 100,
      numeroProprietarios: 2,
      idCicloProducao: 1,
      idAtividadePrincipal: 2,
    };
    const mockEnderecoSaved = { id: 5, ...dadosBasicosRequest.endereco } as Endereco;
    const mockPropriedadeFound = { id: idPropriedade, nomePropriedade: 'Antiga' } as Propriedade;
    const expectedSuccessResponse = { sucesso: true, mensagem: 'Dados atualizados com sucesso' };

    it('should save endereco, find property, update property, save, and return success', async () => {
      enderecoRepository.save!.mockResolvedValue(mockEnderecoSaved);
      jest.spyOn(service, 'consultaPropriedadePorId').mockResolvedValue(mockPropriedadeFound);
      propriedadeRepository.save!.mockResolvedValue({ ...mockPropriedadeFound, /* updated fields */ });

      const result = await service.atualizaDadosBasicos(idPropriedade, dadosBasicosRequest, {} as AuthenticatedRequest);

      expect(enderecoRepository.save).toHaveBeenCalledWith(dadosBasicosRequest.endereco);
      expect(service.consultaPropriedadePorId).toHaveBeenCalledWith(idPropriedade, {} as AuthenticatedRequest);
      expect(propriedadeRepository.save).toHaveBeenCalledWith({ 
        ...mockPropriedadeFound,
        endereco: mockEnderecoSaved,
        tamanhoPropriedade: dadosBasicosRequest.tamanhoPropriedade,
        numeroProprietarios: dadosBasicosRequest.numeroProprietarios,
        idClicloProducao: dadosBasicosRequest.idCicloProducao,
        idAtividadePrincipal: dadosBasicosRequest.idAtividadePrincipal,
      });
      expect(result).toEqual(expectedSuccessResponse);
    });

    it('should throw NegocioException if property is not found', async () => {
      enderecoRepository.save!.mockResolvedValue(mockEnderecoSaved);
      jest.spyOn(service, 'consultaPropriedadePorId').mockResolvedValue(null); // Property not found

      await expect(service.atualizaDadosBasicos(idPropriedade, dadosBasicosRequest, {} as AuthenticatedRequest))
        .rejects.toThrow("Propriedade não encontrada");

      expect(enderecoRepository.save).toHaveBeenCalled(); // Endereco is saved before check
      expect(service.consultaPropriedadePorId).toHaveBeenCalledWith(idPropriedade, {} as AuthenticatedRequest);
      expect(propriedadeRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException on error during endereco save', async () => {
      const errorMessage = 'Error saving endereco';
      enderecoRepository.save!.mockRejectedValue({ message: errorMessage });

      await expect(service.atualizaDadosBasicos(idPropriedade, dadosBasicosRequest, {} as AuthenticatedRequest))
        .rejects.toThrow(new BadRequestException(JSON.stringify(errorMessage)));
    });
  });

  describe('consultaPropriedadeFiltro', () => {
    const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn(),
        getOne: jest.fn(),
        getMany: jest.fn(),
        getManyAndCount: jest.fn().mockReturnValue([[], 0]),
    };

    beforeEach(() => {
        propriedadeRepository.createQueryBuilder!.mockReturnValue(mockQueryBuilder as any);
    })

    it('should build query with nomePropriedade filter', async () => {
      const filtro: ConsultaPropriedadeRequest = { nomePropriedade: 'Test' };
      const request = { user: { email: 'test@example.com', roles: ['PRODUTOR'] } } as AuthenticatedRequest;
      mockUsuarioService.buscarUsuarioPorEmail.mockReturnValue({ roles: [{ nome: 'PRODUTOR'}]});

      await service.consultaPropriedadeFiltro(filtro, request);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('pessoa.email = :email', { email: request.user.email });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('LOWER(pr.nomePropriedade) LIKE :nomePropriedade', { nomePropriedade: `%${filtro.nomePropriedade!.toLowerCase()}%` });
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      
    });

     it('should build query with carFederal filter (removing dots)', async () => {
      const filtro: ConsultaPropriedadeRequest = { carFederal: '123.456.789' };
      const request = { user: { email: 'test@example.com', roles: ['PRODUTOR'] } } as AuthenticatedRequest;
            mockUsuarioService.buscarUsuarioPorEmail.mockReturnValue({ roles: [{ nome: 'PRODUTOR'}]});

      await service.consultaPropriedadeFiltro(filtro, request);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('pessoa.email = :email', { email: request.user.email });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('pr.carFederal = :carFederal', { carFederal: '123456789' });
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      
    });

     it('should build query with codigoMunicipio filter', async () => {
      const filtro: ConsultaPropriedadeRequest = { codigoMunicipio: 123 };
      const request = { user: { email: 'test@example.com', roles: ['PRODUTOR'] } } as AuthenticatedRequest;
      mockUsuarioService.buscarUsuarioPorEmail.mockReturnValue({ roles: [{ nome: 'PRODUTOR'}]});

       await service.consultaPropriedadeFiltro(filtro, request);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('pessoa.email = :email', { email: request.user.email });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('pr.codigoMunicipio = :codigoMunicipio', { codigoMunicipio: filtro.codigoMunicipio });
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });

     it('should build query with multiple filters for non-analista user', async () => {
      const filtro: ConsultaPropriedadeRequest = {
        nomePropriedade: 'Test',
        carFederal: '123.456.789',
        codigoMunicipio: 123,
        statusVoucher: true,
      };
      const request = { user: { email: 'test@example.com', roles: ['PRODUTOR'] } } as AuthenticatedRequest;
      mockUsuarioService.buscarUsuarioPorEmail.mockReturnValue({ roles: [{ nome: 'PRODUTOR'}]});

      await service.consultaPropriedadeFiltro(filtro, request);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('pessoa.email = :email', { email: request.user.email });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('LOWER(pr.nomePropriedade) LIKE :nomePropriedade', { nomePropriedade: `%${filtro.nomePropriedade!.toLowerCase()}%` });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('pr.carFederal = :carFederal', { carFederal: '123456789' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('pr.codigoMunicipio = :codigoMunicipio', { codigoMunicipio: filtro.codigoMunicipio });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('pr.statusVoucher = :statusVoucher', { statusVoucher: filtro.statusVoucher });
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });

    it('should not add email filter if user is an ANALISTA', async () => {
      const filtro: ConsultaPropriedadeRequest = {};
      const request = { user: { email: 'analista@test.com', roles: ['ANALISTA'] } } as AuthenticatedRequest;
      mockUsuarioService.buscarUsuarioPorEmail.mockReturnValue({ roles: [{ nome: 'ANALISTA'}]});


      await service.consultaPropriedadeFiltro(filtro, request);

      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });

    it('should add email filter if user is not an ANALISTA', async () => {
      const filtro: ConsultaPropriedadeRequest = {};
      const request = { user: { email: 'produtor@test.com', roles: ['PRODUTOR'] } } as AuthenticatedRequest;
      mockUsuarioService.buscarUsuarioPorEmail.mockReturnValue({ roles: [{ nome: 'PRODUTOR'}]});

      await service.consultaPropriedadeFiltro(filtro, request);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('pessoa.email = :email', { email: request.user.email });
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });

    it('should return empty array and 0 total on error', async () => {
      const filtro: ConsultaPropriedadeRequest = {};
      const request = { user: { email: 'test@example.com', roles: ['PRODUTOR'] } } as AuthenticatedRequest;
      mockUsuarioService.buscarUsuarioPorEmail.mockReturnValue({ roles: [{ nome: 'PRODUTOR'}]});
      mockQueryBuilder.getManyAndCount.mockRejectedValue(new Error('Database error'));

      expect(service.consultaPropriedadeFiltro(filtro, request)).rejects.toThrow(new Error('Database error'));
    });
  });

  describe('consultaCidadePorNome', () => {
     const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
    };

    beforeEach(() => {
        cidadeRepository.createQueryBuilder!.mockReturnValue(mockQueryBuilder as any);
    });

    it('should query cities in MT without name filter', async () => {
        const expectedResult: Cidade[] = [{ id: 1, nome: 'Cuiaba', uf: 'MT' } as Cidade];
        mockQueryBuilder.getMany.mockResolvedValue(expectedResult);

        const result = await service.consultaCidadePorNome(); // No name provided

        expect(cidadeRepository.createQueryBuilder).toHaveBeenCalledWith('cidade');
        expect(mockQueryBuilder.where).toHaveBeenCalledWith('cidade.uf  = :uf', { uf: 'MT' });
        expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
        expect(mockQueryBuilder.getMany).toHaveBeenCalled();
        expect(result).toEqual(expectedResult);
    });

    it('should query cities in MT with name filter (case-insensitive, accent-insensitive)', async () => {
        const nome = 'Cuiabá';
        const expectedResult: Cidade[] = [{ id: 1, nome: 'Cuiaba', uf: 'MT' } as Cidade];
        mockQueryBuilder.getMany.mockResolvedValue(expectedResult);

        const result = await service.consultaCidadePorNome(nome);

        expect(cidadeRepository.createQueryBuilder).toHaveBeenCalledWith('cidade');
        expect(mockQueryBuilder.where).toHaveBeenCalledWith('cidade.uf  = :uf', { uf: 'MT' });
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('LOWER(unaccent(cidade.nome)) LIKE :nome', { nome: `cuiaba` });
        expect(mockQueryBuilder.getMany).toHaveBeenCalled();
        expect(result).toEqual(expectedResult);
    });
  });

  describe('consultaPropriedadePorId', () => {
    it('should call findOne with correct id and relations', async () => {
      const id = 1;
      const expectedResult = { id: 1, nomePropriedade: 'Teste' } as Propriedade;
      
      propriedadeRepository.findOne!.mockResolvedValue(expectedResult);
      const request = { user: { roles: ['ADMIN'] } } as AuthenticatedRequest;
      const result = await service.consultaPropriedadePorId(id, request);
      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({
        where: { id, proprietarios: undefined },
        relations: [
        'proprietarios',
        'endereco',
        'cidade',
        'solicitacaoElegibilidade',
        'proprietarios.pessoa',
        'documentos',
        'documentos.usuarioUpload',
        'analista',
        'retornoAnalises',
        'retornoAnalises.documentos',
        'retornoAnalises.deteccoes',
        'retornoAnalises.contestacaoAutorizacaoSupressao',
        'retornoAnalises.contestacaoAutorizacaoSupressao.responsavelTecnico',
        'retornoAnalises.contestacaoAutorizacaoSupressao.documentos',
        'retornoAnalises.contestacaoAutorizacaoSupressao.autorizacoesSupressoes',
        'retornoAnalises.contestacaoAutorizacaoSupressao.autorizacoesSupressoes.tipo',
        'retornoAnalises.contestacaoAutorizacaoSupressao.autorizacoesSupressoes.orgaoEmissor',
        'retornoAnalises.contestacaoAutorizacaoSupressao.autorizacoesSupressoes.documentos',
        'retornoAnalises.contestacaoLaudo',
        'retornoAnalises.contestacaoLaudo.responsavelTecnico',
        'retornoAnalises.contestacaoLaudo.documentos',
        'territorios',
        'vouches',
        'retornoAnalises.planoAdequacao',
        'retornoAnalises.planoAdequacao.responsavelTecnico',
        'retornoAnalises.planoAdequacao.documentos',
        'atividadePrincipal',
        'cicloProducao'
      ]
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('consultaPorProprietario', () => {
     const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
    };

    beforeEach(() => {
        propriedadeRepository.createQueryBuilder!.mockReturnValue(mockQueryBuilder as any);
    });

    it('should throw BadRequestException if email is null or empty', async () => {
      await expect(service.consultaPorProprietario(null as any))
        .rejects.toThrow(new BadRequestException('Nenhum email informado.'));
      await expect(service.consultaPorProprietario(''))
        .rejects.toThrow(new BadRequestException('Nenhum email informado.'));
    });

    it('should build query with email filter', async () => {
      const email = 'test@example.com';
      const expectedResult: Propriedade[] = [{ id: 1, nomePropriedade: 'Teste' } as Propriedade];
      mockQueryBuilder.getMany.mockResolvedValue(expectedResult);

      const result = await service.consultaPorProprietario(email);

      expect(propriedadeRepository.createQueryBuilder).toHaveBeenCalledWith('pr');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(9);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('pessoa.email = :email', { email: email });
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('uploadDocumentos', () => {
    const idPropriedade = 1;
    const userEmail = 'owner@test.com';
    const analistaEmail = 'analista@test.com';
    const otherEmail = 'other@test.com';
    const mockFiles: Express.Multer.File[] = [{ originalname: 'doc1.pdf' } as any];
    const mockParametros: ParametrosArquivo[] = [{ nome: 'doc1.pdf', tipo: 'TEST_TIPO' }];
    const mockUsuarioProdutor = { id: 1, email: userEmail };
    const mockUsuarioAnalista = { id: 2, email: analistaEmail };
    const mockUsuarioOutro = { id: 3, email: otherEmail };

    const mockPropriedadeFound = {
      id: idPropriedade,
      nomePropriedade: 'Fazenda Teste',
      proprietarios: [{ pessoa: { nome: 'Produtor Teste', email: userEmail } } as Proprietario],
      analista: { id: 2, email: analistaEmail, pessoa: { nome: 'Analista Teste' } }
    } as Propriedade;

    const mockPropriedadeNoMatch = {
      id: idPropriedade,
      proprietarios: [{ pessoa: { email: 'another@test.com' } } as Proprietario],
      analista: { id: 99, email: 'anotheranalista@test.com' }
    } as Propriedade;

    const mockUploadResult = [{ filename: 'uuid-doc1.pdf', url: 'http://s3/uuid-doc1.pdf', originalName: 'doc1.pdf' }];
    const mockSavedDocs = [{ 
      id: 100, 
      nomeArquivo: 'uuid-doc1.pdf', 
      urlArquivo: 'http://s3/uuid-doc1.pdf', 
      tipo: 'TEST_TIPO',
      nomeArquivoOriginal: 'doc1.pdf'
    } as Documento];

    it('should allow owner to upload files, save documents, emit event and return saved documents', async () => {
      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedadeFound);
      mockUsuarioService.buscarUsuarioPorEmail.mockResolvedValue(mockUsuarioProdutor);
      documentoUploadService.uploadFiles.mockResolvedValue(mockUploadResult);
      documentoRepository.save!.mockResolvedValue(mockSavedDocs);

      const result = await service.uploadDocumentos(idPropriedade, userEmail, mockFiles, mockParametros);

      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({
        where: { id: idPropriedade },
        relations: ["proprietarios", "proprietarios.pessoa", "analista", "analista.pessoa"]
      });
      expect(mockUsuarioService.buscarUsuarioPorEmail).toHaveBeenCalledWith(userEmail);
      expect(documentoUploadService.uploadFiles).toHaveBeenCalledWith(mockFiles);
      expect(documentoRepository.save).toHaveBeenCalledWith([{
        idUsuarioUpload: mockUsuarioProdutor.id,
        nomeArquivo: mockUploadResult[0].filename,
        nomeArquivoOriginal: mockUploadResult[0].originalName,
        urlArquivo: mockUploadResult[0].url,
        propriedades: [mockPropriedadeFound],
        tipo: mockParametros[0].tipo,
      }]);
      expect(mockEventEmitter.emitAsync).toHaveBeenCalled();
      expect(result).toEqual(mockSavedDocs);
    });

    it('should allow assigned analyst to upload files, save documents, emit event and return saved documents', async () => {
      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedadeFound);
      mockUsuarioService.buscarUsuarioPorEmail.mockResolvedValue(mockUsuarioAnalista);
      documentoUploadService.uploadFiles.mockResolvedValue(mockUploadResult);
      documentoRepository.save!.mockResolvedValue(mockSavedDocs);

      const result = await service.uploadDocumentos(idPropriedade, analistaEmail, mockFiles, mockParametros);

      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({
        where: { id: idPropriedade },
        relations: ["proprietarios", "proprietarios.pessoa", "analista", "analista.pessoa"]
      });
      expect(mockUsuarioService.buscarUsuarioPorEmail).toHaveBeenCalledWith(analistaEmail);
      expect(documentoUploadService.uploadFiles).toHaveBeenCalledWith(mockFiles);
      expect(documentoRepository.save).toHaveBeenCalledWith([{
        idUsuarioUpload: mockUsuarioAnalista.id,
        nomeArquivo: mockUploadResult[0].filename,
        nomeArquivoOriginal: mockUploadResult[0].originalName,
        urlArquivo: mockUploadResult[0].url,
        propriedades: [mockPropriedadeFound],
        tipo: mockParametros[0].tipo
      }]);
      expect(mockEventEmitter.emitAsync).toHaveBeenCalled();
      expect(result).toEqual(mockSavedDocs);
    });

    it('should throw BadRequestException if property not found', async () => {
      propriedadeRepository.findOne!.mockResolvedValue(null);

      await expect(service.uploadDocumentos(idPropriedade, userEmail, mockFiles, mockParametros))
        .rejects.toThrow(new BadRequestException("Propriedade não encontrada"));

      expect(mockUsuarioService.buscarUsuarioPorEmail).not.toHaveBeenCalled();
      expect(documentoUploadService.uploadFiles).not.toHaveBeenCalled();
      expect(documentoRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user is not owner or assigned analyst', async () => {
       propriedadeRepository.findOne!.mockResolvedValue(mockPropriedadeNoMatch);
        mockUsuarioService.buscarUsuarioPorEmail.mockResolvedValue(mockUsuarioOutro);

      await expect(service.uploadDocumentos(idPropriedade, otherEmail, mockFiles, mockParametros))
        .rejects.toThrow(new BadRequestException("Sem permissão para subir documentos para esta propriedade"));

      expect(mockUsuarioService.buscarUsuarioPorEmail).toHaveBeenCalledWith(otherEmail);
      expect(documentoUploadService.uploadFiles).not.toHaveBeenCalled();
      expect(documentoRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if upload service fails', async () => {
      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedadeFound);
      mockUsuarioService.buscarUsuarioPorEmail.mockResolvedValue(mockUsuarioProdutor);
      const uploadError = new Error('S3 Error');
      documentoUploadService.uploadFiles.mockRejectedValue(uploadError);

      await expect(service.uploadDocumentos(idPropriedade, userEmail, mockFiles, mockParametros))
        .rejects.toThrow(InternalServerErrorException);

      expect(documentoRepository.save).not.toHaveBeenCalled();
    });

     it('should throw InternalServerErrorException if document save fails', async () => {
      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedadeFound);
      mockUsuarioService.buscarUsuarioPorEmail.mockResolvedValue(mockUsuarioProdutor);
      documentoUploadService.uploadFiles.mockResolvedValue(mockUploadResult);
      const saveError = new Error('DB Save Error');
      documentoRepository.save!.mockRejectedValue(saveError);

      await expect(service.uploadDocumentos(idPropriedade, userEmail, mockFiles, mockParametros))
        .rejects.toThrow(InternalServerErrorException);

    });
  });

  describe('deletar', () => {
    const idPropriedade = 1;

    it('should soft delete a property by changing its status to Inativa', async () => {
      const mockPropriedade = { id: idPropriedade, status: 'Ativa', etapa: 'Cadastro' } as Propriedade;
      propriedadeRepository.findOneBy!.mockResolvedValue(mockPropriedade);
      propriedadeRepository.save!.mockResolvedValue({ ...mockPropriedade, status: StatusEtapas.Desativada.Inativa, etapa: Etapas.Desativada });

      await service.deletar(idPropriedade);

      expect(propriedadeRepository.findOneBy).toHaveBeenCalledWith({ id: idPropriedade });
      expect(propriedadeRepository.save).toHaveBeenCalledWith({
        ...mockPropriedade,
        status: StatusEtapas.Desativada.Inativa,
        etapa: Etapas.Desativada,
      });
    });

    it('should throw NegocioException if property is not found', async () => {
      propriedadeRepository.findOneBy!.mockResolvedValue(null);

      await expect(service.deletar(idPropriedade))
        .rejects.toThrow(new NegocioException(422, 'Propriedade não encontrada'));

      expect(propriedadeRepository.findOneBy).toHaveBeenCalledWith({ id: idPropriedade });
      expect(propriedadeRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if property is already inactive', async () => {
      const mockPropriedade = { id: idPropriedade, status: 'Inativa', etapa: 'Desativada' } as Propriedade;
      propriedadeRepository.findOneBy!.mockResolvedValue(mockPropriedade);

      await expect(service.deletar(idPropriedade))
        .rejects.toThrow(new BadRequestException('Propriedade já inativada.'));

      expect(propriedadeRepository.findOneBy).toHaveBeenCalledWith({ id: idPropriedade });
      expect(propriedadeRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('aceitarTermoAdequacao', () => {
    const idPropriedade = 1;
    const mockPropriedade = {
      id: idPropriedade,
      idTermoCompromisso: null,
      termoAdequacaoAceito: false,
      proprietarios: [{ pessoa: { email: 'test@test.com' } }],
      cidade: { id: 1, nome: 'Cuiaba', uf: 'MT' },
      endereco: { logradouro: 'Rua Teste', numero: '123' } as unknown as Endereco,
      analise: { deteccoes: [] },
    } as unknown as Propriedade;

    it('should accept the adequacy term successfully', async () => {
      const idTermoCompromisso = 'uuid-termo';
      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedade);
      pdfService.generate.mockResolvedValue(Buffer.from('pdf-content'));
      assinaturaService.enviarDocumentoParaAssinatura.mockResolvedValue(idTermoCompromisso);
      propriedadeRepository.save!.mockImplementation(p => Promise.resolve(p));

      // Mock a chamada interna para uploadDocumentos
      jest.spyOn(service, 'uploadDocumentos').mockResolvedValue([]);

      const result = await service.aceitarTermoAdequacao(idPropriedade);

      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({ where: { id: idPropriedade }, relations: expect.any(Array) });
      expect(pdfService.generate).toHaveBeenCalledTimes(2); // DCS e Termo
      expect(assinaturaService.enviarDocumentoParaAssinatura).toHaveBeenCalled();
      expect(propriedadeRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        idTermoCompromisso,
        etapa: Etapas.Termo,
        status: StatusEtapas[Etapas.Termo].Enviado,
      }));
      expect(result.idTermoCompromisso).toBe(idTermoCompromisso);
    });

    it('should throw BadRequestException if property is not found', async () => {
      propriedadeRepository.findOne!.mockResolvedValue(null);
      await expect(service.aceitarTermoAdequacao(idPropriedade)).rejects.toThrow(new BadRequestException('Propriedade não encontrada.'));
    });

    it('should throw BadRequestException if term is already sent or signed', async () => {
      propriedadeRepository.findOne!.mockResolvedValue({ ...mockPropriedade, idTermoCompromisso: 'existing-uuid' });
      await expect(service.aceitarTermoAdequacao(idPropriedade)).rejects.toThrow(new BadRequestException('Termo de adequação já enviado ou assinado.'));
    });
  });

  describe('termoCompromissoAssinado', () => {
    const idTermoCompromisso = 'uuid-termo';
    const email = 'test@test.com';
    const mockPropriedade = {
      id: 1,
      idTermoCompromisso,
      termoAdequacaoAceito: false,
    } as Propriedade;

    it('should mark term as signed successfully', async () => {
      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedade);
      propriedadeRepository.save!.mockImplementation(p => Promise.resolve(p));

      await service.termoCompromissoAssinado(idTermoCompromisso, email);

      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({ where: { idTermoCompromisso, proprietarios: { pessoa: { email } } } });
      expect(propriedadeRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        termoAdequacaoAceito: true,
        etapa: Etapas.Termo,
        status: StatusEtapas[Etapas.Termo].Assinado,
      }));
    });

    it('should throw BadRequestException if property is not found', async () => {
      propriedadeRepository.findOne!.mockResolvedValue(null);
      await expect(service.termoCompromissoAssinado(idTermoCompromisso, email)).rejects.toThrow(new BadRequestException('Propriedade não encontrada.'));
    });

    it('should throw BadRequestException if term is already accepted', async () => {
      propriedadeRepository.findOne!.mockResolvedValue({ ...mockPropriedade, termoAdequacaoAceito: true });
      await expect(service.termoCompromissoAssinado(idTermoCompromisso, email)).rejects.toThrow(new BadRequestException('Termo de compromisso já aceito.'));
    });
  });

  describe('validarDCS', () => {
    const idPropriedade = 1;
    const mockPropriedadeBase = {
      id: idPropriedade,
      carFederal: 'CAR123',
      nomePropriedade: 'Fazenda Teste',
      proprietarios: [{ pessoa: { cpfCnpj: '123456' } }],
      documentos: [],
      dataCriacao: new Date(),
      analise: { deteccoes: [] },
    } as unknown as Propriedade;

    it('should throw BadRequestException if no parameter is provided', async () => {
      await expect(service.validarDCS()).rejects.toThrow(new BadRequestException('É preciso passar pelo menos um parâmetro: idPropriedade ou carFederal'));
    });

    it('should throw BadRequestException if property is not found', async () => {
      propriedadeRepository.findOne!.mockResolvedValue(null);
      await expect(service.validarDCS(idPropriedade)).rejects.toThrow(new BadRequestException('Propriedade não encontrada.'));
    });

    it('should return status APTO when all conditions are met', async () => {
      const mockPropriedade = {
        ...mockPropriedadeBase,
        statusVoucher: true,
        termoAdequacaoAceito: true,
      } as Propriedade;
      const mockAutoVistoria = {
        vistoria: Vistoria.Deferido,
      } as AutoVistoriaEntity;

      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedade);
      autoVistoriaRepository.findOne!.mockResolvedValue(mockAutoVistoria);
      pagamentoMultaRepository.findOne!.mockResolvedValue(null); // No overdue fines

      const result = await service.validarDCS(idPropriedade);

      expect(result.status).toBe(DCSStatus.Apto);
      expect(result.id).toBe(idPropriedade);
      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({ where: [{ id: idPropriedade }, { carFederal: undefined }], relations: expect.any(Array) });
      expect(autoVistoriaRepository.findOne).toHaveBeenCalledWith({
        where: { propriedade: { id: idPropriedade } },
        order: { dataTermino: 'DESC' }
      });
      expect(pagamentoMultaRepository.findOne).toHaveBeenCalledWith({
        where: { propriedade: { id: idPropriedade }, status: StatusPagamento.VENCIDO },
      });
    });

    it('should return status SUSPENSO if voucher is not paid', async () => {
      const mockPropriedade = {
        ...mockPropriedadeBase,
        statusVoucher: false, // Not paid
        termoAdequacaoAceito: true,
      } as Propriedade;
      const mockAutoVistoria = {
        vistoria: Vistoria.Deferido,
      } as AutoVistoriaEntity;

      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedade);
      autoVistoriaRepository.findOne!.mockResolvedValue(mockAutoVistoria);
      pagamentoMultaRepository.findOne!.mockResolvedValue(null);

      const result = await service.validarDCS(idPropriedade);

      expect(result.status).toBe(DCSStatus.Suspenso);
    });

    it('should return status SUSPENSO if term is not accepted', async () => {
      const mockPropriedade = {
        ...mockPropriedadeBase,
        statusVoucher: true,
        termoAdequacaoAceito: false, // Not accepted
      } as Propriedade;
      const mockAutoVistoria = {
        vistoria: Vistoria.Deferido,
      } as AutoVistoriaEntity;

      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedade);
      autoVistoriaRepository.findOne!.mockResolvedValue(mockAutoVistoria);
      pagamentoMultaRepository.findOne!.mockResolvedValue(null);

      const result = await service.validarDCS(idPropriedade);

      expect(result.status).toBe(DCSStatus.Suspenso);
    });

    it('should return status SUSPENSO if auto-vistoria is not approved', async () => {
      const mockPropriedade = {
        ...mockPropriedadeBase,
        statusVoucher: true,
        termoAdequacaoAceito: true,
      } as Propriedade;
      const mockAutoVistoria = {
        vistoria: Vistoria.Indeferido, // Not approved
      } as AutoVistoriaEntity;

      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedade);
      autoVistoriaRepository.findOne!.mockResolvedValue(mockAutoVistoria);
      pagamentoMultaRepository.findOne!.mockResolvedValue(null);

      const result = await service.validarDCS(idPropriedade);

      expect(result.status).toBe(DCSStatus.Suspenso);
    });

    it('should return status SUSPENSO if there is no auto-vistoria', async () => {
      const mockPropriedade = {
        ...mockPropriedadeBase,
        statusVoucher: true,
        termoAdequacaoAceito: true,
      } as Propriedade;

      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedade);
      autoVistoriaRepository.findOne!.mockResolvedValue(null); // No vistoria
      pagamentoMultaRepository.findOne!.mockResolvedValue(null);

      const result = await service.validarDCS(idPropriedade);

      expect(result.status).toBe(DCSStatus.Suspenso);
    });

    it('should return status SUSPENSO if there is an overdue fine', async () => {
      const mockPropriedade = {
        ...mockPropriedadeBase,
        statusVoucher: true,
        termoAdequacaoAceito: true,
      } as Propriedade;
      const mockAutoVistoria = {
        vistoria: Vistoria.Deferido,
      } as AutoVistoriaEntity;
      const mockMultaAtrasada = {
        status: StatusPagamento.VENCIDO,
      } as PagamentoMulta;

      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedade);
      autoVistoriaRepository.findOne!.mockResolvedValue(mockAutoVistoria);
      pagamentoMultaRepository.findOne!.mockResolvedValue(mockMultaAtrasada); // Overdue fine exists

      const result = await service.validarDCS(idPropriedade);

      expect(result.status).toBe(DCSStatus.Suspenso);
    });

    it('should return the correct dcs url when document exists', async () => {
      const dcsUrl = 'http://example.com/dcs.pdf';
      const mockPropriedade = {
        ...mockPropriedadeBase,
        statusVoucher: false,
        documentos: [{ tipo: 'DCS', urlArquivo: dcsUrl }]
      } as Propriedade;

      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedade);
      autoVistoriaRepository.findOne!.mockResolvedValue(null);
      pagamentoMultaRepository.findOne!.mockResolvedValue(null);

      const result = await service.validarDCS(idPropriedade);

      expect(result.status).toBe(DCSStatus.Suspenso);
      expect(result.urlDcs).toBe(dcsUrl);
    });

    it('should return an empty string for dcs url when document does not exist', async () => {
      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedadeBase);
      const result = await service.validarDCS(idPropriedade);
      expect(result.urlDcs).toBe('');
    });
  });

  describe('pegarLinkDocumentoTermoCompromissoAssinado', () => {
    const uuid = 'test-uuid';
    const urlTermo = 'http://example.com/termo.pdf';
    const mockPropriedade = { id: 1, urlTermoCompromisso: null } as unknown as Propriedade;

    it('should get document link, find property, update it, and save', async () => {
      assinaturaService.pegarLinkDocumentoAssinado.mockResolvedValue(urlTermo);
      propriedadeRepository.findOne!.mockResolvedValue(mockPropriedade);
      propriedadeRepository.save!.mockImplementation(p => Promise.resolve(p));

      await service.pegarLinkDocumentoTermoCompromissoAssinado(uuid);

      expect(assinaturaService.pegarLinkDocumentoAssinado).toHaveBeenCalledWith(uuid);
      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({ where: { idTermoCompromisso: uuid } });
      expect(propriedadeRepository.save).toHaveBeenCalledWith({
        ...mockPropriedade,
        urlTermoCompromisso: urlTermo,
      });
    });

    it('should throw BadRequestException if property is not found', async () => {
      assinaturaService.pegarLinkDocumentoAssinado.mockResolvedValue(urlTermo);
      propriedadeRepository.findOne!.mockResolvedValue(null);

      await expect(service.pegarLinkDocumentoTermoCompromissoAssinado(uuid))
        .rejects.toThrow(new BadRequestException('Propriedade não encontrada.'));

      expect(assinaturaService.pegarLinkDocumentoAssinado).toHaveBeenCalledWith(uuid);
      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({ where: { idTermoCompromisso: uuid } });
      expect(propriedadeRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('consultaPropriedadePorIdMultas', () => {
    it('should call findOne with correct id and relations for multas', async () => {
      const id = 1;
      const expectedResult = { id: 1, nomePropriedade: 'Teste' } as Propriedade;
      propriedadeRepository.findOne!.mockResolvedValue(expectedResult);

      const result = await service.consultaPropriedadePorIdMultas(id);

      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({
        where: { id: id },
        relations: [
          'proprietarios',
          'endereco',
          'cidade',
          'proprietarios.pessoa',
          'pagamentoMultas'
        ],
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('consultaUsuario', () => {
    it('should call usuarioService.buscarUsuarioPorEmail and return the user', async () => {
      const email = 'test@example.com';
      const expectedUser = { email, nome: 'Test User' };
      mockUsuarioService.buscarUsuarioPorEmail.mockResolvedValue(expectedUser as any);

      const result = await service.consultaUsuario(email);

      expect(mockUsuarioService.buscarUsuarioPorEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedUser);
    });
  });

});