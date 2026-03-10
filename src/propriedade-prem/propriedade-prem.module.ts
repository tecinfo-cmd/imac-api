import { forwardRef, Module } from '@nestjs/common';
import { PropriedadePremService } from './propriedade-prem.service';
import { PropriedadePremController } from './propriedade-prem.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Endereco } from '../endereco/entities/endereco.entity';
import { Propriedade } from './entities/propriedade.entity';
import { Proprietario } from './entities/proprietario.entity';
import { CicloProducao } from './entities/ciclo-producao.entity';
import { AtividadePrincipal } from './entities/atividade-principal.entity';
import { PessoaService } from '../shared/service/pessoa.service';
import { Pessoa } from '../shared/entity/pessoa.entity';
import { ProprietarioPremService } from './proprietario-prem.service';
import { Cidade } from '../elegibilidade/entities/cidade.entity';
import { DocumentoUploadService } from '../upload/documento-upload.service';
import { Documento } from '../shared/entity/documento.entity';
import { AnaliseSocioambientalModule } from './analise-socioambiental/analise-socioambiental.module';
import { AutoVistoriaController } from './auto-vistoria/auto-vistoria.controller';
import { AutoVistoriaService } from './auto-vistoria/auto-vistoria.service';
import { AutoVistoriaEntity } from './auto-vistoria/entities/auto-vistoria.entity';
import { AgrotoolsModule } from '../agrotools/agrotools.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { CobrancaModule } from '../cobranca/cobranca.module';
import { PdfModule } from '../pdf/pdf.module';
import { AssinaturaModule } from '../assinatura/assinatura.module';
import { PagamentoMulta } from '../cobranca/entities/pagamento-multa.entities';
import { EmailService } from '../email/email.service';
import { MensagemService } from '../message/mensagem.service';

@Module({
  imports: [TypeOrmModule.forFeature([Propriedade, Proprietario, Endereco, CicloProducao, AtividadePrincipal, Pessoa, Cidade, Documento, AutoVistoriaEntity, PagamentoMulta]),
    HttpModule, 
    AnaliseSocioambientalModule,
    PdfModule,
    AssinaturaModule,
    forwardRef(() => AgrotoolsModule),
    forwardRef(() => UsuarioModule),
    forwardRef(() => CobrancaModule)],
  controllers: [PropriedadePremController,AutoVistoriaController],
  providers: [PropriedadePremService, PessoaService, ProprietarioPremService, DocumentoUploadService,AutoVistoriaService, EmailService, MensagemService],
  exports: [PropriedadePremService]
})
export class PropriedadePremModule {}
