import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database.config';

describe('getDatabaseConfig', () => {
  it('builds TypeORM configuration from ConfigService', () => {
    const values = new Map<string, unknown>([
      ['database.host', 'localhost'],
      ['database.port', 5432],
      ['database.username', 'postgres'],
      ['database.password', 'secret'],
      ['database.name', 'nest_structure'],
    ]);

    const configService = {
      get: jest.fn((key: string) => values.get(key)),
    } as unknown as ConfigService;

    const config = getDatabaseConfig(configService);

    expect(config).toMatchObject({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'secret',
      database: 'nest_structure',
      synchronize: false,
      logging: false,
    });

    expect(configService.get).toHaveBeenCalledWith('database.host');
    expect(configService.get).toHaveBeenCalledWith('database.port');
    expect(configService.get).toHaveBeenCalledWith('database.username');
    expect(configService.get).toHaveBeenCalledWith('database.password');
    expect(configService.get).toHaveBeenCalledWith('database.name');
  });

  it('builds URL-based configuration when database.url is set', () => {
    const values = new Map<string, unknown>([
      ['database.url', 'postgresql://user:pass@ep-pooler.neon.tech/taskflow'],
      ['database.ssl', true],
      ['database.sslRejectUnauthorized', false],
    ]);

    const configService = {
      get: jest.fn((key: string) => values.get(key)),
    } as unknown as ConfigService;

    const config = getDatabaseConfig(configService);

    expect(config).toMatchObject({
      type: 'postgres',
      url: 'postgresql://user:pass@ep-pooler.neon.tech/taskflow',
      ssl: { rejectUnauthorized: false },
      synchronize: false,
      logging: false,
    });
  });

  it('enables SSL with rejectUnauthorized: false when host is Neon', () => {
    const values = new Map<string, unknown>([
      [
        'database.host',
        'ep-broad-paper-azwdyr74-pooler.c-3.ap-southeast-1.aws.neon.tech',
      ],
      ['database.port', 5432],
      ['database.username', 'neondb_owner'],
      ['database.password', 'secret'],
      ['database.name', 'taskflow'],
      ['database.ssl', undefined],
    ]);

    const configService = {
      get: jest.fn((key: string) => values.get(key)),
    } as unknown as ConfigService;

    const config = getDatabaseConfig(configService);

    expect(config).toMatchObject({
      type: 'postgres',
      ssl: { rejectUnauthorized: false },
    });
  });

  it('disables SSL when database.ssl is false and host is localhost', () => {
    const values = new Map<string, unknown>([
      ['database.host', 'localhost'],
      ['database.port', 5432],
      ['database.username', 'postgres'],
      ['database.password', 'root'],
      ['database.name', 'taskflow'],
      ['database.ssl', false],
    ]);

    const configService = {
      get: jest.fn((key: string) => values.get(key)),
    } as unknown as ConfigService;

    const config = getDatabaseConfig(configService);

    expect(config).toMatchObject({
      type: 'postgres',
      ssl: false,
    });
  });
});
