import { ConfigService } from '@nestjs/config';
import { Redis, RedisOptions } from 'ioredis';

type RedisConfig = {
  enabled: boolean;
  tls: boolean;
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
};

export const isRedisEnabled = (configService: ConfigService): boolean =>
  configService.get<boolean>('redis.enabled') !== false;

export const getRedisOptions = (configService: ConfigService): RedisOptions => {
  const { tls, host, port, password, db, keyPrefix } =
    configService.get<RedisConfig>('redis')!;

  return {
    host,
    port,
    password,
    db,
    keyPrefix,
    // Managed providers (Upstash, Redis Cloud, …) require TLS
    ...(tls ? { tls: {} } : {}),
  };
};

export const createRedisConnection = (configService: ConfigService): Redis => {
  return new Redis(getRedisOptions(configService));
};
