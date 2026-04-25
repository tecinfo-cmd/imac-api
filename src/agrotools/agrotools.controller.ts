import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AgrotoolsService } from './agrotools.service';
import { SolicitacaoElegibilidade } from '../elegibilidade/entities/solicitacao-elegibilidade.entity';
import { ValidarConsultaQueryDto } from '../elegibilidade/dto/validar-consulta-query-dto';
import { JwtAuthGuard } from '../shared/guards/jwt.guard';
import { AnaliseRequest } from './request/analise-request';
import { RetornoAnaliseEntity } from './entities/retorno-analise.entity';
import { plainToInstance } from 'class-transformer';
import { TerritorioResponse } from './response/territorio/territorio-response';

@ApiTags('Integração Agrotools')
@Controller('/agrotools')
export class AgrotoolsController {
  constructor(private readonly agroToosService: AgrotoolsService) {}

  @Get('/solicitacoes/:id/validar')
  @ApiResponse({
    status: 200,
    description: 'Solicitação de consulta validado.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({
    type: SolicitacaoElegibilidade,
    description: 'Confirmação realizada com sucesso',
  })
  validarSolicitacaoConsulta(
    @Param('id') id: number,
    @Query() query: ValidarConsultaQueryDto,
  ) {
    return this.agroToosService.confirmarSolicitacao(id, query.token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/analise/protocolo')
  @ApiResponse({ status: 200, description: 'Consulta protocolos.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  consultaProtocolo() {
    return this.agroToosService.consultarProtocolos();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/analise/consulta/:idPropriedade')
  @ApiResponse({
    status: 200,
    description: 'Consulta Analise SocioAmbiental.',
    type: RetornoAnaliseEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  consultaAnalise(
    @Body() request: AnaliseRequest,
    @Param('idPropriedade') idPropriedade: number,
  ) {
    return this.agroToosService.consultaAnaliseSocioAmbiental(
      request,
      idPropriedade,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/plano-adequacao')
  @ApiResponse({ status: 200, description: 'Salva Plano de Adequacao.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  salvaPlanoAdequacao(
    @Query('idAnalise') idAnalise: number,
    @Query('codigoTerritorio') codigoTerritorio: string,
  ) {
    return this.agroToosService.salvaPlanoAdequacao(
      codigoTerritorio,
      idAnalise,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/plano-adequacao/gerar-imagem')
  @ApiResponse({
    status: 200,
    description: 'Gera imagem plano adequação.',
    type: TerritorioResponse,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  gerarImagen(@Query('codigoTerritorio') codigoTerritorio: string) {
    const territorio =
      this.agroToosService.retornaImagemPlano(codigoTerritorio);

    return plainToInstance(TerritorioResponse, territorio, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/contestacao')
  @ApiResponse({
    status: 200,
    description: 'Cria uma contestacao de multa baseada no territorio.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  salvaContestacao(
    @Query('idAnalise') idAnalise: number,
    @Query('codigoTerritorio') codigoTerritorio: string,
  ) {
    return this.agroToosService.salvaContestacao(codigoTerritorio, idAnalise);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/contestacao/documentos')
  @ApiResponse({
    status: 200,
    description: 'Retorna documentos contestação.',
    type: RetornoAnaliseEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  buscaDocumentos(
    @Query('idAnalise') idAnalise: number,
    @Query('codigoTerritorio') codigoTerritorio: string,
  ) {
    return this.agroToosService.buscarDocumento(idAnalise, codigoTerritorio);
  }
}
