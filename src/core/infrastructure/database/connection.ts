import { drizzle, NodePgClient, NodePgDatabase } from 'drizzle-orm/node-postgres';

import { Config } from '@core/config';

const databaseUrl = Config.DB_URL
  ? Config.DB_URL
  : `postgres://${Config.DB_USERNAME}:${Config.DB_PASSWORD}` +
    `@${Config.DB_HOST}:${Config.DB_PORT}/${Config.DB_DATABASE}`;

export const createDatabaseConnection = (
  schema: Record<string, unknown>,
): NodePgDatabase<Record<string, unknown>> & {
  $client: NodePgClient;
} => {
  return drizzle({ connection: databaseUrl, casing: 'snake_case', schema });
};
