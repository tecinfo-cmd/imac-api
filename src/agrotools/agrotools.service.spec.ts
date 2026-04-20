import { Test, TestingModule } from '@nestjs/testing';
import { AgrotoolsService } from './agrotools.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { EligibilidadeAsyncAgrotoolsResponse } from './response/eligibilidade-async-agrotools-response';
import { AxiosResponse } from 'axios';
import { AxiosHeaders } from 'axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RetornoAgrotools } from '../elegibilidade/entities/retorno-agrotools.entity';
import { PagamentoVoucher } from '../elegibilidade/entities/pagamento-voucher.entity';
import { PessoaService } from '../shared/service/pessoa.service';
import { ElegibilidadeService } from '../elegibilidade/elegibilidade.service';
import { ProprietarioPremService } from '../propriedade-prem/proprietario-prem.service';
import { PropriedadePremService } from '../propriedade-prem/propriedade-prem.service';
import { RetornoAnaliseEntity } from './entities/retorno-analise.entity';
import { TerritorioEntity } from './entities/territorio.entity';
import NegocioException from '../exception/negocio-exception';
import { AutoVistoriaService } from '../propriedade-prem/auto-vistoria/auto-vistoria.service';
import { UsuarioService } from '../usuario/usuario.service';
import { PlanoAdequacao } from '../propriedade-prem/analise-socioambiental/entities/plano-adequacao.entity';
import { DocumentoUploadService } from '../upload/documento-upload.service';
import { PagamentoMulta } from '../cobranca/entities/pagamento-multa.entities';

const mockResponse: EligibilidadeAsyncAgrotoolsResponse = {
  transactionId: 'mock-uuid',
  status: 'Started',
  createdAt: new Date().toISOString(),
};

const mockAxiosHeaders = new AxiosHeaders();
mockAxiosHeaders.set('x-custom-header', 'value');

const mockAxiosResponse: AxiosResponse<EligibilidadeAsyncAgrotoolsResponse> = {
  data: mockResponse,
  status: 200,
  statusText: 'OK',
  headers: mockAxiosHeaders,
  config: {
    headers: mockAxiosHeaders,
  },
};

describe('AgrotoolsService', () => {
  let service: AgrotoolsService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgrotoolsService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RetornoAgrotools),
          useValue: jest.fn()
        },
        {
          provide: getRepositoryToken(PagamentoVoucher),
          useValue: jest.fn()
        },
        {
          provide: PessoaService,
          useValue: jest.fn()
        },
        {
          provide: ElegibilidadeService,
          useValue: jest.fn()
        },
        {
          provide: ProprietarioPremService,
          useValue: jest.fn()
        },
        {
          provide: PropriedadePremService,
          useValue: jest.fn()
        },
        {
          provide: getRepositoryToken(RetornoAnaliseEntity),
          useValue: jest.fn()
        },
        {
          provide: getRepositoryToken(TerritorioEntity),
          useValue: jest.fn()
        },
        {
          provide: getRepositoryToken(PlanoAdequacao),
          useValue: jest.fn()
        },
        {
          provide: AutoVistoriaService,
          useValue: jest.fn()
        },
        {
          provide: UsuarioService,
          useValue: jest.fn()
        },
        {
          provide: DocumentoUploadService,
          useValue: jest.fn()
        },
        {
          provide: getRepositoryToken(PagamentoMulta),
          useValue: jest.fn()
        }
      ],
    }).compile();

    service = module.get<AgrotoolsService>(AgrotoolsService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enviarConsultaElegibilidade', () => {
    it('should return data when the API call is successful', async () => {
      jest.spyOn(httpService, 'post').mockReturnValue(of(mockAxiosResponse));

      const car = '12345';
      const result = await service.consultarElegibilidade(car);

      expect(result).toEqual(mockResponse);
      expect(httpService.post).toHaveBeenCalledWith(
        `${process.env.URL_AGROTOOLS}/Eligibility/async`,
        car,
        expect.any(Object),
      );
    });

    it('should throw NegocioException when the API call fails', async () => {
      jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => ({ status: 400, message: 'Bad Request' })));

      const car = '12345';
      await expect(service.consultarElegibilidade(car)).rejects.toThrow(NegocioException);
    });
  });
});
