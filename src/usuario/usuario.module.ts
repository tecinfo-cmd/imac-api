import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Usuario } from './entities/usuario.entity';
import { UsuarioController } from './usuario.controller';
import { SolicitacaoElegibilidade } from '../elegibilidade/entities/solicitacao-elegibilidade.entity';
import { EmailService } from '../email/email.service';
import { UsuarioService } from './usuario.service';
import { Propriedade } from '../propriedade-prem/entities/propriedade.entity';
import { PropriedadeConsulta } from '../elegibilidade/entities/consulta/propriedade-consulta.entity';
import { ElegibilidadeModule } from '../elegibilidade/elegibilidade.module';
import { PessoaService } from '../shared/service/pessoa.service';
import { Pessoa } from '../shared/entity/pessoa.entity';
import { TokenPrimeiroAcesso } from '../auth/entities/token-primeiro-acesso.entity';
import { AgrotoolsService } from '../agrotools/agrotools.service';
import { AgrotoolsModule } from '../agrotools/agrotools.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, SolicitacaoElegibilidade, Propriedade, PropriedadeConsulta, Pessoa, TokenPrimeiroAcesso, Propriedade]),
    HttpModule,
    forwardRef(() => ElegibilidadeModule),
    forwardRef(() => AgrotoolsModule)
  ],
  providers: [UsuarioService, EmailService, PessoaService],
  controllers: [UsuarioController],
  exports: [UsuarioService],
})
export class UsuarioModule {}
