import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const url = configService.get<string>('database.url');
  const host = configService.get<string>('database.host');
  const ssl = configService.get<boolean>('database.ssl');
  const rejectUnauthorized =
    configService.get<boolean>('database.sslRejectUnauthorized') ?? false;

  const isNeon =
    Boolean(host?.includes('neon.tech')) ||
    Boolean(url?.includes('neon.tech')) ||
    Boolean(url?.includes('sslmode=require'));

  const sslEnabled = isNeon || ssl === true;
  const sslOption = sslEnabled ? { rejectUnauthorized } : false;

  const baseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    ssl: sslOption,
    entities: [__dirname + '/../database/entities/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: false,
  };

  if (url) {
    return {
      ...baseConfig,
      url,
    };
  }

  return {
    ...baseConfig,
    host: configService.get<string>('database.host'),
    port: configService.get<number>('database.port'),
    username: configService.get<string>('database.username'),
    password: configService.get<string>('database.password'),
    database: configService.get<string>('database.name'),
  };
};
