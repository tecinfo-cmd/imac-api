import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ValidarUploadArquivos } from './validar-upload-arquivos.decorator';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  applyDecorators: jest.fn((...args) => args),
  UseInterceptors: jest.fn(),
}));

jest.mock('@nestjs/swagger', () => ({
  ...jest.requireActual('@nestjs/swagger'),
  ApiConsumes: jest.fn(),
  ApiBody: jest.fn(),
}));

jest.mock('@nestjs/platform-express', () => ({
  ...jest.requireActual('@nestjs/platform-express'),
  FilesInterceptor: jest.fn(),
}));

describe('ValidarUploadArquivos Decorator', () => {
  const mockApplyDecorators = applyDecorators as jest.Mock;
  const mockUseInterceptors = UseInterceptors as jest.Mock;
  const mockApiConsumes = ApiConsumes as jest.Mock;
  const mockApiBody = ApiBody as jest.Mock;
  const mockFilesInterceptor = FilesInterceptor as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(ValidarUploadArquivos).toBeDefined();
  });

  describe('with default options', () => {
    it('should apply decorators with default fieldName "arquivos" and maxCount 10', () => {
      ValidarUploadArquivos();

      expect(mockFilesInterceptor).toHaveBeenCalledWith('arquivos', 10);

      expect(mockUseInterceptors).toHaveBeenCalledWith(mockFilesInterceptor.mock.results[0].value);

      expect(mockApiConsumes).toHaveBeenCalledWith('multipart/form-data');

      expect(mockApiBody).toHaveBeenCalledWith(expect.objectContaining({
        schema: expect.objectContaining({
          properties: expect.objectContaining({
            arquivos: expect.any(Object),
          }),
          required: ['arquivos', 'parametros'],
        }),
      }));

      expect(mockApplyDecorators).toHaveBeenCalledTimes(1);
    });
  });

  describe('with custom options', () => {
    it('should apply decorators with custom fieldName and maxCount', () => {
      const customOptions = { fieldName: 'documentos', maxCount: 5 };
      ValidarUploadArquivos(customOptions);

      expect(mockFilesInterceptor).toHaveBeenCalledWith(customOptions.fieldName, customOptions.maxCount);

      expect(mockUseInterceptors).toHaveBeenCalledWith(mockFilesInterceptor.mock.results[0].value);

      expect(mockApiBody).toHaveBeenCalledWith(expect.objectContaining({
        schema: expect.objectContaining({
          properties: expect.objectContaining({
            [customOptions.fieldName]: expect.any(Object),
          }),
          required: [customOptions.fieldName, 'parametros'],
        }),
      }));
      expect(mockApiBody.mock.calls[0][0].schema.properties.parametros.description).toContain(`'${customOptions.fieldName}'`);
    });
  });
});