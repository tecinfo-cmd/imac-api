import { PdfKitPdfGenerator } from './pdfkit-pdf-generator';
import { PdfBuilderInterface } from '../../interfaces/pdf-builder.interface';
import { PdfTemplateInterface } from '../../interfaces/pdf-template.interface';

// Mock implementation for a PDF template interface
class MockTemplate implements PdfTemplateInterface {
  name = 'MockTemplate';
  data: any = { test: 'data' };
}

describe('PdfKitPdfGenerator', () => {
  let generator: PdfKitPdfGenerator;
  let mockBuilder1: jest.Mocked<PdfBuilderInterface>;
  let mockBuilder2: jest.Mocked<PdfBuilderInterface>;

  beforeEach(() => {
    mockBuilder1 = {
      supports: jest.fn(),
      build: jest.fn(),
    };

    mockBuilder2 = {
      supports: jest.fn(),
      build: jest.fn(),
    };

    generator = new PdfKitPdfGenerator([mockBuilder1, mockBuilder2]);
  });

  it('should be defined', () => {
    expect(generator).toBeDefined();
  });

  describe('generate', () => {
    it('should find the correct builder, call build, and return the result', async () => {
      const template = new MockTemplate();
      const expectedBuffer = Buffer.from('pdf-content');

      mockBuilder1.supports.mockReturnValue(false);
      mockBuilder2.supports.mockReturnValue(true);
      mockBuilder2.build.mockResolvedValue(expectedBuffer);

      const result = await generator.generate(template);

      expect(mockBuilder1.supports).toHaveBeenCalledWith(template);
      expect(mockBuilder2.supports).toHaveBeenCalledWith(template);
      expect(mockBuilder1.build).not.toHaveBeenCalled();
      expect(mockBuilder2.build).toHaveBeenCalledWith(template);
      expect(result).toBe(expectedBuffer);
    });

    it('should throw an error if no builder supports the template', async () => {
      const template = new MockTemplate();

      mockBuilder1.supports.mockReturnValue(false);
      mockBuilder2.supports.mockReturnValue(false);

      await expect(generator.generate(template)).rejects.toThrow(
        `Nenhum builder encontrado para o template ${template.name}`,
      );

      expect(mockBuilder1.build).not.toHaveBeenCalled();
      expect(mockBuilder2.build).not.toHaveBeenCalled();
    });
  });
});