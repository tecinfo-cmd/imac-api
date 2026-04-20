import { Controller, Post, Body } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { AuthDto } from './dto/auth.dto';
import { SolicitacaoRedefinicaoSenhaDto } from './dto/solicitacao-redefinicao-senha.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';
import { SigninUsuarioDto } from '../usuario/dto/signin-usuario.dto';
import { PrimeiroAcessoDto } from './dto/primeiro-acesso.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() data: AuthDto) {
    return this.authService.login(data);
  }

  @Post('signup')
  signup(@Body() createUsuarioDto: SigninUsuarioDto) {
    return this.authService.signUp(createUsuarioDto);
  }

  @Post('solicitar-redefinicao-senha')
  @ApiResponse({ status: 201, description: 'Solicitação de recuperação de senha enviada com sucesso' })
  async forgotPassword(@Body() data: SolicitacaoRedefinicaoSenhaDto) {
    await this.authService.solicitarRecuperacaoSenha(data.email);

    return { message: 'Solicitação de redefinição de senha enviada com sucesso' };
  }

  @Post('redefinir-senha')
  @ApiResponse({ status: 201, description: 'Senha alterada com sucesso' })
  async resetPassword(@Body() data: RedefinirSenhaDto) {
    await this.authService.redefinirSenha(data.token, data.senha, data.confirmacaoSenha);

    return { message: 'Senha redefinida com sucesso' };
  }

  @Post('primeiro-acesso')
  @ApiResponse({ status: 201, description: 'Senha definida com sucesso' })
  async firstAccess(@Body() data: PrimeiroAcessoDto) {
    await this.authService.primeiroAcesso(data.token, data.senha, data.confirmacaoSenha);

    return { message: 'Senha definida com sucesso' };
  }
  
}
