import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from '../email/email.service';
import { PessoaService } from '../shared/service/pessoa.service';
import { Pessoa } from '../shared/entity/pessoa.entity';
import { FrigorificoService } from './frigorifico.service';
import { FrigorificoController } from './frigorifico.controller';
import { UsuarioModule } from '../usuario/usuario.module';
import { Frigorifico } from './entities/frigorifico.entity';
import { DocumentoUploadService } from '../upload/documento-upload.service';
import { UsuarioService } from '../usuario/usuario.service';
import { Usuario } from '../usuario/entities/usuario.entity';
import { AgrotoolsService } from '../agrotools/agrotools.service';
import { Propriedade } from '../propriedade-prem/entities/propriedade.entity';
import { PropriedadeModule } from '../upload/propriedade.module';
import { ElegibilidadeModule } from '../elegibilidade/elegibilidade.module';
import { PropriedadeConsulta } from '../elegibilidade/entities/consulta/propriedade-consulta.entity';
import { ProprietarioConsulta } from '../elegibilidade/entities/consulta/proprietario-consulta.entity';
import { SolicitacaoElegibilidade } from '../elegibilidade/entities/solicitacao-elegibilidade.entity';
import { AgrotoolsModule } from '../agrotools/agrotools.module';
import { VoucherEntity } from './entities/voucher.entity';
import { TerritorioEntity } from '../agrotools/entities/territorio.entity';
import { Proprietario } from '../propriedade-prem/entities/proprietario.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Pessoa, Frigorifico, PropriedadeConsulta, ProprietarioConsulta, SolicitacaoElegibilidade,VoucherEntity, Propriedade,TerritorioEntity,Proprietario ]),
    HttpModule,
    forwardRef(() => UsuarioModule),
    forwardRef(() => PropriedadeModule),
    forwardRef(() => ElegibilidadeModule),
    forwardRef(() => AgrotoolsModule),
  ],
  providers: [FrigorificoService,EmailService,PessoaService, DocumentoUploadService],
  controllers: [FrigorificoController],
  exports: [EmailService, FrigorificoService]
})
export class FrigorificoModule {}
