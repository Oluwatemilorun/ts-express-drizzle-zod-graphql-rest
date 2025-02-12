import { asValue } from 'awilix';

import { createDatabaseConnection } from '@core/infrastructure/database';
import { Loader } from '@shared/types';

export default <Loader<void, { models: Record<string, unknown> }>>(
  function ({ container, models }) {
    const db = createDatabaseConnection(models);

    container.register({ database: asValue(db) });
  }
);
