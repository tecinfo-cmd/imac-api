import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadService } from './file-upload.service';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

describe('FileUploadService', () => {
  let fileUploadService: FileUploadService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [FileUploadService],
    }).compile();

    fileUploadService = moduleRef.get<FileUploadService>(FileUploadService);
  });

  describe('validateCsvFile', () => {
    it('should throw BadRequest if file is not CSV by mimetype or extension', () => {
      const finalFile = {
        mimetype: 'text/plain',
        originalname: 'test.txt',
        size: 1024,
      } as Express.Multer.File;

      expect(() => fileUploadService.validateCsvFile(finalFile)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequest if file size is larger than 50MB', () => {
      const finalFile = {
        mimetype: 'text/csv',
        originalname: 'test.csv',
        size: 401 * 1024 * 1024,
      } as Express.Multer.File;

      expect(() => fileUploadService.validateCsvFile(finalFile)).toThrow(
        BadRequestException,
      );
    });

    it('should not throw if file is a valid CSV under size limit', () => {
      const finalFile = {
        mimetype: 'text/csv',
        originalname: 'test.csv',
        size: 1024,
      } as Express.Multer.File;

      expect(() => fileUploadService.validateCsvFile(finalFile)).not.toThrow();
    });
  });

  describe('saveFile', () => {
    it('should save file to disk and return path', async () => {
      const finalFile = {
        mimetype: 'text/csv',
        originalname: 'example.csv',
        buffer: Buffer.from('some csv data'),
        size: 1024,
      } as Express.Multer.File;

      const writeFileSpy = jest.spyOn(fs.promises, 'writeFile').mockResolvedValue();

      const finalPath = await fileUploadService.saveFile(finalFile);

      expect(writeFileSpy).toHaveBeenCalled();
      expect(finalPath).toContain('uploads');
      expect(finalPath).toContain('example'); // after name transformation
      expect(path.extname(finalPath)).toBe('.csv');
    });
  });
});
