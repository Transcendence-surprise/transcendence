import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import mailConfig from '../config/mail.config';
import { SendMailDto } from './dto/send-mail.dto';
import { SendMailResDto } from './dto/send-mail-res.dto';

interface MailResponse {
  messageId: string;
  accepted?: string[];
  rejected?: string[];
  response?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(
    @Inject(mailConfig.KEY)
    private config: ConfigType<typeof mailConfig>,
  ) {
    this.transporter = createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.auth.user,
        pass: this.config.auth.pass,
      },
    });
  }

  async sendMail(sendMailDto: SendMailDto): Promise<SendMailResDto> {
    try {
      const info : MailResponse = await this.transporter.sendMail({
        from: `${this.config.from.name} <${this.config.from.address}>`,
        to: sendMailDto.to,
        subject: sendMailDto.subject,
        text: sendMailDto.text,
        html: sendMailDto.html,
      }) as MailResponse;

      this.logger.log(`Email sent to ${sendMailDto.to}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${sendMailDto.to}`, error);
      throw error;
    }
  }
}
