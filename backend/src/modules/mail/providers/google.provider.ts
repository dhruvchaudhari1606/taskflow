import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailProvider, SendMailOptions } from './mail-provider.interface';

@Injectable()
export class GoogleProvider implements MailProvider {
  private readonly logger = new Logger(GoogleProvider.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const user =
      this.configService.get<string>('google.user') ||
      this.configService.get<string>('APP_MAIL') ||
      '';
    const pass =
      this.configService.get<string>('google.pass') ||
      this.configService.get<string>('APP_PASSWORD') ||
      '';

    if (!user || !pass) {
      this.logger.warn(
        'Google Mail credentials (APP_MAIL / APP_PASSWORD) are not fully configured.',
      );
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  async send(options: SendMailOptions): Promise<void> {
    const fromAddress =
      this.configService.get<string>('google.from') ||
      this.configService.get<string>('google.user') ||
      this.configService.get<string>('APP_MAIL');

    const formattedFrom = fromAddress
      ? fromAddress.includes('<')
        ? fromAddress
        : `TaskFlow <${fromAddress}>`
      : undefined;

    await this.transporter.sendMail({
      from: formattedFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      attachments: options.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        path: attachment.path,
        contentType: attachment.contentType,
      })),
    });
  }
}
