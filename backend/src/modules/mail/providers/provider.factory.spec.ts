import { MailProvider as MailProviderType } from '@common/constants/mail.constants';
import { NodemailerProvider } from './nodemailer.provider';
import { SendgridProvider } from './sendgrid.provider';
import { GoogleProvider } from './google.provider';
import { MailProviderFactory } from './provider.factory';
import { ConfigService } from '@nestjs/config';

describe('MailProviderFactory', () => {
  const nodemailer = {} as NodemailerProvider;
  const sendgrid = {} as SendgridProvider;
  const google = {} as GoogleProvider;

  let factory: MailProviderFactory;

  beforeEach(() => {
    factory = new MailProviderFactory(nodemailer, sendgrid, google);
  });

  it('returns the nodemailer provider for NODEMAILER type', () => {
    expect(factory.getProvider(MailProviderType.NODEMAILER)).toBe(nodemailer);
  });

  it('returns the sendgrid provider for SENDGRID type', () => {
    expect(factory.getProvider(MailProviderType.SENDGRID)).toBe(sendgrid);
  });

  it('returns the google provider for GOOGLE type', () => {
    expect(factory.getProvider(MailProviderType.GOOGLE)).toBe(google);
  });

  it('returns the google provider for GMAIL type', () => {
    expect(factory.getProvider(MailProviderType.GMAIL)).toBe(google);
  });

  it('falls back to nodemailer when provider is undefined and no config', () => {
    expect(factory.getProvider(undefined)).toBe(nodemailer);
  });

  it('uses default provider from configService when provider is undefined', () => {
    const configService = {
      get: jest.fn().mockReturnValue(MailProviderType.GOOGLE),
    } as unknown as ConfigService;

    const factoryWithConfig = new MailProviderFactory(
      nodemailer,
      sendgrid,
      google,
      configService,
    );

    expect(factoryWithConfig.getProvider(undefined)).toBe(google);
    expect(configService.get).toHaveBeenCalledWith('mail.provider');
  });
});
