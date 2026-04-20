import { Test, TestingModule } from '@nestjs/testing';
import { EventListener } from './event-listener';
import { EmailService } from '../email/email.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Repository } from 'typeorm';
import { ArquivoEnviadoEvent } from './events/arquivo-enviado.event';
import { NovoDocumentoEnviadoAnalistaTemplate } from '../email/templates/novo-documento-analista.template';
import { NovoDocumentoEnviadoProdutorTemplate } from '../email/templates/novo-documento-produtor.template';
import { DocumentoOrientativoEnviado } from './events/documento-orientativo-enviado.event';
import { DocumentoOrientativo } from '../documento-orientativo/entity/documento-orientativo.entity';
import { DocumentoOrientativoDisponivelTemplate } from '../email/templates/documento-orientativo-disponivel.template';
import { DocumentoOrientativoAtualizado } from './events/documento-orientativo-atualizado.event';

const mockEmailService = {
  enviarEmailTemplate: jest.fn(),
};

const mockUsuarioRepository = {
  find: jest.fn(),
};

describe('EventListener', () => {
  let listener: EventListener;
  let emailService: EmailService;
  let usuarioRepository: Repository<Usuario>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventListener,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
      ],
    }).compile();

    listener = module.get<EventListener>(EventListener);
    emailService = module.get<EmailService>(EmailService);
    usuarioRepository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  describe('handleArquivoEnviadoEvent', () => {
    it('should send an email to the analyst when the sender is a producer', async () => {
      const event = new ArquivoEnviadoEvent(
        'produtor@test.com',
        'Produtor Teste',
        'analista@test.com',
        'Analista Teste',
        'doc.pdf',
        'TIPO_TESTE',
        'PRODUTOR',
        'Fazenda Teste',
      );

      await listener.handleArquivoEnviadoEvent(event);

      expect(emailService.enviarEmailTemplate).toHaveBeenCalledWith({
        recipients: [event.analistaEmail],
        subject: 'Novo documento enviado',
        template: new NovoDocumentoEnviadoAnalistaTemplate({ nomeUsuario: event.analistaNome, nomePropriedade: event.nomePropriedade! }),
      });
    });

    it('should send an email to the producer when the sender is an analyst', async () => {
      const event = new ArquivoEnviadoEvent('produtor@test.com', 'Produtor Teste', 'analista@test.com', 'Analista Teste', 'doc.pdf', 'TIPO_TESTE', 'ANALISTA', 'Fazenda Teste');

      await listener.handleArquivoEnviadoEvent(event);

      expect(emailService.enviarEmailTemplate).toHaveBeenCalledWith({
        recipients: [event.produtorEmail],
        subject: 'Novo documento enviado',
        template: new NovoDocumentoEnviadoProdutorTemplate({ nomeUsuario: event.produtorNome }),
      });
    });
  });

  describe('handleDocumentoOrientativoEnviadoEvent', () => {
    it('should send email to all proprietors if the document is active', async () => {
      const mockDocumento = { ativo: true } as DocumentoOrientativo;
      const event = new DocumentoOrientativoEnviado(mockDocumento);
      const mockProprietarios = [
        { email: 'prop1@test.com' },
        { email: 'prop2@test.com' },
      ];
      mockUsuarioRepository.find.mockResolvedValue(mockProprietarios);

      await listener.handleDocumentoOrientativoEnviadoEvent(event);

      expect(usuarioRepository.find).toHaveBeenCalled();
      expect(emailService.enviarEmailTemplate).toHaveBeenCalledWith({
        recipients: ['prop1@test.com', 'prop2@test.com'],
        subject: 'Novo documento orientativo disponível',
        template: expect.any(DocumentoOrientativoDisponivelTemplate),
      });
    });

    it('should not send email if the document is inactive', async () => {
      const mockDocumento = { ativo: false } as DocumentoOrientativo;
      const event = new DocumentoOrientativoEnviado(mockDocumento);

      await listener.handleDocumentoOrientativoEnviadoEvent(event);

      expect(usuarioRepository.find).not.toHaveBeenCalled();
      expect(emailService.enviarEmailTemplate).not.toHaveBeenCalled();
    });
  });

  describe('handleDocumentoOrientativoAtualizadoEvent', () => {
    it('should send email to all proprietors if the document is active', async () => {
      const mockDocumento = { ativo: true } as DocumentoOrientativo;
      const event = new DocumentoOrientativoAtualizado(mockDocumento);
      const mockProprietarios = [{ email: 'prop1@test.com' }];
      mockUsuarioRepository.find.mockResolvedValue(mockProprietarios);

      await listener.handleDocumentoOrientativoAtualizadoEvent(event);

      expect(usuarioRepository.find).toHaveBeenCalled();
      expect(emailService.enviarEmailTemplate).toHaveBeenCalledWith({
        recipients: ['prop1@test.com'],
        subject: 'Novo documento orientativo disponível',
        template: expect.any(DocumentoOrientativoDisponivelTemplate),
      });
    });

    it('should not send email if the document is inactive', async () => {
      const mockDocumento = { ativo: false } as DocumentoOrientativo;
      const event = new DocumentoOrientativoAtualizado(mockDocumento);

      await listener.handleDocumentoOrientativoAtualizadoEvent(event);

      expect(usuarioRepository.find).not.toHaveBeenCalled();
      expect(emailService.enviarEmailTemplate).not.toHaveBeenCalled();
    });
  });
});