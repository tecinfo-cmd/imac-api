import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentoOrientativo } from './entity/documento-orientativo.entity';
import { DocumentosOrientativosService } from './documentos-orientativos.service';
import { DocumentosOrientativosController } from './documentos-orientativos.controller';
import { DocumentoUploadService } from '../upload/documento-upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentoOrientativo])],
  controllers: [DocumentosOrientativosController],
  providers: [DocumentosOrientativosService, DocumentoUploadService],
})
export class DocumentosOrientativosModule {}