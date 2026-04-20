import { Test, TestingModule } from '@nestjs/testing';
import { DocumentosOrientativosService } from './documentos-orientativos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DocumentoOrientativo } from './entity/documento-orientativo.entity';
import { DocumentoUploadService } from '../upload/documento-upload.service';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateDocumentoOrientativoDto, TipoDocumentoOrientativo } from './dto/create-documento-orientativo.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DocumentoOrientativoEnviado } from '../shared/events/documento-orientativo-enviado.event';
import { DocumentoOrientativoAtualizado } from '../shared/events/documento-orientativo-atualizado.event';

describe('DocumentosOrientativosService', () => {
  let service: DocumentosOrientativosService;
  let repository: Repository<DocumentoOrientativo>;
  let uploadService: DocumentoUploadService;
  let eventEmitter: EventEmitter2;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    remove: jest.fn(),
  };

  const mockUploadService = {
    uploadFiles: jest.fn(),
    deleteFiles: jest.fn(),
  };

  const mockEventEmitter = {
    emitAsync: jest.fn(),
  };

  const mockCapaFile: Express.Multer.File = {
    fieldname: 'capaArquivo',
    originalname: 'capa.jpg',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test'),
    size: 1024,
  } as any;

  const mockPdfFile: Express.Multer.File = {
    fieldname: 'arquivo',
    originalname: 'documento.pdf',
    mimetype: 'application/pdf',
    buffer: Buffer.from('test pdf'),
    size: 2048,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentosOrientativosService,
        {
          provide: getRepositoryToken(DocumentoOrientativo),
          useValue: mockRepository,
        },
        {
          provide: DocumentoUploadService,
          useValue: mockUploadService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<DocumentosOrientativosService>(DocumentosOrientativosService);
    repository = module.get<Repository<DocumentoOrientativo>>(getRepositoryToken(DocumentoOrientativo));
    uploadService = module.get<DocumentoUploadService>(DocumentoUploadService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const userEmail = 'test@example.com';

    it('should create a document of type PDF successfully', async () => {
      const dto: CreateDocumentoOrientativoDto = {
        titulo: 'Test PDF',
        descricao: 'Description',
        tipo: TipoDocumentoOrientativo.PDF,
        ativo: true,
      };
      const files = { capaArquivo: [mockCapaFile], arquivo: [mockPdfFile] };

      mockUploadService.uploadFiles
        .mockResolvedValueOnce([{ url: 'pdf_url', filename: 'pdf_name', originalName: 'documento.pdf' }])
        .mockResolvedValueOnce([{ url: 'capa_url', filename: 'capa_name', originalName: 'capa.jpg' }]);
      
      const savedDoc = { id: 1, ...dto };
      mockRepository.create.mockReturnValue(savedDoc);
      mockRepository.save.mockResolvedValue(savedDoc);

      const result = await service.create(dto, files, userEmail);

      expect(uploadService.uploadFiles).toHaveBeenCalledTimes(2);
      expect(uploadService.uploadFiles).toHaveBeenCalledWith([mockPdfFile]);
      expect(uploadService.uploadFiles).toHaveBeenCalledWith([mockCapaFile]);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(DocumentoOrientativoEnviado.name, expect.any(DocumentoOrientativoEnviado));
      expect(result).toHaveProperty('id');
    });

    it('should create a document of type VIDEO successfully', async () => {
      const dto: CreateDocumentoOrientativoDto = {
        titulo: 'Test Video',
        descricao: 'Description',
        tipo: TipoDocumentoOrientativo.VIDEO,
        ativo: false,
        urlVideo: 'http://youtube.com/watch?v=123',
      };
      const files = { capaArquivo: [mockCapaFile] };

      mockUploadService.uploadFiles.mockResolvedValue([{ url: 'capa_url', filename: 'capa_name', originalName: 'capa_orig_name' }]);
      const savedDoc = { id: 2, ...dto };
      mockRepository.create.mockReturnValue(savedDoc);
      mockRepository.save.mockResolvedValue(savedDoc);

      const result = await service.create(dto, files, userEmail);

      expect(uploadService.uploadFiles).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ urlArquivo: dto.urlVideo }));
      expect(repository.save).toHaveBeenCalled();
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(DocumentoOrientativoEnviado.name, expect.any(DocumentoOrientativoEnviado));
      expect(result).toHaveProperty('id');
    });

    it('should throw BadRequestException if capaArquivo is missing', async () => {
      const dto: CreateDocumentoOrientativoDto = { titulo: 't', descricao: 'd', tipo: TipoDocumentoOrientativo.PDF, ativo: true };
      const files = {};

      await expect(service.create(dto, files as any, userEmail)).rejects.toThrow(
        new BadRequestException('O campo capaArquivo é obrigatório.'),
      );
      expect(uploadService.uploadFiles).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if type is PDF and arquivo is missing', async () => {
        const dto: CreateDocumentoOrientativoDto = { titulo: 't', descricao: 'd', tipo: TipoDocumentoOrientativo.PDF, ativo: true };
        const files = { capaArquivo: [mockCapaFile] };
  
        mockUploadService.uploadFiles.mockResolvedValue([
          { url: 'capa_url', filename: 'capa_name', originalName: 'capa.jpg' }
        ]);

        await expect(service.create(dto, files, userEmail)).rejects.toThrow(
          new BadRequestException('Para o tipo "pdf", o campo "arquivo" é obrigatório.'),
        );
        expect(uploadService.uploadFiles).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException if type is VIDEO and urlVideo is missing', async () => {
        const dto: CreateDocumentoOrientativoDto = { titulo: 't', descricao: 'd', tipo: TipoDocumentoOrientativo.VIDEO, ativo: true };
        const files = { capaArquivo: [mockCapaFile] };
  
        mockUploadService.uploadFiles.mockResolvedValue([
          { url: 'capa_url', filename: 'capa_name', originalName: 'capa.jpg' }
        ]);

        await expect(service.create(dto, files, userEmail)).rejects.toThrow(
          new BadRequestException('Para o tipo "video", o campo "urlVideo" é obrigatório.'),
        );
        expect(uploadService.uploadFiles).not.toHaveBeenCalled();
      });

    it('should throw BadRequestException if type is PDF and urlVideo is provided', async () => {
      const dto: CreateDocumentoOrientativoDto = {
        titulo: 't', descricao: 'd', tipo: TipoDocumentoOrientativo.PDF, ativo: true, urlVideo: 'http://youtube.com/test'
      };
      const files = { capaArquivo: [mockCapaFile], arquivo: [mockPdfFile] };

      mockUploadService.uploadFiles.mockResolvedValue([
        { url: 'capa_url', filename: 'capa_name', originalName: 'capa.jpg' }
      ]);

      await expect(service.create(dto, files, userEmail)).rejects.toThrow(
        new BadRequestException('Para o tipo "pdf", o campo "urlVideo" não é permitido.'),
      );
      expect(mockUploadService.uploadFiles).not.toHaveBeenCalled(); // Garante que o upload não foi iniciado
    });
  });

  describe('findAll', () => {
    it('should return an array of documents', async () => {
      const expectedResult = [{ id: 1, titulo: 'Test' }];
      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([expectedResult, 1]),
      });
      const result = await service.findAll({}, 1, 10);
      expect(result).toEqual([expectedResult, 1]);
      expect(repository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single document', async () => {
      const expectedResult = { id: 1, titulo: 'Test' };
      mockRepository.findOne.mockResolvedValue(expectedResult);
      const result = await service.findOne(1);
      expect(result).toEqual(expectedResult);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if document not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a document', async () => {
      const existingDoc = { id: 1, titulo: 'Test', ativo: false };
      const dto = { ativo: true };
      
      mockRepository.findOne.mockResolvedValue(existingDoc);
      mockRepository.save.mockResolvedValue({ ...existingDoc, ...dto });

      const result = await service.updateStatus(1, dto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalledWith({ ...existingDoc, ativo: true });
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(DocumentoOrientativoAtualizado.name, expect.any(DocumentoOrientativoAtualizado));
      expect(result.ativo).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove a document and its files (pdf)', async () => {
      const docToDelete = { 
        id: 1, 
        tipo: 'pdf', 
        nomeCapaArquivo: 'capa.jpg', 
        nomeArquivo: 'doc.pdf' 
      };
      mockRepository.findOne.mockResolvedValue(docToDelete);
      mockRepository.remove.mockResolvedValue(undefined);
      mockUploadService.deleteFiles.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(uploadService.deleteFiles).toHaveBeenCalledWith(['documents/capa.jpg', 'documents/doc.pdf']);
      expect(repository.remove).toHaveBeenCalledWith(docToDelete);
    });

    it('should remove a document and its file (video)', async () => {
        const docToDelete = { 
          id: 2, 
          tipo: 'video', 
          nomeCapaArquivo: 'capa_video.jpg', 
          nomeArquivo: null // Vídeos não têm nome de arquivo no storage
        };
        mockRepository.findOne.mockResolvedValue(docToDelete);
        mockRepository.remove.mockResolvedValue(undefined);
        mockUploadService.deleteFiles.mockResolvedValue(undefined);
  
        await service.remove(2);
  
        expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
        expect(uploadService.deleteFiles).toHaveBeenCalledWith(['documents/capa_video.jpg']);
        expect(repository.remove).toHaveBeenCalledWith(docToDelete);
      });

    it('should throw NotFoundException if document to remove is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});