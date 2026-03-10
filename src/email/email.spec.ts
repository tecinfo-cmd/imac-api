import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { BaseTemplate } from './templates/base-template';
import { SendSmtpEmail } from '@getbrevo/brevo';

const mockSendTransacEmail = jest.fn();

jest.mock('@getbrevo/brevo', () => ({
  TransactionalEmailsApi: jest.fn().mockImplementation(() => ({
    sendTransacEmail: mockSendTransacEmail,
    authentications: {
      apiKey: {},
    },
  })),
  SendSmtpEmail: jest.fn(),
}));

describe('EmailService', () => {
  let emailService: EmailService;
  const originalEnv = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      KEY_API: 'mock-api-key',
      SEND_SENDER: 'mock-sender@imac.com',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(emailService).toBeDefined();
  });

  describe('enviarEmailTemplate', () => {
    it('should call Brevo API with correct parameters', async () => {
      class MockTemplate extends BaseTemplate<any> {
        generate(): string {
          return '<p>Mock email content</p>';
        }
      }

      const mockRecipients = ['test@example.com'];
      const mockSubject = 'Test Subject';
      const mockTemplate = new MockTemplate({
        link: 'http://mock.link',
      });

      mockSendTransacEmail.mockResolvedValue({ response: { statusCode: 201 }, body: { messageId: 'some-id' } });

      await emailService.enviarEmailTemplate({
        recipients: mockRecipients,
        subject: mockSubject,
        template: mockTemplate,
      });

      expect(mockSendTransacEmail).toHaveBeenCalled();
      const sentMessage: SendSmtpEmail = (mockSendTransacEmail.mock.calls[0][0]);
      expect(sentMessage.subject).toBe(mockSubject);
      expect(sentMessage.htmlContent).toBe('<p>Mock email content</p>');
      expect(sentMessage.sender).toEqual({ name: "IMAC", email: 'mock-sender@imac.com' });
      expect(sentMessage.to).toEqual(mockRecipients.map(email => ({ email })));
    });

    it('should log an error if Brevo API fails', async () => {
      const error = { body: 'Brevo API Error' };
      mockSendTransacEmail.mockRejectedValue(error);
      console.error = jest.fn(); // Mock console.error to check if it's called

      class MockTemplate extends BaseTemplate<any> {
        generate(): string {
          return '<p>Mock email content</p>';
        }
      }

      const mockRecipients = ['test@example.com'];
      const mockSubject = 'Test Subject';
      const mockTemplate = new MockTemplate({
        link: 'http://mock.link',
      });

      await emailService.enviarEmailTemplate({
        recipients: mockRecipients,
        subject: mockSubject,
        template: mockTemplate,
      });

      // Aguarda a próxima "rodada" do event loop para permitir que a promise rejeitada seja processada
      await new Promise(process.nextTick);

      expect(console.error).toHaveBeenCalledWith("Error sending email:", error.body);
    });
  });
});
