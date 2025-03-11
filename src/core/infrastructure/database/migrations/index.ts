import { defineConfig } from 'drizzle-kit';
import path from 'path';

import { databaseUrl } from '../config';

const schemaGlob = '/src/modules/**/*.model.{ts,js}';
const migrationsDir = path.join('./src', __dirname.split('src')[1], './');

export default defineConfig({
  dialect: 'postgresql',
  schema: process.cwd() + schemaGlob,
  out: migrationsDir,
  casing: 'snake_case',
  dbCredentials: {
    url: databaseUrl,
  },
  migrations: {
    table: 'migrations',
    schema: 'public',
  },
  introspect: {
    casing: 'camel',
  },
});
