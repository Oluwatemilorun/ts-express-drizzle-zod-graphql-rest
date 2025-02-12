import { asValue } from 'awilix';
import { Relation } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { glob } from 'glob';
import path from 'path';

import { ContainerStore, Loader } from '@shared/types';

/**
 * Find and register all models in the modules directory
 */
export default <Loader<Record<string, PgTable | Relation>>>function ({ container }) {
  const modelsPath = path.join(__dirname, '../../modules/**/*.model.{ts,js}');
  const models: Record<string, PgTable | Relation> = {};
  const foundModels = glob.sync(modelsPath, {
    cwd: __dirname,
  });

  foundModels.forEach((fn) => {
    // eslint-disable-next-line  @typescript-eslint/no-require-imports
    const loaded = require(fn) as Record<string, PgTable>;
    if (loaded) {
      Object.entries(loaded).map(([modelName, model]: [string, PgTable | Relation]) => {
        if (
          typeof model === 'function' ||
          model instanceof PgTable ||
          ['Relations'].includes(model.constructor.name)
        ) {
          container.register({
            [modelName]: asValue(model as PgTable),
          });

          container.registerStore(ContainerStore.DB_ENTITIES, asValue(model));
        }

        models[modelName] = model;
      });
    }
  });

  return models;
};
