import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnaliseSocioambientalController } from './analise-socioambiental.controller';
import { AnaliseSocioambientalService } from './analise-socioambiental.service';
import { ContestacaoAutorizacaoSupressao } from './entities/contestacao-autorizacao-supressao.entity';
import { TipoAutorizacaoSupressao } from './entities/tipo-autorizacao-supressao.entity';
import { OrgaoEmissorAutorizacaoSupressao } from './entities/orgao-emissor-autorizacao-supressao.entity';
import { ContestacaoLaudo } from './entities/contestacao-laudo.entity';
import { RetornoAnaliseEntity } from '../../agrotools/entities/retorno-analise.entity';
import { DocumentoUploadService } from '../../upload/documento-upload.service';
import { Documento } from '../../shared/entity/documento.entity';
import { ResponsavelTecnico } from '../../responsavel-tecnico/entities/responsavel-tecnico.entity';
import { PlanoAdequacao } from './entities/plano-adequacao.entity';
import { EmailService } from '../../email/email.service';
import { UsuarioModule } from '../../usuario/usuario.module';
import { MulterModule } from '@nestjs/platform-express';
import { MensagemService } from '../../message/mensagem.service';
import { DeteccoesAgrotools } from '../../elegibilidade/entities/deteccoes-agrotools.entity';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fieldSize: 25 * 1024 * 1024, // Increase max field value size to 25MB (in bytes)
      },
      fileFilter: (_, file, cb) => {
        // Re-encodifica o nome do arquivo de latin1 para utf8
        file.originalname = Buffer.from(file.originalname, 'latin1').toString(
          'utf8',
        );
        cb(null, true);
      },
    }),
    TypeOrmModule.forFeature([
      ContestacaoAutorizacaoSupressao,
      TipoAutorizacaoSupressao,
      OrgaoEmissorAutorizacaoSupressao,
      ContestacaoLaudo,
      RetornoAnaliseEntity,
      Documento,
      ResponsavelTecnico,
      PlanoAdequacao,
      DeteccoesAgrotools,
    ]),
    UsuarioModule,
  ],
  controllers: [AnaliseSocioambientalController],
  providers: [
    AnaliseSocioambientalService,
    DocumentoUploadService,
    EmailService,
    MensagemService,
  ],
})
export class AnaliseSocioambientalModule {}
