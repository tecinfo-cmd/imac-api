import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FrigorificoService } from './frigorifico.service';
import { FrigorificoRequest } from './request/frigorifico-request';
import { Frigorifico, StatusFrigorifico } from './entities/frigorifico.entity';
import { UploadPayload } from '../shared/decorators/upload-payload.decorator';
import { UploadPayloadType } from '../shared/types/upload-payload.type';
import { TermoCooperacaoRequest } from './request/termo-cooperacao-request';
import { ValidarUploadTermo } from './decorator/validar-upload-termo.decorator';
import { UsuarioFrigoficoRequest } from '../usuario/request/usuario-frigorifico-request.dto';
import { JwtAuthGuard } from '../shared/guards/jwt.guard';
import { plainToInstance } from 'class-transformer';
import { FrigorificoResponse } from './response/frigorifico-response';
import { MensagemResponse } from '../propriedade-prem/response/mensagem-response';
import { UsuarioResponse } from '../usuario/response/usuario-response';
import { Usuario } from '../usuario/entities/usuario.entity';
import {
  SolicitacaoElegibilidade,
  StatusSolicitacaoEligibilidade,
} from '../elegibilidade/entities/solicitacao-elegibilidade.entity';
import { ProdutorFrigoficoRequest } from '../usuario/request/produtor-frigorifico-request.dto';
import { VoucherEntity } from './entities/voucher.entity';
import { Roles } from '../shared/decorators/roles.decorator';
import { RolesGuard } from '../shared/guards/roles.guard';
import { AcompanharVoucherResponse } from './response/acompanhar-voucher.response';
import { ConsultaVoucherRequest } from './request/consulta-voucher.request';
import { FrigorificoUpdateRequest } from './request/frigorifico-update-request';
import { UpdateUsuarioFrigorifico } from '../usuario/request/update-usuario-frigorifico-request';


@ApiTags('Frigorificos')
@Controller('/frigoficos')
@UseGuards(JwtAuthGuard)
export class FrigorificoController {

  constructor(private readonly service: FrigorificoService) {
  }

  @Post('/cadastrar')
  @Roles('ANALISTA')
  @UseGuards(RolesGuard)
  @ValidarUploadTermo()
  @ApiResponse({ status: 201, description: 'Cadastro de Frigorifico.', type: Frigorifico })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async cadastrar(@UploadPayload(TermoCooperacaoRequest)
                  payload: UploadPayloadType<FrigorificoRequest>) {
    return await this.service.cadastrarFrigorifico(payload);
  }

  @Put('/atualizar')
  @Roles('ANALISTA')
  @UseGuards(RolesGuard)
  @ApiResponse({ status: 201, description: 'Alterar Frigorifico.', type: Frigorifico })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async alterar(@Body() frigorificoUpdate: FrigorificoUpdateRequest) {
    return await this.service.alterarFrigorifico(frigorificoUpdate);
  }


