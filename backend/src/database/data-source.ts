// This file is used by TypeORM CLI.
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import * as path from 'path';

// Load environment-specific .env file based on NODE_ENV
const envFile = process.env.NODE_ENV
  ? `.env.${process.env.NODE_ENV}`
  : '.env.development';

config({ path: path.join(process.cwd(), envFile) });

// Resolve paths relative to this file so the same config works from
// src/ (ts-node, local dev) and dist/src/ (compiled JS, Docker image).
// Only files matching the current runtime's extension are loaded.
const ext = path.extname(__filename) === '.ts' ? 'ts' : 'js';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',

  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,

  synchronize: false,
  logging: false,

  entities: [path.join(__dirname, 'entities', `*.entity.${ext}`)],
  migrations: [path.join(__dirname, 'migrations', `*.${ext}`)],
  seeds: [path.join(__dirname, 'seeders', `*.seed.${ext}`)],
  factories: [],
};

export const AppDataSource = new DataSource(options);
