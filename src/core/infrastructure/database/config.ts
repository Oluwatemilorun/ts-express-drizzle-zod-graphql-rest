import { Config } from '@core/config';

export const databaseUrl = Config.DB_URL
  ? Config.DB_URL
  : `postgres://${Config.DB_USERNAME}:${Config.DB_PASSWORD}` +
    `@${Config.DB_HOST}:${Config.DB_PORT}/${Config.DB_DATABASE}`;
