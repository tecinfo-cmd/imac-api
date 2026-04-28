import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt.guard';
import { UsuarioService } from './usuario.service';
import { UsuarioResponse } from './response/usuario-response';
import { ListarUsuarioResponse } from './response/listar-usuario-response';
import { plainToInstance } from 'class-transformer';
import { StatusUsuario } from './enums/usuario-status';
import { UsuarioRequest } from './request/usuario-request.dto';
import { PaginatedResponseInterface } from '../shared/interfaces/paginated-response.interface';
import { createSwaggerPaginatedResponseDto } from '../shared/dto/swagger-paginated-response';

@ApiTags('Usuário')
@UseGuards(JwtAuthGuard)
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @ApiResponse({
    status: 200,
    description: 'Usuario criado com sucesso.',
    type: UsuarioResponse,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post()
  criarUsuario(@Body() createUsuarioDto: UsuarioRequest) {
    return this.usuarioService.criarUsuario(createUsuarioDto);
  }

  @Get('listar')
  @ApiResponse({
    status: 200,
    description: 'Listar usuários',
    type: createSwaggerPaginatedResponseDto(ListarUsuarioResponse),
  })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'nome', required: false })
  @ApiQuery({ name: 'status', enum: StatusUsuario, required: false })
  @ApiQuery({ name: 'perfil', required: false })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página',
  })
  @ApiQuery({
    name: 'size',
    required: false,
    type: Number,
    description: 'Tamanho da página',
  })
  async listarPorFiltro(
    @Query('email') email?: string,
    @Query('nome') nome?: string,
    @Query('status') status?: StatusUsuario,
    @Query('perfil') perfil?: string,
    @Query('page') page = 1,
    @Query('size') size = 10,
  ): Promise<PaginatedResponseInterface<ListarUsuarioResponse>> {
    return await this.usuarioService.listarPaginado(
      email,
      nome,
      status,
      perfil,
      page,
      size,
    );
  }

  @Get('email/:email')
  buscarUsuarioPorEmail(@Param('email') email: string) {
    return this.usuarioService.buscaUSuarioPorEmail(email);
  }

  @Get('buscar-por-id/:id')
  async buscarUsuarioPorId(@Param('id') id: number): Promise<UsuarioResponse> {
    const data = plainToInstance(
      UsuarioResponse,
      this.usuarioService.buscarUsuarioPorId(id),
      { excludeExtraneousValues: true },
    );
    return data;
  }

  @Patch(':id')
  atualizarUsuario(
    @Param('id') id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuarioService.atualizarUsuario(id, updateUsuarioDto);
  }

  @Delete(':id')
  deletarUsuario(@Param('id') id: number) {
    return this.usuarioService.deletarUsuario(id);
  }

  @Put('redistribuir/:id')
  async redistribuir(
    @Param('id') id: number,
  ): Promise<PaginatedResponseInterface<ListarUsuarioResponse>> {
    return await this.usuarioService.redistribuirPropriedadeAnalista(id);
  }
}
