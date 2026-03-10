import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf-service';
import { PdfGeneratorInterface } from './interfaces/pdf-generator.interface';
import { PdfTemplateInterface } from './interfaces/pdf-template.interface';

// Mock de um template para usar nos testes
class MockTemplate implements PdfTemplateInterface {
  name = 'mock-template';
  data = { content: 'test-data' };
}

describe('PdfService', () => {
  let service: PdfService;
  let mockPdfGenerator: jest.Mocked<PdfGeneratorInterface>;

  beforeEach(async () => {
    // Cria um mock para a interface do gerador de PDF
    mockPdfGenerator = {
      generate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfService,
        {
          provide: 'PDF_GENERATOR',
          useValue: mockPdfGenerator,
        },
      ],
    }).compile();

    service = module.get<PdfService>(PdfService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('should call the generator with the template and return its result', async () => {
      const template = new MockTemplate();
      const expectedBuffer = Buffer.from('pdf content');

      mockPdfGenerator.generate.mockResolvedValue(expectedBuffer);

      const result = await service.generate(template);

      expect(mockPdfGenerator.generate).toHaveBeenCalledWith(template);
      expect(result).toBe(expectedBuffer);
    });
  });
});