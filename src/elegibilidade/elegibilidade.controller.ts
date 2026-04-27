import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ElegibilidadeService } from './elegibilidade.service';
import { CreateElegibilidadeRequestDto } from './dto/create-elegibilidade-request.dto';
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConsultaCarQueryDto } from './dto/consulta-car-query-dto';
import { ConsultaSolicitacaoQueryDto } from './dto/consulta-solicitacao-query-dto';
import { WebhookElegibilidadeDTO } from './dto/webhook-eligibilidade-dto';
import { Response } from 'express';
import {
  SolicitacaoElegibilidade,
  StatusSolicitacaoEligibilidade,
} from './entities/solicitacao-elegibilidade.entity';
import { PropriedadeConsulta } from './entities/consulta/propriedade-consulta.entity';
import { plainToInstance } from 'class-transformer';
import { ListarEligibilidadeResponse } from './response/listar-eligibilidade-response';
import { BuscarPorIdResponse } from './response/buscar-por-id-response';
import { ConsultaGraficoAcompanhamentoGeral } from './dto/consulta-grafico-acompanhamento-geral.dto';
import { createSwaggerPaginatedResponseDto } from '../shared/dto/swagger-paginated-response';
import { PaginatedResponseInterface } from '../shared/interfaces/paginated-response.interface';

@ApiTags('Elegibilidade')
@Controller('/elegibilidades')
export class ElegibilidadeController {
  constructor(private readonly elegibilidadeService: ElegibilidadeService) {}

  @Get('listar')
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'codigoMunicipio', required: false })
  @ApiQuery({ name: 'numeroCar', required: false })
  @ApiQuery({ name: 'carEstadual', required: false })
  @ApiQuery({ name: 'nomeProdutor', required: false })
  @ApiQuery({ name: 'nomePropriedade', required: false })
  @ApiQuery({ name: 'cpfCnpj', required: false })
  @ApiQuery({
    name: 'status',
    enum: StatusSolicitacaoEligibilidade,
    required: false,
  })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'size', type: Number, required: false })
  @ApiResponse({
    status: 200,
    description: '',
    type: createSwaggerPaginatedResponseDto(ListarEligibilidadeResponse),
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async listar(
    @Query('email') email?: string,
    @Query('numeroCar') numeroCar?: string,
    @Query('carEstadual') carEstadual?: string,
    @Query('status') status?: StatusSolicitacaoEligibilidade,
    @Query('nomeProdutor') nomeProdutor?: string,
    @Query('nomePropriedade') nomePropriedade?: string,
    @Query('cpfCnpj') cpfCnpj?: string,
    @Query('page') page = 1,
    @Query('size') size = 10,
  ): Promise<PaginatedResponseInterface<ListarEligibilidadeResponse>> {
    const [eligibidades, total] =
      await this.elegibilidadeService.listarPaginado(
        email,
        numeroCar,
        carEstadual,
        status,
        nomeProdutor,
        nomePropriedade,
        cpfCnpj,
        page,
        size,
      );

    const data = plainToInstance(ListarEligibilidadeResponse, eligibidades, {
      excludeExtraneousValues: true,
    });

    return { data, total, page, size };
  }

  @Get('buscar-por-id/:id')
  @ApiResponse({ status: 200, description: '', type: BuscarPorIdResponse })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async buscarPorId(@Param('id') id: number): Promise<BuscarPorIdResponse> {
    return await this.elegibilidadeService.buscarPorId(id);
  }

  @Post('/solicitacoes')
  @ApiResponse({
    status: 200,
    description: 'Solicitação de Elegibilidade cadastrada com sucesso.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({
    type: CreateElegibilidadeRequestDto,
    description:
      'Solicitação de Elegibilidade contendo CAR, telefone, email e cpf ou cnpj',
  })
  async criarSolicitacao(
    @Body() createElegibilidadeRequestDto: CreateElegibilidadeRequestDto,
    @Res() res: Response,
  ) {
    await this.elegibilidadeService.criarSolicitacao(
      createElegibilidadeRequestDto,
    );

    return res.status(HttpStatus.OK).json({
      message: 'Solicitação enviada com sucesso!',
      statusCode: 200,
    });
  }

  @Get('/solicitacoes')
  @ApiResponse({
    status: 200,
    description:
      'Consulta uma solicitação de elegibilidade baseada nos parametro CAR, Nome Propriedade,  Municipio e status voucher.',
    type: SolicitacaoElegibilidade,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  consultaElegibilidade(@Query() filtro: ConsultaSolicitacaoQueryDto) {
    return this.elegibilidadeService.consultaSolicitacaoElegibilidade(filtro);
  }

  @Get('/consulta-car')
  @ApiResponse({
    status: 200,
    description:
      'Consulta car baseado no cpf, cnpj ou numero do car estatual.',
    type: PropriedadeConsulta,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  consultaCar(@Query() query: ConsultaCarQueryDto) {
    return this.elegibilidadeService.consultaPropriedadeConsultaCar(
      query.cpf,
      query.cnpj,
      query.carEstadual,
    );
  }

  @Get('/solicitacoes/:email')
  @ApiResponse({
    status: 200,
    description: 'Consulta solicitação pelo email do proprietario',
    type: SolicitacaoElegibilidade,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  buscarUsuarioPorEmail(@Param('email') email: string) {
    return this.elegibilidadeService.buscarElegidibilidadePorEmail(email);
  }

  @ApiExcludeEndpoint(true)
  @Post('/webhook')
  @ApiResponse({ status: 200, description: 'Webhook recebido.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  webhook(@Body() body: WebhookElegibilidadeDTO) {
    console.log(body);
  }

  @Get('/grafico-acompanhamento-geral')
  @ApiQuery({ name: 'dataInicio', required: false })
  @ApiQuery({ name: 'dataFim', required: false })
  @ApiResponse({
    status: 200,
    description: 'Retorna os indicadores do grafico de acompanhamento geral',
    type: ConsultaGraficoAcompanhamentoGeral,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  graficoAcompanhamentoGeral(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.elegibilidadeService.graficoAcompanhamentoGeral(
      dataInicio,
      dataFim,
    );
  }
}
