import { forwardRef, Module } from '@nestjs/common';
import { AgrotoolsService } from './agrotools.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProprietarioConsulta } from '../elegibilidade/entities/consulta/proprietario-consulta.entity';
import { EmailService } from '../email/email.service';
import { JobElegibilidadeService } from './jobs/job-elegibilidade-service';
import { PagamentoVoucher } from '../elegibilidade/entities/pagamento-voucher.entity';
import { RetornoAgrotools } from '../elegibilidade/entities/retorno-agrotools.entity';
import { PessoaService } from '../shared/service/pessoa.service';
import { ProprietarioPremService } from '../propriedade-prem/proprietario-prem.service';
import { PropriedadePremService } from '../propriedade-prem/propriedade-prem.service';
import { Pessoa } from '../shared/entity/pessoa.entity';
import { Proprietario } from '../propriedade-prem/entities/proprietario.entity';
import { Propriedade } from '../propriedade-prem/entities/propriedade.entity';
import { Endereco } from '../endereco/entities/endereco.entity';
import { CicloProducao } from '../propriedade-prem/entities/ciclo-producao.entity';
import { AtividadePrincipal } from '../propriedade-prem/entities/atividade-principal.entity';
import { AgrotoolsController } from './agrotools.controller';
import { ElegibilidadeModule } from '../elegibilidade/elegibilidade.module';
import { Cidade } from '../elegibilidade/entities/cidade.entity';
import { DocumentoUploadService } from '../upload/documento-upload.service';
import { Documento } from '../shared/entity/documento.entity';
import { AuthModule } from '../auth/auth.module';
import { TerritorioEntity } from './entities/territorio.entity';
import { RetornoAnaliseEntity } from './entities/retorno-analise.entity';
import { DeteccoesAnaliseEntity } from './entities/deteccoes-analise.entity';
import { AutoVistoriaService } from '../propriedade-prem/auto-vistoria/auto-vistoria.service';
import { AutoVistoriaEntity } from '../propriedade-prem/auto-vistoria/entities/auto-vistoria.entity';
import { UsuarioModule } from '../usuario/usuario.module';
import { PlanoAdequacao } from '../propriedade-prem/analise-socioambiental/entities/plano-adequacao.entity';
import { CobrancaModule } from '../cobranca/cobranca.module';
import { PdfModule } from '../pdf/pdf.module';
import { AssinaturaModule } from '../assinatura/assinatura.module';
import { PagamentoMulta } from '../cobranca/entities/pagamento-multa.entities';
import { ErroFuncionalidade } from '../exception/erro-funcionalidade';

@Module({
  imports:[
    TypeOrmModule.forFeature([ Endereco,CicloProducao,AtividadePrincipal,
      ProprietarioConsulta,RetornoAgrotools, PagamentoVoucher, Pessoa, Propriedade, Proprietario, Cidade, Documento, TerritorioEntity,PlanoAdequacao,
      RetornoAnaliseEntity, DeteccoesAnaliseEntity, AutoVistoriaEntity, PagamentoMulta, ErroFuncionalidade]),
    HttpModule,
    forwardRef(() => ElegibilidadeModule),
    forwardRef(() => AuthModule),
    forwardRef(() => UsuarioModule),
    forwardRef(() => CobrancaModule),
    forwardRef(() => AgrotoolsModule),
    PdfModule,
    AssinaturaModule
  ],
  providers: [AgrotoolsService,EmailService, JobElegibilidadeService, PessoaService,ProprietarioPremService,
    PropriedadePremService, DocumentoUploadService, AutoVistoriaService],
  controllers: [AgrotoolsController],
  exports: [EmailService, AgrotoolsService]
})
export class AgrotoolsModule {}
