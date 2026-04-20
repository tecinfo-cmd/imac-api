import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { D4Sign } from './d4sign';
import { DocumentoAssinatura } from '../interfaces/documento-assinatura.interface';
import { Signatario } from '../interfaces/signatario.interface';
import { InternalServerErrorException } from '@nestjs/common';

describe('D4Sign Provider', () => {
  let d4signProvider: D4Sign;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'D4SIGN_BASE_URL':
          return 'https://mock-api.d4sign.com.br/api/v1';
        case 'D4SIGN_TOKEN_API':
          return 'mock-token';
        case 'D4SIGN_CRYPT_KEY':
          return 'mock-crypt-key';
        case 'D4SIGN_UUID_SAFE':
          return 'mock-uuid-safe';
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        D4Sign,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    d4signProvider = module.get<D4Sign>(D4Sign);

    // Mock a função fetch global
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(d4signProvider).toBeDefined();
  });

  describe('enviarDocumentoParaAssinatura', () => {
    const mockDocumento: DocumentoAssinatura = {
      conteudo: Buffer.from('conteúdo do pdf'),
      nomeArquivo: 'documento.pdf',
      mimeType: 'application/pdf',
    };
    const mockSignatarios: Signatario[] = [{ email: 'teste@teste.com', nome: 'Teste' }];
    const mockUuidDocumento = 'document-uuid-123';

    it('should successfully upload, add signers, and send the document', async () => {
      // Configura o mock do fetch para simular respostas de sucesso
      (fetch as jest.Mock)
        .mockResolvedValueOnce(Promise.resolve({ // 1. Upload
          ok: true,
          json: () => Promise.resolve({ uuid: mockUuidDocumento }),
        }))
        .mockResolvedValueOnce(Promise.resolve({ // 2. Create List
          ok: true,
          json: () => Promise.resolve({ message: 'success' }),
        }))
        .mockResolvedValueOnce(Promise.resolve({ // 3. Send to Signer
          ok: true,
          json: () => Promise.resolve({ message: 'success' }),
        }));

      const result = await d4signProvider.enviarDocumentoParaAssinatura(mockDocumento, mockSignatarios);

      expect(result).toBe(mockUuidDocumento);
      expect(fetch).toHaveBeenCalledTimes(3);

      // Verifica a chamada de upload
      expect(fetch).toHaveBeenCalledWith(
        'https://mock-api.d4sign.com.br/api/v1/documents/mock-uuid-safe/uploadbinary',
        expect.any(Object),
      );
      // Verifica a chamada para adicionar signatários
      expect(fetch).toHaveBeenCalledWith(
        `https://mock-api.d4sign.com.br/api/v1/documents/${mockUuidDocumento}/createlist`,
        expect.any(Object),
      );
      // Verifica a chamada para enviar para assinatura
      expect(fetch).toHaveBeenCalledWith(
        `https://mock-api.d4sign.com.br/api/v1/documents/${mockUuidDocumento}/sendtosigner`,
        expect.any(Object),
      );
    });

    it('should throw InternalServerErrorException if document upload fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce(Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Upload failed' }),
      }));

      await expect(d4signProvider.enviarDocumentoParaAssinatura(mockDocumento, mockSignatarios))
        .rejects.toThrow(new InternalServerErrorException('Erro ao enviar documento para assinatura'));
    });

    it('should throw InternalServerErrorException if adding signers fails', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce(Promise.resolve({ // Upload OK
          ok: true,
          json: () => Promise.resolve({ uuid: mockUuidDocumento }),
        }))
        .mockResolvedValueOnce(Promise.resolve({ // Create List FAIL
          ok: false,
          json: () => Promise.resolve({ message: 'Failed to add signers' }),
        }));

      await expect(d4signProvider.enviarDocumentoParaAssinatura(mockDocumento, mockSignatarios))
        .rejects.toThrow(new InternalServerErrorException('Erro ao enviar signatários para o documento'));
    });

    it('should throw InternalServerErrorException if sending to signer fails', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce(Promise.resolve({ // Upload OK
          ok: true,
          json: () => Promise.resolve({ uuid: mockUuidDocumento }),
        }))
        .mockResolvedValueOnce(Promise.resolve({ // Create List OK
          ok: true,
          json: () => Promise.resolve({ message: 'success' }),
        }))
        .mockResolvedValueOnce(Promise.resolve({ // Send to Signer FAIL
          ok: false,
          json: () => Promise.resolve({ message: 'Failed to send' }),
        }));

      await expect(d4signProvider.enviarDocumentoParaAssinatura(mockDocumento, mockSignatarios))
        .rejects.toThrow(new InternalServerErrorException('Erro ao enviar documento para assinatura'));
    });
  });
});