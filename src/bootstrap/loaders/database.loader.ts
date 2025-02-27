import { asValue } from 'awilix';
import path from 'path';

import {
  createDatabaseConnection,
  Database,
  loadModelsFromPath,
  runMigrations,
} from '@core/infrastructure/database';
import logger from '@shared/logger';
import { Loader } from '@shared/types';

export default <Loader<Database>>async function ({ container }) {
  const modelsPath = path.join(__dirname, '../../modules/**/*.model.{ts,js}');
  const models = loadModelsFromPath(modelsPath);
  const db = createDatabaseConnection(models);

  await runMigrations(db)
    .then(() => logger.info('Database migration completed'))
    .catch((err) => {
      logger.error('Database migration failed');
      throw err;
    });

  container.register({ database: asValue(db) });

  return db;
};
