import './loadenv';

import { AppConfig } from './app';
import { DatabaseConfig } from './database';
import { ServerConfig } from './server';

/**
 * The config properties here are defined in the  dotenv `.env.*` files.
 * They are loaded based on the build environment.
 */
export const Config = {
  ...AppConfig,
  ...ServerConfig,
  ...DatabaseConfig,
} as const;
