import { Test, TestingModule } from '@nestjs/testing';
import { AssinaturaService } from './assinatura.service';
import { IServicoAssinatura } from './interfaces/servico-assinatura.interface';
import { DocumentoAssinatura } from './interfaces/documento-assinatura.interface';
import { Signatario } from './interfaces/signatario.interface';

describe('AssinaturaService', () => {
  let service: AssinaturaService;
  let mockServicoAssinatura: jest.Mocked<IServicoAssinatura>;

  beforeEach(async () => {
    // Cria um mock para a interface do serviço de assinatura
    mockServicoAssinatura = {
      enviarDocumentoParaAssinatura: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssinaturaService,
        {
          provide: 'I_SERVICO_ASSINATURA',
          useValue: mockServicoAssinatura,
        },
      ],
    }).compile();

    service = module.get<AssinaturaService>(AssinaturaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enviarDocumentoParaAssinatura', () => {
    it('should call the signature service with the document and signers, and return its result', async () => {
      const documento: DocumentoAssinatura = {
        conteudo: Buffer.from('conteúdo do teste'),
        nomeArquivo: 'teste.pdf',
        mimeType: 'application/pdf',
      };
      const signatarios: Signatario[] = [{ email: 'signatario@teste.com', nome: 'Signatário Teste' }];
      const expectedUuid = 'uuid-do-documento-123';

      // Configura o mock para retornar um valor esperado
      mockServicoAssinatura.enviarDocumentoParaAssinatura.mockResolvedValue(expectedUuid);

      const result = await service.enviarDocumentoParaAssinatura(documento, signatarios);

      expect(mockServicoAssinatura.enviarDocumentoParaAssinatura).toHaveBeenCalledWith(documento, signatarios);
      expect(result).toBe(expectedUuid);
    });
  });
});