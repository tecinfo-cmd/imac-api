import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt.guard';
import { ResponsavelTecnicoResponse } from './dto/responsavel-tecnico-response';
import { ConsultaResponsavelTecnicoRequest } from './dto/consulta-responsavel-tecnico-request';
import { createSwaggerPaginatedResponseDto } from '../shared/dto/swagger-paginated-response';
import { PaginatedResponseInterface } from '../shared/interfaces/paginated-response.interface';
import { ResponsavelTecnicoService } from './responsavel-tecnico.service';
import { plainToInstance } from 'class-transformer';
import { CriarResponsavelTecnicoRequest } from './dto/criar-responsavel-tecnico-request';

@ApiTags('Responsável Técnico')
@Controller('responsavel-tecnico')
@UseGuards(JwtAuthGuard)
export class ResponsavelTecnicoController {
  constructor(
    private responsavelTecnicoService: ResponsavelTecnicoService
  ) { }

  @Post()
  @ApiResponse({ status: 200, description: 'Responsável criado com sucesso', type: ResponsavelTecnicoResponse })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({
    type: CriarResponsavelTecnicoRequest,
    description: 'Criação de responsável técnico',
  })
  async cadastrar(@Body() criarResponsavelTecnicoRequest: CriarResponsavelTecnicoRequest): Promise<ResponsavelTecnicoResponse> {

    const responsavelTecnico = await this.responsavelTecnicoService.criar(criarResponsavelTecnicoRequest);

    return plainToInstance(ResponsavelTecnicoResponse, responsavelTecnico);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Consulta realizada com sucesso.', type: createSwaggerPaginatedResponseDto(ResponsavelTecnicoResponse) })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Tamanho da página' })
  async consultar(
    @Query() filtro: ConsultaResponsavelTecnicoRequest,
    @Query('page') page = 1,
    @Query('size') size = 10
  ): Promise<PaginatedResponseInterface<ResponsavelTecnicoResponse>> {

    const [responsaveisTecnicos, total] = await this.responsavelTecnicoService.consultaResponsavelTecnicoFiltro(filtro, page, size);

    const data = plainToInstance(ResponsavelTecnicoResponse, responsaveisTecnicos);

    return { data, total, page, size };
  }
}
