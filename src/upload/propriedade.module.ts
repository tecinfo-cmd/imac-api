import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropriedadeController } from './propriedade.controller';
import { PropriedadeService } from './propriedade.service';
import { FileUploadService } from './file-upload.service';
import { CsvParserService } from './csv-parser.service';
import { PropriedadeConsulta } from '../elegibilidade/entities/consulta/propriedade-consulta.entity';
import { ProprietarioConsulta } from '../elegibilidade/entities/consulta/proprietario-consulta.entity';
import { DocumentoUploadService } from './documento-upload.service';


@Module({
  imports: [TypeOrmModule.forFeature([PropriedadeConsulta, ProprietarioConsulta])],
  controllers: [PropriedadeController],
  providers: [PropriedadeService, FileUploadService, CsvParserService, DocumentoUploadService],
})
export class PropriedadeModule {
}
