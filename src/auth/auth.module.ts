import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../shared/strategies/jwt.strategy';
import { config } from 'dotenv';
import { Propriedade } from '../propriedade-prem/entities/propriedade.entity';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from '../email/email.service';
import { AuthService } from './services/auth.service';
import { UsuarioService } from '../usuario/usuario.service';
import * as process from 'process';
import { PropriedadeConsulta } from '../elegibilidade/entities/consulta/propriedade-consulta.entity';
import { Pessoa } from '../shared/entity/pessoa.entity';
import { ElegibilidadeModule } from '../elegibilidade/elegibilidade.module';
import { PessoaService } from '../shared/service/pessoa.service';
import { RetornoAgrotools } from '../elegibilidade/entities/retorno-agrotools.entity';
import { PagamentoVoucher } from '../elegibilidade/entities/pagamento-voucher.entity';
import { AgrotoolsModule } from '../agrotools/agrotools.module';
import { TokenRedefinicaoSenha } from './entities/token-redefinicao-senha.entity';
import { TokenPrimeiroAcesso } from './entities/token-primeiro-acesso.entity';
import { ApiKeyGuard } from './api-key/api-key-guard';

config();

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Propriedade,
      PropriedadeConsulta,
      Pessoa,
      RetornoAgrotools,
      PagamentoVoucher,
      TokenRedefinicaoSenha,
      TokenPrimeiroAcesso
    ]),
    HttpModule,
    forwardRef(() => ElegibilidadeModule),
    forwardRef(() => AgrotoolsModule),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    EmailService,
    UsuarioService,
    PessoaService
  ],
  exports: [AuthService],
})
export class AuthModule {}