  @Get()
  @Roles('ANALISTA')
  @UseGuards(RolesGuard)
  @ApiResponse({ status: 201, description: 'Lista os frigorificos cadastrados', type: FrigorificoResponse })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Tamanho da página' })
  @ApiQuery({
    name: 'nome',
    required: false,
    type: String,
  })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'cpfCnpj', required: false, type: String })
  async listar(
    @Request() request: any,
    @Query('nome') nome?: string,
    @Query('status') status?: StatusFrigorifico,
    @Query('cpfCnpj') cpfCnpj?: string,
    @Query('page') page = 1,
    @Query('size') size = 10,
  ) {
    const [frigorificos, total] = await this.service.listarFrigorifico(nome, cpfCnpj, status, page, size);
    const data = plainToInstance(FrigorificoResponse, frigorificos);
    return { data, total, page, size };

  }


  @Post('/usuario/:idFrigorifico')
  @Roles('ANALISTA')
  @UseGuards(RolesGuard)
  @ApiResponse({ status: 201, description: 'Cadastro de usuarios frigorificos.', type: UsuarioResponse })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async cadastrarUsuario(@Body() createUsuarioDto: UsuarioFrigoficoRequest, @Param('idFrigorifico') idFrigorifico: number) {
    return await this.service.cadastrarUsuarioFrigorico(createUsuarioDto, idFrigorifico);
  }

  @Put('/usuario/:id')
  @Roles('ANALISTA')
  @UseGuards(RolesGuard)
  @ApiResponse({ status: 201, description: 'Atualiza usuarios frigorificos.', type: Usuario })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async atualizarUsuario(
    @Param('id') id: number,
    @Body() updateUsuarioDto: UpdateUsuarioFrigorifico,
  ) {
    return this.service.alterarUsuario(id, updateUsuarioDto);
  }


  @Put('/ativar/:idFrigorifico')
  @Roles('ANALISTA')
  @UseGuards(RolesGuard)
  @ApiResponse({ status: 201, description: 'Ativa um frigorifico.', type: MensagemResponse })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async ativarFrigorifico(@Param('idFrigorifico') idFrigorifico: number) {
    return await this.service.ativararFrigorifico(idFrigorifico);
  }


  @Put('/inativar/:idFrigorifico')
  @Roles('ANALISTA')
  @UseGuards(RolesGuard)
  @ApiResponse({ status: 201, description: 'Inativa um frigorifico.', type: MensagemResponse })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async inativarFrigorifico(@Param('idFrigorifico') idFrigorifico: number) {
    return await this.service.inativarFrigorifico(idFrigorifico);
  }


  @Roles('ANALISTA', 'FRIGORIFICO')
  @Get('/elegibilidade/:numeroCar')
  @ApiResponse({
    status: 201,
    description: 'Consulta elegibilidade de uma propriedade.',
    type: SolicitacaoElegibilidade,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async consultaElegibilidade(@Param('numeroCar') numeroCar: string, @Request() request: any) {
    const user = request.user;
    return await this.service.consultaElegibilidade(numeroCar, user.email);
  }

  @Roles('ANALISTA', 'FRIGORIFICO')
  @Get('/elegibilidades')
  @ApiResponse({ status: 201, description: 'Consulta elegibilidades ', type: SolicitacaoElegibilidade })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiQuery({ name: 'nome', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'nomePropriedade', required: false, type: String })
  @ApiQuery({ name: 'cpfCnpj', required: false, type: String })
  @ApiQuery({ name: 'numeroCar', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Tamanho da página' })
  async consultaElegibilidades(
    @Request() request: any,
    @Query('nomePropriedade') nomePropriedade?: string,
    @Query('cpfCnpj') cpfCnpj?: string,
    @Query('numeroCar') numeroCar?: string,
    @Query('status') status?: StatusSolicitacaoEligibilidade,
    @Query('page') page = 1,
    @Query('size') size = 10,
  ) {
    const user = request.user;
    return await this.service.listarElegibilidade(nomePropriedade, cpfCnpj, numeroCar, status, page, size, user.email);
  }

  @Roles('ANALISTA', 'FRIGORIFICO')
  @Post('/produtor')
  @ApiResponse({ status: 201, description: 'Realiza o cadastro de um produtor ', type: VoucherEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async cadastrarProdutor(@Body() produtorRequest: ProdutorFrigoficoRequest) {
    return await this.service.cadastrarProdutor(produtorRequest);
  }


  @Get('/voucher')
  @ApiResponse({ status: 201, description: 'Consulta vouchers e propriedades ', type: [VoucherEntity] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async consultaVoucher(@Request() request: any) {
    const user = request.user;
    return await this.service.consultaVoucher(user.email);
  }


  @Post('/voucher-ativar/:codigoVoucher')
  @ApiResponse({ status: 201, description: 'Ativa  voucher ', type: [VoucherEntity] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async ativarVoucher(@Param('codigoVoucher') codigoVoucher: string) {
    return await this.service.ativarVoucher(codigoVoucher);
  }


  @Roles('ANALISTA', 'FRIGORIFICO')
  @Post('/voucher')
  @ApiResponse({
    status: 201,
    description: 'Faz o acompanhamneto dos vouchers emitidos ',
    type: [AcompanharVoucherResponse],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'size', required: false, type: Number, description: 'Tamanho da página' })
  @ApiQuery({ name: 'nomeProdutor', required: false, type: String })
  @ApiQuery({ name: 'cpfCnpj', required: false, type: String })
  @ApiQuery({ name: 'numeroCar', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'dataInicio', required: false, type: String })
  @ApiQuery({ name: 'dataFim', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async acompanharVoucher(
    @Query() consultaVoucher: ConsultaVoucherRequest,
    @Query('page') page = 1,
    @Query('size') size = 10,
    @Query('idFrigorifico') idFrigorifico: number) {
    const [vocuhers, total] = await this.service.consultarVoucherAcompanhamento(consultaVoucher, idFrigorifico, page, size);
    const data = plainToInstance(AcompanharVoucherResponse, vocuhers);
    return { data, total, page, size };
  }

  @Roles('FRIGORIFICO')
  @Get('/usuario')
  @ApiResponse({ status: 201, description: 'Consulta vouchers e propriedades ', type: [VoucherEntity] })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async consultaFrigorificoUsuarioLogado(@Request() request: any) {
    const user = request.user;
    return await this.service.consultarFrigorificoUsuarioLogado(user.email);
  }

  @Roles('FRIGORIFICO')
  @Get('/usuario/:email')
  @ApiResponse({ status: 201, description: 'Consulta usuario por email ', type: UsuarioResponse })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async consultarUsuario(@Param('email') email: string) {
    return await this.service.consultarUsuario(email);
  }

  @Roles('FRIGORIFICO')
  @Get('/associa-usuario')
  @ApiResponse({ status: 201, description: 'Consulta usuario por email ', type: VoucherEntity })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async associarUsuario(@Query('idUsuario') idUsuario: number,
                        @Query('idSolicitacao') idSolicitacao: number,
                        @Query('idFrigorifico') idFrigorifico: number) {
    return await this.service.associarUsuario(idUsuario, idSolicitacao, idFrigorifico);
  }

}
