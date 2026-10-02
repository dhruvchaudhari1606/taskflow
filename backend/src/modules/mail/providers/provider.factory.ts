import { Injectable, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailProvider } from './mail-provider.interface';
import { NodemailerProvider } from './nodemailer.provider';
import { SendgridProvider } from './sendgrid.provider';
import { GoogleProvider } from './google.provider';
import { MailProvider as MailProviderType } from '@common/constants/mail.constants';

@Injectable()
export class MailProviderFactory {
  constructor(
    private readonly nodemailer: NodemailerProvider,
    private readonly sendgrid: SendgridProvider,
    private readonly google: GoogleProvider,
    @Optional() private readonly configService?: ConfigService,
  ) {}

  getProvider(provider?: MailProviderType): MailProvider {
    const activeProvider =
      provider ||
      (this.configService?.get<MailProviderType>(
        'mail.provider',
      ) as MailProviderType) ||
      MailProviderType.NODEMAILER;

    switch (activeProvider) {
      case MailProviderType.SENDGRID:
        return this.sendgrid;

      case MailProviderType.GOOGLE:
      case MailProviderType.GMAIL:
        return this.google;

      case MailProviderType.NODEMAILER:
      default:
        return this.nodemailer;
    }
  }
}
