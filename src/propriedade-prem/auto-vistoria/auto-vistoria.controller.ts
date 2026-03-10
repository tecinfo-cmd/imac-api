import { ApiBody, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Query, Request, UseGuards, Param } from '@nestjs/common';
import { MensagemResponse } from '../response/mensagem-response';
import { AutoVistoriaRequest } from './request/auto-vistoria.request';
import { AutoVistoriaService } from './auto-vistoria.service';
import { AutoVistoriaResponse } from './response/auto-vistoria-response';
import { plainToInstance } from 'class-transformer';
import { Roles } from '../../shared/decorators/roles.decorator';
import { AuthenticatedRequest } from '../../shared/interfaces/authenticated-request.interface';
import { InformacaoVistoriaRequest } from './request/informacao-vistoria.request';
import { JwtAuthGuard } from '../../shared/guards/jwt.guard';
import { ApiKeyGuard } from '../../auth/api-key/api-key-guard';
import { ValidarUploadArquivos } from '../../shared/decorators/validar-upload-arquivos.decorator';
import { CriarParecerAutoVistoriaResponse } from './response/criar-parecer-auto-vistoria-response';
import { CriarParecerAutoVistoriaRequest } from './request/criar-parecer-auto-vistoria-request';
import { UploadPayload } from 'src/shared/decorators/upload-payload.decorator';
import { UploadPayloadType } from 'src/shared/types/upload-payload.type';
import { ValidacaoArquivoPipe } from 'src/shared/pipes/validacao-arquivo.pipe';
import { RolesGuard } from '../../shared/guards/roles.guard';

@ApiTags('Auto Vistoria')
@Controller('auto-vistoria')
export class AutoVistoriaController {

  constructor(private readonly service: AutoVistoriaService) { }

  @Post('/cadastro')
  @Roles('ANALISTA')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Auto Vistoria cadastrada com sucesso', type: MensagemResponse })
  @ApiBody({
    type: AutoVistoriaRequest,
    description: 'Cadastro e atualização de um proprietario. Campo idProprietario somente para atualização de um proprietario existente.',
  })
  cadastrarVistoria(@Body() request: AutoVistoriaRequest, @Request() usuarioLogado: AuthenticatedRequest) {
    return this.service.cadastrarAutoVistoria(request, usuarioLogado);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ANALISTA')
  @Post('/:id/parecer-auto-vistoria')
  @ValidarUploadArquivos()
  @ApiResponse({ status: 200, description: 'Parecer do plano da auto vistoria cadastrada com sucesso', type: CriarParecerAutoVistoriaResponse })
  @ApiBody({
    type: CriarParecerAutoVistoriaRequest,
    description: 'Cadastro de parecer da auto vistoria.',
  })
  async cadastrarParecerPlanoAdequacao(
    @UploadPayload(CriarParecerAutoVistoriaRequest, ValidacaoArquivoPipe)
    payload: UploadPayloadType<CriarParecerAutoVistoriaRequest>,
    @Param('id')
    id: number
  ): Promise<CriarParecerAutoVistoriaResponse> {
    const parecerAutovistoira = await this.service.criarParecerAutoVistoria(id, payload);

    return plainToInstance(CriarParecerAutoVistoriaResponse, parecerAutovistoira, { excludeExtraneousValues: true });
  }

  @Post('/webhook-url')
  @Roles('ANALISTA')
  @ApiSecurity('api-key-header')
  @UseGuards(ApiKeyGuard)
  @ApiResponse({ status: 200, description: 'Atualização url imagem', type: MensagemResponse })
  @ApiBody({
    type: InformacaoVistoriaRequest,
    description: 'Serviço disponibilizado para agrotools enviar atualização report url .',
  })
  webHookUrl(@Body() request: InformacaoVistoriaRequest) {
    return this.service.consultaInformacao(request);
  }

 @Get()
  @Roles('ANALISTA', 'PRODUTOR')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Listar autovistoria do Usuario Logado', type: [AutoVistoriaResponse] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async consultaElegibilidade(
    @Query('idPropriedade') idPropriedade: number,
    @Request() request: AuthenticatedRequest
  ) {

    const autovistorias = await this.service.consultaAutoVistoria(idPropriedade, request.user);
    if (autovistorias) {
      // @ts-ignore
      autovistorias.forEach(at => {
        return at.formularios = JSON.parse(<string>at.formulario);
      })
    }

    return plainToInstance(AutoVistoriaResponse, autovistorias, { excludeExtraneousValues: true });
  }
}
