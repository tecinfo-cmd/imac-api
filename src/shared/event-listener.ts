import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { ArquivoEnviadoEvent } from './events/arquivo-enviado.event';
import { EmailService } from '../email/email.service';
import { NovoDocumentoEnviadoProdutorTemplate } from '../email/templates/novo-documento-produtor.template';
import { NovoDocumentoEnviadoAnalistaTemplate } from '../email/templates/novo-documento-analista.template';
import { DocumentoOrientativoEnviado } from './events/documento-orientativo-enviado.event';
import { DocumentoOrientativoAtualizado } from './events/documento-orientativo-atualizado.event';
import { Usuario } from '../usuario/entities/usuario.entity';
import { DocumentoOrientativoDisponivelTemplate } from '../email/templates/documento-orientativo-disponivel.template';

@Injectable()
export class EventListener {
  constructor(
    private readonly emailService: EmailService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>
  ){}

  @OnEvent(ArquivoEnviadoEvent.name, { async: true })
  async handleArquivoEnviadoEvent(event: ArquivoEnviadoEvent) {
    const remetenteProdutor = event.remetente === 'PRODUTOR';

    await this.emailService.enviarEmailTemplate(
      {
        recipients: [remetenteProdutor ? event.analistaEmail : event.produtorEmail],
        subject: 'Novo documento enviado',
        template: remetenteProdutor 
        ? new NovoDocumentoEnviadoAnalistaTemplate({ nomeUsuario: event.analistaNome, nomePropriedade: event.nomePropriedade!})
        : new NovoDocumentoEnviadoProdutorTemplate({ nomeUsuario: event.produtorNome })
    });
  }

  @OnEvent(DocumentoOrientativoEnviado.name, { async: true })
  async handleDocumentoOrientativoEnviadoEvent(event: DocumentoOrientativoEnviado) {
    if(event.documentoOrientativo.ativo){
      
      const emails = await this.pegarEmailsProprietarios();
      
      await this.emailService.enviarEmailTemplate({
        recipients: emails,
        subject: 'Novo documento orientativo disponível',
        template: new DocumentoOrientativoDisponivelTemplate({})
      });
    }
  }

  // Sei que o código é idêntico ao de cima, mas separei para caso futuramente o envio mude de alguma forma fique separado.
  @OnEvent(DocumentoOrientativoAtualizado.name, { async: true })
  async handleDocumentoOrientativoAtualizadoEvent(event: DocumentoOrientativoAtualizado) {
    if(event.documentoOrientativo.ativo){
      const emails = await this.pegarEmailsProprietarios();
      
      await this.emailService.enviarEmailTemplate({
        recipients: emails,
        subject: 'Novo documento orientativo disponível',
        template: new DocumentoOrientativoDisponivelTemplate({})
      });
    }
  }

  private async pegarEmailsProprietarios(): Promise<string[]>{
    const proprietarios = await this.usuarioRepository.find({
        where: {
          aceitouTermos: true,
          roles: {
            id: 3
          }
        },
        relations: ['roles']
      });
      
      return proprietarios.map(p => p.email);
  }
}