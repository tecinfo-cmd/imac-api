import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from '../email/email.service';
import { PagamentoVoucher } from '../elegibilidade/entities/pagamento-voucher.entity';
import { PessoaService } from '../shared/service/pessoa.service';
import { Pessoa } from '../shared/entity/pessoa.entity';
import { ElegibilidadeModule } from '../elegibilidade/elegibilidade.module';
import { CobrancasService } from './cobranca.service';
import { CobrancaController } from './cobranca.controller';
import { PropriedadePremModule } from '../propriedade-prem/propriedade-prem.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { AgrotoolsModule } from '../agrotools/agrotools.module';
import { PagamentoMulta } from './entities/pagamento-multa.entities';
import { TerritorioEntity } from '../agrotools/entities/territorio.entity';
import { ErroFuncionalidade } from '../exception/erro-funcionalidade';

@Module({
  imports:[
    TypeOrmModule.forFeature([PagamentoVoucher, Pessoa, PagamentoMulta, TerritorioEntity,ErroFuncionalidade ]),
    HttpModule,
    forwardRef(() => PropriedadePremModule),
    forwardRef(() => ElegibilidadeModule),
    forwardRef(() => AgrotoolsModule),
    forwardRef(() => UsuarioModule),
  ],
  providers: [EmailService,CobrancasService , PessoaService],
  controllers: [CobrancaController],
  exports: [EmailService, CobrancasService]
})
export class CobrancaModule {}
