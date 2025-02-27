import { buildSchema, GeneratedData } from 'drizzle-graphql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';

import { databaseUrl } from './config';
import { Database } from './types';

export const createDatabaseConnection = (schema: Record<string, unknown>): Database => {
  return drizzle({ connection: databaseUrl, casing: 'snake_case', schema });
};

export const runMigrations = (db: Database): Promise<void> => {
  return migrate(db, { migrationsFolder: path.join(__dirname, './migrations') });
};

export const buildGraphqlSchemaFromDb = (db: Database): GeneratedData<Database> => {
  return buildSchema(db);
};
