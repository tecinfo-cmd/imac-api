import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { DocumentosOrientativosService } from './documentos-orientativos.service';
import { CreateDocumentoOrientativoDto } from './dto/create-documento-orientativo.dto';
import { UpdateDocumentoOrientativoStatusDto } from './dto/update-documento-orientativo-status.dto';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiParam, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt.guard';
import { DocumentoOrientativo } from './entity/documento-orientativo.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FilterDocumentoOrientativoDto } from './dto/filter-documento-orientativo.dto';
import { createSwaggerPaginatedResponseDto } from '../shared/dto/swagger-paginated-response';
import { PaginatedResponseInterface } from '../shared/interfaces/paginated-response.interface';
import { Roles } from '../shared/decorators/roles.decorator';
import { RolesGuard } from '../shared/guards/roles.guard';

@ApiTags('Documentos Orientativos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documentos-orientativos')
export class DocumentosOrientativosController {
  constructor(
    private readonly documentosOrientativosService: DocumentosOrientativosService,
  ) {}

  @Post()
  @Roles('ADMINISTRATIVO')
  @UseGuards(RolesGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'capaArquivo', maxCount: 1 },
      { name: 'arquivo', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Documento orientativo criado com sucesso.', type: DocumentoOrientativo })
  @ApiResponse({ status: 400, description: 'Requisição inválida.' })
  @ApiBody({
    description: 'Cria um novo documento orientativo com capa e arquivo opcional.',
    schema: {
      type: 'object',
      properties: {
        capaArquivo: { type: 'string', format: 'binary', description: 'Arquivo de capa (obrigatório).' },
        arquivo: { type: 'string', format: 'binary', description: 'Arquivo do conteúdo (PDF ou Vídeo), opcional.' },
        titulo: { type: 'string' },
        descricao: { type: 'string' },
        tipo: { type: 'string', enum: ['pdf', 'video'] },
        ativo: { type: 'boolean' },
      },
    },
    type: CreateDocumentoOrientativoDto,
  })
  create(
    @Body() createDocumentoOrientativoDto: CreateDocumentoOrientativoDto,
    @UploadedFiles() files: { capaArquivo?: Express.Multer.File[], arquivo?: Express.Multer.File[] },
    @Request() req,
  ) {
    const user = req.user;
    return this.documentosOrientativosService.create(createDocumentoOrientativoDto, files, user.email);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Lista paginada e filtrada de documentos orientativos.', type: createSwaggerPaginatedResponseDto(DocumentoOrientativo) })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de itens por página' })
  async findAll(
    @Query() filterDto: FilterDocumentoOrientativoDto,
    @Query('page') page = 1,
    @Query('size') size = 10,
  ): Promise<PaginatedResponseInterface<DocumentoOrientativo>> {
    const [data, total] = await this.documentosOrientativosService.findAll(filterDto, page, size);
    return { data, total, page, size };
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Detalhes do documento orientativo.', type: DocumentoOrientativo })
  @ApiResponse({ status: 404, description: 'Documento não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentosOrientativosService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('ADMINISTRATIVO')
  @UseGuards(RolesGuard)
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateDocumentoOrientativoStatusDto })
  @ApiResponse({ status: 200, description: 'Status do documento orientativo atualizado com sucesso.', type: DocumentoOrientativo })
  @ApiResponse({ status: 404, description: 'Documento não encontrado.' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentoOrientativoStatusDto: UpdateDocumentoOrientativoStatusDto,
  ) {
    return this.documentosOrientativosService.updateStatus(id, updateDocumentoOrientativoStatusDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRATIVO')
  @UseGuards(RolesGuard)
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Documento orientativo removido com sucesso.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentosOrientativosService.remove(id);
  }
}