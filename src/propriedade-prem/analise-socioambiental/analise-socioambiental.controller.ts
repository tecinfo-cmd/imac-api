import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CriarContestacaoAutorizacaoSupressaoRequest } from './dto/criar-contestacao-autorizacao-supressao-request';
import { CriarContestacaoAutorizacaoSupressaoResponse } from './dto/criar-autorizacao-supressao-response';
import { AnaliseSocioambientalService } from './analise-socioambiental.service';
import { CriarContestacaoLaudoResponse } from './dto/criar-contestacao-laudo-response';
import { CriarContestacaoLaudoRequest } from './dto/criar-contestacao-laudo-request';
import { BuscarTiposAutorizacaoSupressaoResponse } from './dto/buscar-tipos-contestacao-autorizacao-supressao-response';
import { BuscarOrgaosEmissoresAutorizacaoSupressaoResponse } from './dto/buscar-orgaos-emissores-contestacao-autorizacao-supressao-response';
import { JwtAuthGuard } from '../../shared/guards/jwt.guard';
import { ValidarUploadArquivos } from '../../shared/decorators/validar-upload-arquivos.decorator';
import { ValidacaoArquivoPipe } from '../../shared/pipes/validacao-arquivo.pipe';
import { UploadPayload } from '../../shared/decorators/upload-payload.decorator';
import { EnviarArquivosContestacaoAutorizacaoSupressaoRequest } from './dto/enviar-arquivos-contestacao-autorizacao-supressao-request';
import { EnviarArquivosContestacaoAutorizacaoSupressaoResponse } from './dto/enviar-arquivos-autorizacao-supressao-response';
import { EnviarArquivosContestacaoLaudoRequest } from './dto/enviar-arquivos-contestacao-laudo-request';
import { EnviarArquivosContestacaoLaudoResponse } from './dto/enviar-arquivos-contestacao-laudo-response';
import { plainToClass, plainToInstance } from 'class-transformer';
import { BuscarAnaliseSocioambientalResponse } from './dto/buscar-analise-socioambiental-response';
import { CriarPlanoAdequacaoRequest } from './dto/criar-plano-adequacao-request';
import { CriarPlanoAdequacaoResponse } from './dto/criar-plano-adequacao-response';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { AuthenticatedRequest } from '../../shared/interfaces/authenticated-request.interface';
import { UploadPayloadType } from '../../shared/types/upload-payload.type';
import { CriarParecerContestacaoRequest } from './dto/criar-parecer-contestacao-request';
import { CriarParecerContestacaoResponse } from './dto/criar-parecer-contestacao-response';
import { CriarParecerPlanoAdequacaoRequest } from './dto/criar-parecer-plano-adequacao-request';
import { CriarParecerPlanoAdequacaoResponse } from './dto/criar-parecer-plano-adequacao-response';

@ApiTags('Análise Socioambiental')
@Controller('propriedade-prem')
@UseGuards(JwtAuthGuard)
export class AnaliseSocioambientalController {
  constructor(
    private readonly analiseSocioambientalService: AnaliseSocioambientalService,
  ) {}

  @Roles('PRODUTOR', 'ANALISTA')
  @UseGuards(RolesGuard)
  @Get(':idPropriedade/analise-socioambiental/:idAnalise')
  @ApiResponse({
    status: 200,
    description: 'Análise socioambiental encontrada com sucesso',
    type: BuscarAnaliseSocioambientalResponse,
  })
  async buscarAnaliseSocioambiental(
    @Param('idPropriedade')
    idPropriedade: number,
    @Param('idAnalise')
    idAnalise: number,
    @Request()
    request: AuthenticatedRequest,
  ): Promise<BuscarAnaliseSocioambientalResponse> {
    const analiseSocioambiental =
      await this.analiseSocioambientalService.buscarAnaliseSocioambiental(
        idPropriedade,
        idAnalise,
        request,
      );

    return plainToInstance(
      BuscarAnaliseSocioambientalResponse,
      analiseSocioambiental,
      { excludeExtraneousValues: true },
    );
  }

