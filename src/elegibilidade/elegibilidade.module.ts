import { forwardRef, Module } from '@nestjs/common';
import { ElegibilidadeService } from './elegibilidade.service';
import { ElegibilidadeController } from './elegibilidade.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitacaoElegibilidade } from './entities/solicitacao-elegibilidade.entity';
import { EmailService } from '../email/email.service';
import { HttpModule } from '@nestjs/axios';
import { PropriedadeConsulta } from './entities/consulta/propriedade-consulta.entity';
import { ProprietarioConsulta } from './entities/consulta/proprietario-consulta.entity';
import { PagamentoVoucher } from './entities/pagamento-voucher.entity';
import { Cidade } from './entities/cidade.entity';
import { AgrotoolsModule } from '../agrotools/agrotools.module';
import { Propriedade } from '../propriedade-prem/entities/propriedade.entity';
import { MensagemService } from '../message/mensagem.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitacaoElegibilidade, PropriedadeConsulta, ProprietarioConsulta, PagamentoVoucher, Cidade, Propriedade]),
    HttpModule,
    forwardRef(() => AgrotoolsModule)
  ],
  controllers: [ElegibilidadeController],
  providers: [ElegibilidadeService, EmailService, MensagemService],
  exports: [EmailService, ElegibilidadeService, MensagemService]
})
export class ElegibilidadeModule {
}
