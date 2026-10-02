import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { GoogleProvider } from './google.provider';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('GoogleProvider', () => {
  const sendMailMock = jest.fn();

  const makeConfigService = (map: Record<string, unknown> = {}) =>
    ({
      get: jest.fn((key: string, defaultValue?: unknown) => {
        return key in map ? map[key] : defaultValue;
      }),
    }) as unknown as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  it('creates a transporter with service: gmail and auth credentials', () => {
    const configService = makeConfigService({
      'google.user': 'user@gmail.com',
      'google.pass': 'app-password-1234',
    });

    new GoogleProvider(configService);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'user@gmail.com',
        pass: 'app-password-1234',
      },
    });
  });

  it('falls back to APP_MAIL and APP_PASSWORD if google.* not in config', () => {
    const configService = makeConfigService({
      APP_MAIL: 'app@gmail.com',
      APP_PASSWORD: 'app-password-5678',
    });

    new GoogleProvider(configService);

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'app@gmail.com',
        pass: 'app-password-5678',
      },
    });
  });

  it('sends mail with formatted TaskFlow sender address', async () => {
    const configService = makeConfigService({
      'google.user': 'user@gmail.com',
      'google.pass': 'secret',
    });

    const provider = new GoogleProvider(configService);
    sendMailMock.mockResolvedValue(undefined);

    await provider.send({
      to: 'recipient@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'TaskFlow <user@gmail.com>',
      to: 'recipient@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      cc: undefined,
      bcc: undefined,
      replyTo: undefined,
      attachments: undefined,
    });
  });

  it('preserves existing formatted from address if already contains angles', async () => {
    const configService = makeConfigService({
      'google.user': 'user@gmail.com',
      'google.pass': 'secret',
      'google.from': 'Custom App <custom@gmail.com>',
    });

    const provider = new GoogleProvider(configService);
    sendMailMock.mockResolvedValue(undefined);

    await provider.send({
      to: 'recipient@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
    });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Custom App <custom@gmail.com>',
      }),
    );
  });

  it('passes optional cc, bcc, replyTo and attachments through', async () => {
    const configService = makeConfigService({
      'google.user': 'user@gmail.com',
      'google.pass': 'secret',
    });

    const provider = new GoogleProvider(configService);
    sendMailMock.mockResolvedValue(undefined);

    await provider.send({
      to: 'a@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
      cc: ['cc@example.com'],
      bcc: ['bcc@example.com'],
      replyTo: 'reply@example.com',
      attachments: [
        { filename: 'file.txt', content: 'data', contentType: 'text/plain' },
      ],
    });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        cc: ['cc@example.com'],
        bcc: ['bcc@example.com'],
        replyTo: 'reply@example.com',
        attachments: [
          { filename: 'file.txt', content: 'data', contentType: 'text/plain' },
        ],
      }),
    );
  });
});
