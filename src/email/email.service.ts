import { Injectable } from '@nestjs/common';
import * as process from 'process';
import { BaseTemplate } from './templates/base-template';
import { SendSmtpEmail, TransactionalEmailsApi } from '@getbrevo/brevo';

interface EnviarEmailTemplateDto<T> {
  recipients: string[];
  subject: string;
  template: BaseTemplate<T>;
}

@Injectable()
export class EmailService {
  emailFrom = '';
  emailAPI = new TransactionalEmailsApi();

  constructor() {
    this.emailFrom = process.env.SEND_SENDER as string
    (this.emailAPI as any).authentications.apiKey.apiKey = process.env.KEY_API as string;
  }

  async enviarEmailTemplate<T>({ recipients, subject, template }: EnviarEmailTemplateDto<T>): Promise<void> {
    const content = template.generate();

    let message = new SendSmtpEmail();
    message.subject = subject;
    message.htmlContent =  content ;
    message.sender = { name: "IMAC", email: this.emailFrom };
    message.to = recipients.map(email => ({ email }));


    this.emailAPI
      .sendTransacEmail(message)
      .then((res) => {
        console.log(JSON.stringify(res.body));
      })
      .catch((err) => {
        console.error("Error sending email:", err.body);
      });

  }
}