  @Roles('PRODUTOR')
  @UseGuards(RolesGuard)
  @Post(
    ':idPropriedade/analise-socioambiental/:idAnalise/contestacao-autorizacao-supressao',
  )
  @ValidarUploadArquivos()
  @ApiResponse({
    status: 200,
    description:
      'Contestação de autorização de supressão cadastrada com sucesso',
    type: CriarContestacaoAutorizacaoSupressaoResponse,
  })
  @ApiBody({
    type: CriarContestacaoAutorizacaoSupressaoRequest,
    description: 'Cadastro de constestação de autorização de supressão.',
  })
  async cadastrarContestacaoAutorizacaoSupressao(
    @UploadPayload(
      CriarContestacaoAutorizacaoSupressaoRequest,
      ValidacaoArquivoPipe,
    )
    payload: UploadPayloadType<CriarContestacaoAutorizacaoSupressaoRequest>,
    @Param('idPropriedade')
    idPropriedade: number,
    @Param('idAnalise')
    idAnalise: number,
    @Request()
    request: AuthenticatedRequest,
  ): Promise<CriarContestacaoAutorizacaoSupressaoResponse> {
    const contestacaoAutorizacaoSupressao =
      await this.analiseSocioambientalService.criarContestacaoAutorizacaoSupressao(
        idPropriedade,
        idAnalise,
        request,
        payload,
      );

    return plainToInstance(
      CriarContestacaoAutorizacaoSupressaoResponse,
      contestacaoAutorizacaoSupressao,
      { excludeExtraneousValues: true },
    );
  }

  @Roles('PRODUTOR')
  @UseGuards(RolesGuard)
  @Post(':idPropriedade/analise-socioambiental/:idAnalise/contestacao-laudo')
  @ValidarUploadArquivos()
  @ApiResponse({
    status: 200,
    description: 'Contestação por laudo cadastrada com sucesso',
    type: CriarContestacaoLaudoResponse,
  })
  @ApiBody({
    type: CriarContestacaoLaudoRequest,
    description: 'Cadastro de constestação por laudo.',
  })
  async cadastarContestacaoLaudo(
    @UploadPayload(CriarContestacaoLaudoRequest, ValidacaoArquivoPipe)
    payload: UploadPayloadType<CriarContestacaoLaudoRequest>,
    @Param('idPropriedade')
    idPropriedade: number,
    @Param('idAnalise')
    idAnalise: number,
    @Request()
    request: AuthenticatedRequest,
  ): Promise<CriarContestacaoLaudoResponse> {
    const contestacaoLaudo =
      await this.analiseSocioambientalService.criarContestacaoLaudo(
        idPropriedade,
        idAnalise,
        request,
        payload,
      );

    return plainToInstance(CriarContestacaoLaudoResponse, contestacaoLaudo, {
      excludeExtraneousValues: true,
    });
  }

  @Roles('PRODUTOR', 'ANALISTA')
  @UseGuards(RolesGuard)
  @Get('analise-socioambiental/tipos-contestacao-autorizacao-supressao')
  @ApiResponse({
    status: 200,
    description: 'Lista tipos de contestação de autorização de supressão.',
    type: [BuscarTiposAutorizacaoSupressaoResponse],
  })
  async buscarTiposContestacaoAutorizacaoSupressao() {
    const tiposContestacaoAutorizacaoSupressao =
      await this.analiseSocioambientalService.buscarTipoAutorizacaoSupressao();

    return tiposContestacaoAutorizacaoSupressao;
  }

