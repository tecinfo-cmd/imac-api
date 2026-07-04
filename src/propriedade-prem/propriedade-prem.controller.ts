import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PropriedadePremService } from './propriedade-prem.service';
import {
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../shared/guards/jwt.guard';
import { ConsultaPropriedadeRequest } from './dto/consulta-propriedade-request';
import { Propriedade } from './entities/propriedade.entity';
import { Cidade } from '../elegibilidade/entities/cidade.entity';
import { MensagemResponse } from './response/mensagem-response';
import { DadosBasicosRequest } from './request/dados-basicos-request';
import { ProprietarioProprietarioRequest } from './request/proprietario-proprietario-request';
import { AtividadePrincipal } from './entities/atividade-principal.entity';
import { CicloProducao } from './entities/ciclo-producao.entity';
import { UploadDocumentosResponse } from './dto/upload-documentos-response';
import { ListarPropriedadeResponse } from './response/listar-propriedade-response';
import { plainToInstance } from 'class-transformer';
import { ValidarUploadArquivos } from '../shared/decorators/validar-upload-arquivos.decorator';
import { ValidacaoArquivoPipe } from '../shared/pipes/validacao-arquivo.pipe';
import { UploadDocumentosPropriedadeRequest } from './dto/upload-documentos-propriedade-request';
import { UploadPayload } from '../shared/decorators/upload-payload.decorator';
import { UploadPayloadType } from '../shared/types/upload-payload.type';
import { AuthenticatedRequest } from '../shared/interfaces/authenticated-request.interface';
import { createSwaggerPaginatedResponseDto } from '../shared/dto/swagger-paginated-response';
import { PaginatedResponseInterface } from '../shared/interfaces/paginated-response.interface';
import { Roles } from '../shared/decorators/roles.decorator';
import {
  TypePost,
  WebhookAssinaturaRequest,
} from './dto/webhook-assinatura-request';
import { ValidacaoDCSResponse } from './dto/validacao-dcs-response';
import { RolesGuard } from '../shared/guards/roles.guard';
import { AcoesRequest } from './dto/acoes-request';

@ApiTags('Propriedade PREM')
@Controller('propriedade-prem')
export class PropriedadePremController {
  constructor(
    private readonly propriedadePremService: PropriedadePremService,
  ) {}

  @Put('/dados-basicos')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'Dados atualizados com sucesso!',
    type: MensagemResponse,
  })
  cadastraEnderecoPropriedade(
    @Body() dadosBasicosRequest: DadosBasicosRequest,
    @Query('idPropriedade') idPropriedade: number,
    @Request() usuarioLogado: AuthenticatedRequest,
  ) {
    return this.propriedadePremService.atualizaDadosBasicos(
      idPropriedade,
      dadosBasicosRequest,
      usuarioLogado,
    );
  }

  @Post('/cadastro/proprietarios')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Proprietario(s) cadastrado(s) com sucesso',
    type: MensagemResponse,
  })
  @ApiBody({
    type: [ProprietarioProprietarioRequest],
    description:
      'Cadastro e atualização de um proprietario. Campo idProprietario somente para atualização de um proprietario existente.',
  })
  cadastrarProprietario(
    @Body() proprietarioRequest: ProprietarioProprietarioRequest[],
    @Query('idPropriedade') idPropriedade: number,
    @Request() usuarioLogado: AuthenticatedRequest,
  ) {
    return this.propriedadePremService.cadastraProprietario(
      idPropriedade,
      proprietarioRequest,
      usuarioLogado,
    );
  }

  @Get('/proprietario')
  @ApiResponse({
    status: 200,
    description: 'Consulta propriedades do usuario logado',
    type: [Propriedade],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiQuery({ name: 'email', required: false, type: String })
  @UseGuards(JwtAuthGuard)
  consultaPorProprietario(@Query('email') email: string) {
    return this.propriedadePremService.consultaPorProprietario(email);
  }

  @Get('/cidade')
  @ApiResponse({
    status: 200,
    description: 'Consulta cidade(s) com base no Nome.',
    type: [Cidade],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiQuery({ name: 'nome', required: false, type: String })
  @UseGuards(JwtAuthGuard)
  consultaCidade(@Query('nome') nome?: string) {
    return this.propriedadePremService.consultaCidadePorNome(nome);
  }

  @ApiResponse({
    status: 200,
    description: 'Retorna lista com as Atividades Principais.',
    type: [AtividadePrincipal],
  })
  @Get('/atividade-principal')
  @UseGuards(JwtAuthGuard)
  listarAtividadePrincipal() {
    return this.propriedadePremService.listarAtividadePrincipal();
  }

  @ApiResponse({
    status: 200,
    description: 'Retorna lista de Ciclo de Produção.',
    type: [CicloProducao],
  })
  @Get('/ciclo-producao')
  @UseGuards(JwtAuthGuard)
  listarCicloProducao() {
    return this.propriedadePremService.listarCicloProducao();
  }

  @Post('/:id/upload-documentos')
  @Roles('PRODUTOR', 'ANALISTA')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ValidarUploadArquivos()
  @ApiResponse({
    status: 201,
    description: 'arquivo(s) processado(s) e persistidos com sucesso.',
    type: [UploadDocumentosResponse],
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitação inválida ou arquivo não enviado.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao processar os arquivos.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'ID da propriedade para upload dos documentos',
  })
  async uploadDocumentos(
    @Param('id') id: number,
    @UploadPayload(UploadDocumentosPropriedadeRequest, ValidacaoArquivoPipe)
    payload: UploadPayloadType<UploadDocumentosPropriedadeRequest>,
    @Request() request: AuthenticatedRequest,
  ): Promise<UploadDocumentosResponse[]> {
    const user = request.user;

    return this.propriedadePremService.uploadDocumentos(
      id,
      user.email,
      payload.arquivos,
      payload.body.parametros,
    );
  }

  @Roles('ANALISTA')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/:id/documentos-analista')
  @ApiResponse({
    status: 200,
    description:
      'Lista de documentos enviados pelo analista para a propriedade.',
    type: [UploadDocumentosResponse],
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'ID da propriedade',
  })
  async listarDocumentosAnalista(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UploadDocumentosResponse[]> {
    return this.propriedadePremService.listarDocumentosAnalista(id);
  }

  @Roles('PRODUTOR')
  @UseGuards(JwtAuthGuard)
  @Post('/:id/aceitar-termo-adequacao')
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'ID da propriedade para aceitar termo de adequação',
  })
  @ApiResponse({
    status: 200,
    description: 'Aceita o termo de adequação da propriedade',
    type: Propriedade,
  })
  aceitarTermoAdequacao(@Param('id', ParseIntPipe) id: number) {
    return this.propriedadePremService.aceitarTermoAdequacao(id);
  }

  @Get('/multas/:id')
  @UseGuards(JwtAuthGuard)
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'ID da propriedade para busca',
  })
  @ApiResponse({
    status: 200,
    description: 'Consulta uma propriedade pelo id com boletos de multas',
    type: Propriedade,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  consultaPropriedadePorIdMultas(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: AuthenticatedRequest,
  ) {
    return this.propriedadePremService.consultaPropriedadePorIdMultas(
      id,
      request,
    );
  }

  @Post('/webhook-assinatura')
  @ApiResponse({
    status: 200,
    description: 'Webhook de assinatura recebido com sucesso',
  })
  async webhookAssinatura(@Body() body: WebhookAssinaturaRequest) {
    if (body.type_post == TypePost.DocumentoAssinado) {
      await this.propriedadePremService.pegarLinkDocumentoTermoCompromissoAssinado(
        body.uuid,
      );
      await this.propriedadePremService.termoCompromissoAssinado(
        body.uuid,
        body.email!,
      );
    }
  }

  @Get('/conformidade-socioambiental')
  @ApiResponse({
    status: 200,
    description:
      'Retorna o status da autorização de comercialização da propriedade',
    type: ValidacaoDCSResponse,
  })
  @ApiQuery({
    name: 'idPropriedade',
    required: false,
    type: Number,
    description:
      'ID da propriedade para buscar o status da autorização de comercialização',
  })
  @ApiQuery({
    name: 'carFederal',
    required: false,
    type: String,
    description:
      'CAR Federal da propriedade para buscar o status da autorização de comercialização',
  })
  async getStatusAutorizacaoComercializacao(
    @Query('idPropriedade') idPropriedade?: number,
    @Query('carFederal') carFederal?: string,
  ): Promise<ValidacaoDCSResponse> {
    return await this.propriedadePremService.validarDCS(
      idPropriedade,
      carFederal,
    );
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'ID da propriedade para busca',
  })
  @ApiResponse({
    status: 200,
    description: 'Consulta uma propriedade pelo id',
    type: Propriedade,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async consultaPropriedadePorId(
    @Param('id', ParseIntPipe) id: number,
    @Request() request: AuthenticatedRequest,
  ) {
    const propriedade =
      await this.propriedadePremService.consultaPropriedadePorId(id, request);
    return plainToInstance(Propriedade, propriedade, {
      excludeExtraneousValues: true,
    });
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'ID da propriedade para deletar',
  })
  deletarPropriedade(@Param('id', ParseIntPipe) id: number) {
    return this.propriedadePremService.deletar(id);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description:
      'Consulta uma propriedade de elegibilidade baseada nos parametro CAR, Nome Propriedade,  Municipio e status voucher.',
    type: createSwaggerPaginatedResponseDto(ListarPropriedadeResponse),
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
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
  @UseGuards(JwtAuthGuard)
  async consultaElegibilidade(
    @Request() request: AuthenticatedRequest,
    @Query() filtro: ConsultaPropriedadeRequest,
    @Query('page') page = 1,
    @Query('size') size = 10,
  ): Promise<PaginatedResponseInterface<ListarPropriedadeResponse>> {
    const [propriedades, total] =
      await this.propriedadePremService.consultaPropriedadeFiltro(
        filtro,
        request,
        page,
        size,
      );

    const data = plainToInstance(ListarPropriedadeResponse, propriedades, {
      excludeExtraneousValues: true,
    });

    return { data, total, page, size };
  }

  @Put('/acoes')
  @ApiResponse({ status: 200, description: 'Acão Atualizada com sucesso' })
  async alterarAcao(@Body() request: AcoesRequest) {
    await this.propriedadePremService.alterarAcao(request);
    return { message: 'Ação Alterada com sucesso' };
  }
}
