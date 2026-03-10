import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentoOrientativo } from './entity/documento-orientativo.entity';
import { CreateDocumentoOrientativoDto } from './dto/create-documento-orientativo.dto';
import { UpdateDocumentoOrientativoStatusDto } from './dto/update-documento-orientativo-status.dto';
import { FilterDocumentoOrientativoDto } from './dto/filter-documento-orientativo.dto';
import { DocumentoUploadService } from '../upload/documento-upload.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DocumentoOrientativoEnviado } from '../shared/events/documento-orientativo-enviado.event';
import { DocumentoOrientativoAtualizado } from '../shared/events/documento-orientativo-atualizado.event';

@Injectable()
export class DocumentosOrientativosService {
  constructor(
    @InjectRepository(DocumentoOrientativo)
    private readonly documentoOrientativoRepository: Repository<DocumentoOrientativo>,
    private readonly documentoUploadService: DocumentoUploadService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    createDocumentoOrientativoDto: CreateDocumentoOrientativoDto,
    files: { capaArquivo?: Express.Multer.File[]; arquivo?: Express.Multer.File[] },
    userEmail: string,
  ): Promise<DocumentoOrientativo> {
    if (!files.capaArquivo || files.capaArquivo.length === 0) {
      throw new BadRequestException('O campo capaArquivo é obrigatório.');
    }

    try {
      const capaArquivo = files.capaArquivo[0];
      const { tipo, urlVideo } = createDocumentoOrientativoDto;

      let urlArquivoFinal: string | undefined;
      let nomeArquivoFinal: string | undefined;
      let nomeOriginalArquivoFinal: string | undefined;

      if (tipo === 'pdf') {
        const arquivo = files.arquivo ? files.arquivo[0] : null;
        if (!arquivo) {
          throw new BadRequestException('Para o tipo "pdf", o campo "arquivo" é obrigatório.');
        }
        if (arquivo.mimetype !== 'application/pdf') {
          throw new BadRequestException('O arquivo enviado não é um PDF.');
        }
        if (urlVideo) {
          throw new BadRequestException('Para o tipo "pdf", o campo "urlVideo" não é permitido.');
        }
        

        const [uploadedArquivo] = await this.documentoUploadService.uploadFiles([arquivo]);
        urlArquivoFinal = uploadedArquivo.url;
        nomeArquivoFinal = uploadedArquivo.filename;
        nomeOriginalArquivoFinal = uploadedArquivo.originalName;

      } else if (tipo === 'video') {
        if (!urlVideo) {
          throw new BadRequestException('Para o tipo "video", o campo "urlVideo" é obrigatório.');
        }
        if (files.arquivo && files.arquivo.length > 0) {
          throw new BadRequestException('Para o tipo "video", não é permitido enviar um arquivo.');
        }
        urlArquivoFinal = urlVideo;
      }

      const [uploadedCapa] = await this.documentoUploadService.uploadFiles([capaArquivo]);

      const newDocumento = this.documentoOrientativoRepository.create({
        ...createDocumentoOrientativoDto,
        urlCapaArquivo: uploadedCapa.url,
        nomeCapaArquivo: uploadedCapa.filename,
        nomeOriginalCapaArquivo: uploadedCapa.originalName,
        urlArquivo: urlArquivoFinal,
        nomeArquivo: nomeArquivoFinal,
        nomeArquivoOriginal: nomeOriginalArquivoFinal,
        criadoPor: userEmail,
      });

      const documentoOrientativo = await this.documentoOrientativoRepository.save(newDocumento);
      
      await this.eventEmitter.emitAsync(DocumentoOrientativoEnviado.name, new DocumentoOrientativoEnviado(documentoOrientativo));

      return documentoOrientativo;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao criar documento orientativo.', error.stack);
    }
  }

  async findAll(
    filterDto: FilterDocumentoOrientativoDto,
    page: number,
    limit: number,
  ): Promise<[DocumentoOrientativo[], number]> {
    const {
      titulo,
      descricao,
      tipo,
      ativo,
      dataCriacaoInicio,
      dataCriacaoFim,
      dataAtualizacaoInicio,
      dataAtualizacaoFim,
    } = filterDto;

    const queryBuilder = this.documentoOrientativoRepository.createQueryBuilder('documento');

    if (titulo) {
      queryBuilder.andWhere('LOWER(documento.titulo) LIKE LOWER(:titulo)', { titulo: `%${titulo}%` });
    }
    if (descricao) {
      queryBuilder.andWhere('LOWER(documento.descricao) LIKE LOWER(:descricao)', { descricao: `%${descricao}%` });
    }
    if (tipo) {
      queryBuilder.andWhere('documento.tipo = :tipo', { tipo });
    }
    if (ativo !== undefined) {
      queryBuilder.andWhere('documento.ativo = :ativo', { ativo });
    }
    if (dataCriacaoInicio) {
      queryBuilder.andWhere('documento.dataCriacao >= :dataCriacaoInicio', { dataCriacaoInicio: new Date(dataCriacaoInicio) });
    }
    if (dataCriacaoFim) {
      queryBuilder.andWhere('documento.dataCriacao <= :dataCriacaoFim', { dataCriacaoFim: new Date(dataCriacaoFim) });
    }
    if (dataAtualizacaoInicio) {
      queryBuilder.andWhere('documento.dataAtualizacao >= :dataAtualizacaoInicio', { dataAtualizacaoInicio: new Date(dataAtualizacaoInicio) });
    }
    if (dataAtualizacaoFim) {
      queryBuilder.andWhere('documento.dataAtualizacao <= :dataAtualizacaoFim', { dataAtualizacaoFim: new Date(dataAtualizacaoFim) });
    }

    return queryBuilder.skip((page - 1) * limit).take(limit).getManyAndCount();
  }

  async findOne(id: number): Promise<DocumentoOrientativo> {
    const documento = await this.documentoOrientativoRepository.findOne({ where: { id } });
    if (!documento) {
      throw new NotFoundException(`Documento orientativo com ID ${id} não encontrado.`);
    }
    return documento;
  }

  async updateStatus(
    id: number,
    updateDocumentoOrientativoStatusDto: UpdateDocumentoOrientativoStatusDto,
  ): Promise<DocumentoOrientativo> {
    const documento = await this.findOne(id);

    if(documento.ativo === updateDocumentoOrientativoStatusDto.ativo){
      throw new BadRequestException(`O status do documento já é ${documento.ativo ? 'ativo' : 'inativo'}.`);
    }

    documento.ativo = updateDocumentoOrientativoStatusDto.ativo;

    await this.eventEmitter.emitAsync(DocumentoOrientativoAtualizado.name, new DocumentoOrientativoAtualizado(documento));
    return this.documentoOrientativoRepository.save(documento);
  }

  async remove(id: number): Promise<void> {
    const documento = await this.findOne(id);

    const filesToDelete: string[] = [];
    if (documento.nomeCapaArquivo) {
      filesToDelete.push(`documents/${documento.nomeCapaArquivo}`);
    }
    if (documento.nomeArquivo && documento.tipo === 'pdf') {
      filesToDelete.push(`documents/${documento.nomeArquivo}`);
    }

    if (filesToDelete.length > 0) {
      await this.documentoUploadService.deleteFiles(filesToDelete);
    }
    
    await this.documentoOrientativoRepository.remove(documento);
  }
}