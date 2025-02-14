import { asValue } from 'awilix';

import { createDatabaseConnection, runMigrations } from '@core/infrastructure/database';
import logger from '@shared/logger';
import { Loader } from '@shared/types';

export default <Loader<void, { models: Record<string, unknown> }>>(
  async function ({ container, models }) {
    const db = createDatabaseConnection(models);

    await runMigrations(db)
      .then(() => logger.info('Database migration completed'))
      .catch((err) => {
        logger.error('Database migration failed');
        throw err;
      });

    container.register({ database: asValue(db) });
  }
);