  @Roles('PRODUTOR', 'ANALISTA')
  @UseGuards(RolesGuard)
  @Get('analise-socioambiental/orgaos-emissores-autorizacao-supressao')
  @ApiResponse({
    status: 200,
    description:
      'Lista orgãos emissores de contestação de autorização de supressão.',
    type: [BuscarOrgaosEmissoresAutorizacaoSupressaoResponse],
  })
  async buscarOrgaosEmissoresAutorizacaoSupressao() {
    const orgaosEmissoresAutorizacaoSupressao =
      await this.analiseSocioambientalService.buscarOrgaoEmissorAutorizacaoSupressao();

    return orgaosEmissoresAutorizacaoSupressao;
  }

  @Roles('PRODUTOR')
  @UseGuards(RolesGuard)
  @Put(
    ':idPropriedade/analise-socioambiental/:idAnalise/contestacao-autorizacao-supressao/:idContestacao',
  )
  @ValidarUploadArquivos()
  @ApiResponse({
    status: 200,
    description: 'Envio de arquivos realizado com sucesso',
    type: EnviarArquivosContestacaoAutorizacaoSupressaoResponse,
  })
  @ApiBody({
    type: EnviarArquivosContestacaoAutorizacaoSupressaoRequest,
    description:
      'Envio de arquivos de arquivos para constestação de autorização de supressão.',
  })
  async enviarArquivosContestacaoAutorizacaoSupressao(
    @UploadPayload(
      EnviarArquivosContestacaoAutorizacaoSupressaoRequest,
      ValidacaoArquivoPipe,
    )
    payload: UploadPayloadType<EnviarArquivosContestacaoAutorizacaoSupressaoRequest>,
    @Param('idPropriedade')
    idPropriedade: number,
    @Param('idAnalise')
    idAnalise: number,
    @Param('idContestacao')
    idContestacao: number,
    @Request()
    request: AuthenticatedRequest,
  ): Promise<EnviarArquivosContestacaoAutorizacaoSupressaoResponse> {
    const contestacaoAutorizacaoSupressao =
      await this.analiseSocioambientalService.enviarArquivosContestacaoAutorizacaoSupressao(
        idPropriedade,
        idAnalise,
        idContestacao,
        request,
        payload,
      );

    return plainToInstance(
      EnviarArquivosContestacaoAutorizacaoSupressaoResponse,
      contestacaoAutorizacaoSupressao,
      { excludeExtraneousValues: true },
    );
  }

  @Roles('PRODUTOR')
  @UseGuards(RolesGuard)
  @Put(
    ':idPropriedade/analise-socioambiental/:idAnalise/contestacao-laudo/:idContestacao',
  )
  @ValidarUploadArquivos()
  @ApiResponse({
    status: 200,
    description: 'Envio de arquivos realizado com sucesso',
    type: EnviarArquivosContestacaoLaudoResponse,
  })
  @ApiBody({
    type: EnviarArquivosContestacaoLaudoRequest,
    description: 'Envio de arquivos de arquivos para constestação por laudo.',
  })
  async enviarArquivosLaudo(
    @UploadPayload(EnviarArquivosContestacaoLaudoRequest, ValidacaoArquivoPipe)
    payload: UploadPayloadType<EnviarArquivosContestacaoLaudoRequest>,
    @Param('idPropriedade')
    idPropriedade: number,
    @Param('idAnalise')
    idAnalise: number,
    @Param('idContestacao')
    idContestacao: number,
    @Request()
    request: AuthenticatedRequest,
  ): Promise<EnviarArquivosContestacaoLaudoResponse> {
    const contestacaoLaudo =
      await this.analiseSocioambientalService.enviarArquivosContestacaoLaudo(
        idPropriedade,
        idAnalise,
        idContestacao,
        request,
        payload,
      );

    return plainToClass(
      EnviarArquivosContestacaoLaudoResponse,
      contestacaoLaudo,
      { excludeExtraneousValues: true },
    );
  }

