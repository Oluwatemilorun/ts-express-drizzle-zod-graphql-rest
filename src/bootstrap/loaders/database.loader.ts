import { asValue } from 'awilix';

import { createDatabaseConnection, runMigrations } from '@core/infrastructure/database';
import { Loader } from '@shared/types';

export default <Loader<void, { models: Record<string, unknown> }>>(
  function ({ container, models }) {
    const db = createDatabaseConnection(models);

    runMigrations(db)
      .then(() => console.log('Migration generated'))
      .catch((err) => {
        console.error(err);
        throw err;
      });

    container.register({ database: asValue(db) });
  }
);
