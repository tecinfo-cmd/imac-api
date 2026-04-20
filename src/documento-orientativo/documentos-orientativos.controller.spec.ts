import { Test, TestingModule } from '@nestjs/testing';
import { DocumentosOrientativosController } from './documentos-orientativos.controller';
import { DocumentosOrientativosService } from './documentos-orientativos.service';
import { JwtAuthGuard } from '../shared/guards/jwt.guard';
import { CreateDocumentoOrientativoDto, TipoDocumentoOrientativo } from './dto/create-documento-orientativo.dto';
import { UpdateDocumentoOrientativoStatusDto } from './dto/update-documento-orientativo-status.dto';
import { FilterDocumentoOrientativoDto } from './dto/filter-documento-orientativo.dto';

describe('DocumentosOrientativosController', () => {
  let controller: DocumentosOrientativosController;
  let service: DocumentosOrientativosService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentosOrientativosController],
      providers: [
        {
          provide: DocumentosOrientativosService,
          useValue: mockService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard) // Mock do guard para não precisar de um usuário real
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<DocumentosOrientativosController>(DocumentosOrientativosController);
    service = module.get<DocumentosOrientativosService>(DocumentosOrientativosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with correct parameters', async () => {
      const dto: CreateDocumentoOrientativoDto = { titulo: 'Test', descricao: 'Desc', tipo: TipoDocumentoOrientativo.PDF, ativo: true };
      const files = { capaArquivo: [{} as any], arquivo: [{} as any] };
      const req = { user: { email: 'test@test.com' } };
      
      mockService.create.mockResolvedValue({ id: 1, ...dto });

      await controller.create(dto, files, req);

      expect(service.create).toHaveBeenCalledWith(dto, files, req.user.email);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with correct parameters and return a paginated response', async () => {
      const filterDto: FilterDocumentoOrientativoDto = {
        titulo: 'Test',
      };
      const page = 1;
      const size = 10;
      const serviceResult: [any[], number] = [[{ id: 1, titulo: 'Test' }], 1];
      mockService.findAll.mockResolvedValue(serviceResult);

      const result = await controller.findAll(filterDto, page, size);

      expect(service.findAll).toHaveBeenCalledWith(filterDto, page, size);
      expect(result.data).toEqual(serviceResult[0]);
      expect(result.total).toEqual(serviceResult[1]);
      expect(result.page).toEqual(page);
      expect(result.size).toEqual(size);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with correct id', async () => {
      const id = 1;
      mockService.findOne.mockResolvedValue({ id });
      await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('updateStatus', () => {
    it('should call service.updateStatus with correct parameters', async () => {
      const id = 1;
      const dto: UpdateDocumentoOrientativoStatusDto = { ativo: true };
      mockService.updateStatus.mockResolvedValue({ id, ...dto });

      await controller.updateStatus(id, dto);

      expect(service.updateStatus).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove with correct id', async () => {
      const id = 1;
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});