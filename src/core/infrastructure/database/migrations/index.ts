import { defineConfig } from 'drizzle-kit';
import path from 'path';

import { databaseUrl } from '../config';

const schemaGlob = '/src/modules/**/*.model.{ts,js}';

export default defineConfig({
  dialect: 'postgresql',
  schema: process.cwd() + schemaGlob,
  out: path.join(__dirname, '.'),
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
