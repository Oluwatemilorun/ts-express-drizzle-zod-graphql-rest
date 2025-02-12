import { asValue } from 'awilix';

import { createDatabaseConnection, runMigrations } from '@core/infrastructure/database';
import logger from '@shared/logger';
import { Loader } from '@shared/types';

export default <Loader<void, { models: Record<string, unknown> }>>(
  function ({ container, models }) {
    const db = createDatabaseConnection(models);

    runMigrations(db)
      .then(() => logger.info('Database migration completed'))
      .catch((err) => {
        logger.error(err);
        throw err;
      });

    container.register({ database: asValue(db) });
  }
);
