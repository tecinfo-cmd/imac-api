import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoUploadService } from './documento-upload.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

const mockS3PutObject = jest.fn();
const mockS3DeleteObject = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3: jest.fn().mockImplementation(() => ({
      putObject: mockS3PutObject,
      deleteObject: mockS3DeleteObject,
    })),
  };
});

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));


const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

describe('DocumentoUploadService', () => {
  let service: DocumentoUploadService;
  let configService: ConfigService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentoUploadService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'BUCKET_ENDPOINT': return 'https://nyc3.digitaloceanspaces.com';
                case 'BUCKET_REGION': return 'nyc3';
                case 'BUCKET_KEY': return 'test-key';
                case 'BUCKET_ACCESS_KEY': return 'test-secret';
                case 'BUCKET_NAME': return 'test-bucket';
                default: return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentoUploadService>(DocumentoUploadService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFiles', () => {
    const mockPdfFile: Express.Multer.File = {
      fieldname: 'files',
      originalname: 'document.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 1024 * 1024, // 1MB
      buffer: Buffer.from('pdf content'),
      stream: null as any, // Not typically used in this context
      destination: '',
      filename: '',
      path: '',
    };

    const mockImageFile: Express.Multer.File = {
      fieldname: 'files',
      originalname: 'image.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 512 * 1024, // 0.5MB
      buffer: Buffer.from('image content'),
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    it('should successfully upload valid pdf and image files', async () => {
      const files = [mockPdfFile, mockImageFile];
      const expectedResponse = [
        {
          filename: 'mock-uuid-document.pdf',
          originalName: 'document.pdf',
          url: 'https://test-bucket.nyc3.digitaloceanspaces.com/documents/mock-uuid-document.pdf',
        },
        {
          filename: 'mock-uuid-image.png',
          originalName: 'image.png',
          url: 'https://test-bucket.nyc3.digitaloceanspaces.com/documents/mock-uuid-image.png'
        }
      ];

      mockS3PutObject.mockResolvedValue({});
      const result = await service.uploadFiles(files);

      expect(result).toEqual(expectedResponse);
      expect(mockS3PutObject).toHaveBeenCalledTimes(2);
      expect(mockS3PutObject).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'documents/mock-uuid-document.pdf',
        Body: mockPdfFile.buffer,
        ACL: 'public-read',
        ContentType: 'application/pdf',
      });
      expect(mockS3PutObject).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'documents/mock-uuid-image.png',
        Body: mockImageFile.buffer,
        ACL: 'public-read',
        ContentType: 'image/png',
      });
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const invalidFile: Express.Multer.File = {
        ...mockPdfFile,
        originalname: 'invalid.txt',
        mimetype: 'invalid/mimeType',
      };
      const files = [mockPdfFile, invalidFile];

      await expect(service.uploadFiles(files)).rejects.toThrow(
        new BadRequestException(`Tipo de arquivo inválido: ${invalidFile.originalname}. Apenas PDFs e imagens são permitidos.`)
      );
      expect(mockS3PutObject).not.toHaveBeenCalled();
    });

     it('should throw BadRequestException for file exceeding size limit', async () => {
        const largeFile: Express.Multer.File = {
            ...mockImageFile,
            originalname: 'large_image.jpg',
            mimetype: 'image/jpeg',
            size: MAX_FILE_SIZE + 1,
        };
        const files = [mockPdfFile, largeFile];

        await expect(service.uploadFiles(files)).rejects.toThrow(
            new BadRequestException(`Arquivo muito grande: ${largeFile.originalname}`)
        );
        expect(mockS3PutObject).not.toHaveBeenCalled();
    });

    it('should throw an error if S3 upload fails', async () => {
        const files = [mockPdfFile];
        const s3Error = new Error('S3 PutObject failed');

        mockS3PutObject.mockRejectedValueOnce(s3Error);

        await expect(service.uploadFiles(files)).rejects.toThrow(`Erro ao fazer upload dos arquivos`);
        expect(mockS3PutObject).toHaveBeenCalledTimes(1);
    });

     it('should allow any image/* mimetype if it starts with image/', async () => {
        const svgFile: Express.Multer.File = {
            ...mockImageFile,
            originalname: 'vector.svg',
            mimetype: 'image/svg+xml',
            size: 100 * 1024,
        };
        const files = [svgFile];
        const expectedResponse = [
            {
                filename: 'mock-uuid-vector.svg',
                originalName: 'vector.svg',
                url: 'https://test-bucket.nyc3.digitaloceanspaces.com/documents/mock-uuid-vector.svg'
            }
        ];

        mockS3PutObject.mockResolvedValue({});
        const result = await service.uploadFiles(files);

        expect(result).toEqual(expectedResponse);
        expect(mockS3PutObject).toHaveBeenCalledTimes(1);
        expect(mockS3PutObject).toHaveBeenCalledWith({
            Bucket: 'test-bucket',
            Key: 'documents/mock-uuid-vector.svg',
            Body: svgFile.buffer,
            ACL: 'public-read',
            ContentType: 'image/svg+xml',
        });
    });
  });

  describe('uploadBase64Image', () => {
    const mockBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const expectedResponse = {
      filename: 'mock-uuid.png',
      originalName: 'mock-uuid.png',
      url: 'https://test-bucket.nyc3.digitaloceanspaces.com/images/mock-uuid.png',
    };

    it('should successfully upload a base64 image and return the correct URL', async () => {
      mockS3PutObject.mockResolvedValue({});

      const result = await service.uploadBase64Image(mockBase64Image);

      expect(result).toEqual(expectedResponse);
      expect(mockS3PutObject).toHaveBeenCalledTimes(1);
      expect(mockS3PutObject).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'images/mock-uuid.png',
        Body: expect.any(Buffer),
        ACL: 'public-read',
        ContentType: 'image/png',
      });

      // Optional: Verify the buffer content
      const expectedBuffer = Buffer.from(mockBase64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      expect(mockS3PutObject.mock.calls[0][0].Body).toEqual(expectedBuffer);
    });

    it('should throw an error if S3 upload fails', async () => {
      const s3Error = new Error('S3 PutObject failed');
      mockS3PutObject.mockRejectedValueOnce(s3Error);

      await expect(service.uploadBase64Image(mockBase64Image)).rejects.toThrow(
        'Erro ao fazer upload da imagem base64'
      );
      expect(mockS3PutObject).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteFiles', () => {
    it('should call S3 deleteObject for each file key provided', async () => {
      const filesToDelete = ['documents/file1.pdf', 'images/file2.jpg'];
      mockS3DeleteObject.mockResolvedValue({}); // Simula a exclusão bem-sucedida

      await service.deleteFiles(filesToDelete);

      expect(mockS3DeleteObject).toHaveBeenCalledTimes(2);
      expect(mockS3DeleteObject).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'documents/file1.pdf',
      });
      expect(mockS3DeleteObject).toHaveBeenCalledWith({
        Bucket: 'test-bucket',
        Key: 'images/file2.jpg',
      });
    });
  });
});