  @Roles('PRODUTOR')
  @UseGuards(RolesGuard)
  @Post(':idPropriedade/analise-socioambiental/:idAnalise/plano-adequacao')
  @ValidarUploadArquivos()
  @ApiResponse({
    status: 200,
    description: 'Plano de adequação cadastrado com sucesso',
    type: CriarPlanoAdequacaoResponse,
  })
  @ApiBody({
    type: CriarPlanoAdequacaoRequest,
    description: 'Cadastro de plano de adequação.',
  })
  async cadastrarPlanoAdequacao(
    @UploadPayload(CriarPlanoAdequacaoRequest, ValidacaoArquivoPipe)
    payload: UploadPayloadType<CriarPlanoAdequacaoRequest>,
    @Param('idPropriedade')
    idPropriedade: number,
    @Param('idAnalise')
    idAnalise: number,
    @Request()
    request: AuthenticatedRequest,
  ): Promise<CriarPlanoAdequacaoResponse> {
    const planoAdequacao =
      await this.analiseSocioambientalService.criarPlanoAdequacao(
        idPropriedade,
        idAnalise,
        request,
        payload,
      );

    return plainToInstance(CriarPlanoAdequacaoResponse, planoAdequacao, {
      excludeExtraneousValues: true,
    });
  }

  @Roles('ANALISTA')
  @UseGuards(RolesGuard)
  @Post(':idPropriedade/analise-socioambiental/:idAnalise/parecer-contestacao')
  @ValidarUploadArquivos()
  @ApiResponse({
    status: 200,
    description: 'Parecer da contestação cadastrado com sucesso',
    type: CriarParecerContestacaoResponse,
  })
  @ApiBody({
    type: CriarParecerContestacaoRequest,
    description: 'Cadastro de parecer da contestação.',
  })
  async cadastrarParecerContestacao(
    @UploadPayload(CriarParecerContestacaoRequest, ValidacaoArquivoPipe)
    payload: UploadPayloadType<CriarParecerContestacaoRequest>,
    @Param('idPropriedade')
    idPropriedade: number,
    @Param('idAnalise')
    idAnalise: number,
    @Request()
    request: AuthenticatedRequest,
  ): Promise<CriarParecerContestacaoResponse> {
    const parecerContestacao =
      await this.analiseSocioambientalService.criarParecerContestacao(
        idPropriedade,
        idAnalise,
        request,
        payload,
      );

    return plainToInstance(
      CriarParecerContestacaoResponse,
      parecerContestacao,
      { excludeExtraneousValues: true },
    );
  }

  @Roles('ANALISTA')
  @UseGuards(RolesGuard)
  @Post(
    ':idPropriedade/analise-socioambiental/:idAnalise/parecer-plano-adequacao/:idPlanoAdequacao',
  )
  @ValidarUploadArquivos()
  @ApiResponse({
    status: 200,
    description: 'Parecer do plano de adequação cadastrado com sucesso',
    type: CriarParecerContestacaoResponse,
  })
  @ApiBody({
    type: CriarParecerPlanoAdequacaoRequest,
    description: 'Cadastro de parecer do plano de adequação.',
  })
  async cadastrarParecerPlanoAdequacao(
    @UploadPayload(CriarParecerPlanoAdequacaoRequest, ValidacaoArquivoPipe)
    payload: UploadPayloadType<CriarParecerPlanoAdequacaoRequest>,
    @Param('idPropriedade')
    idPropriedade: number,
    @Param('idAnalise')
    idAnalise: number,
    @Param('idPlanoAdequacao')
    idPlanoAdequacao: number,
    @Request()
    request: AuthenticatedRequest,
  ): Promise<CriarParecerPlanoAdequacaoResponse> {
    const parecerPlanoAdequacao =
      await this.analiseSocioambientalService.criarParecerPlanoAdequacao(
        idPropriedade,
        idAnalise,
        idPlanoAdequacao,
        request,
        payload,
      );

    return plainToInstance(
      CriarParecerPlanoAdequacaoResponse,
      parecerPlanoAdequacao,
      { excludeExtraneousValues: true },
    );
  }
}
