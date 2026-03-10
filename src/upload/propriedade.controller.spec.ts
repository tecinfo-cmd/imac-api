import { Test, TestingModule } from '@nestjs/testing';
import { PropriedadeController } from './propriedade.controller';
import { PropriedadeService } from './propriedade.service';
import { FileUploadService } from './file-upload.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UploadCsvResponseDto } from './upload-csv-response.dto';
import { DocumentoUploadService } from './documento-upload.service';

describe('PropriedadeController', () => {
  let propriedadeController: PropriedadeController;
  let propriedadeService: PropriedadeService;
  let fileUploadService: FileUploadService;
  let documentoUploadService: DocumentoUploadService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PropriedadeController],
      providers: [
        {
          provide: PropriedadeService,
          useValue: {
            processCsv: jest.fn(),
          },
        },
        {
          provide: FileUploadService,
          useValue: {
            validateCsvFile: jest.fn(),
            saveFile: jest.fn(),
          },
        },
        {
          provide: DocumentoUploadService,
          useValue: {
            uploadFiles: jest.fn(),
          },
        }
      ],
    }).compile();

    propriedadeController = moduleRef.get<PropriedadeController>(PropriedadeController);
    propriedadeService = moduleRef.get<PropriedadeService>(PropriedadeService);
    fileUploadService = moduleRef.get<FileUploadService>(FileUploadService);
    documentoUploadService = moduleRef.get<DocumentoUploadService>(DocumentoUploadService);
  });

  describe('uploadCsvFile', () => {
    it('should throw a BAD_REQUEST if file is not provided', async () => {
      try {
        await propriedadeController.uploadCsvFile(undefined as any);
        fail('Method should have thrown an error but did not.');
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Arquivo não enviado.');
      }
    });

    it('should validate, save, process the file, and return success message', async () => {
      const mockFile = {
        mimetype: 'text/csv',
        originalname: 'test.csv',
        buffer: Buffer.from('file content'),
      } as Express.Multer.File;

      const finalStoredPath = 'uploads/test-1234.csv';

      jest.spyOn(fileUploadService, 'validateCsvFile').mockImplementation();
      jest.spyOn(fileUploadService, 'saveFile').mockResolvedValue(finalStoredPath);
      jest.spyOn(propriedadeService, 'processCsv').mockResolvedValue();

      const finalResult: UploadCsvResponseDto = await propriedadeController.uploadCsvFile(mockFile);

      expect(fileUploadService.validateCsvFile).toHaveBeenCalledWith(mockFile);
      expect(fileUploadService.saveFile).toHaveBeenCalledWith(mockFile);
      expect(propriedadeService.processCsv).toHaveBeenCalledWith(finalStoredPath);
      expect(finalResult).toEqual({
        message: 'CSV processado e dados persistidos com sucesso!',
      });
    });

    it('should throw an INTERNAL_SERVER_ERROR if any error occurs while processing', async () => {
      const mockFile = {
        mimetype: 'text/csv',
        originalname: 'test.csv',
        buffer: Buffer.from('file content'),
      } as Express.Multer.File;

      jest.spyOn(fileUploadService, 'validateCsvFile').mockImplementation();
      jest
        .spyOn(fileUploadService, 'saveFile')
        .mockRejectedValue(new Error('Failed to save file'));

      try {
        await propriedadeController.uploadCsvFile(mockFile);
        fail('Method should have thrown an error but did not.');
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(error.response).toEqual({
          message: 'Erro ao processar o arquivo CSV.',
          error: 'Failed to save file',
        });
      }
    });
  });
});
