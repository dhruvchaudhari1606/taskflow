import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { TemplateService } from './templates/template.service';
import { NodemailerProvider } from './providers/nodemailer.provider';
import { SendgridProvider } from './providers/sendgrid.provider';
import { GoogleProvider } from './providers/google.provider';
import { MailProviderFactory } from './providers/provider.factory';

@Module({
  providers: [
    MailService,
    TemplateService,
    NodemailerProvider,
    SendgridProvider,
    GoogleProvider,
    MailProviderFactory,
  ],
  exports: [MailService],
})
export class MailModule {}
