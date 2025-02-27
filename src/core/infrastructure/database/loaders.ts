import { is, Relation } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { glob } from 'glob';

export const loadModelsFromPath = (path: string): Record<string, PgTable | Relation> => {
  const foundModels = glob.sync(path, {
    cwd: __dirname,
  });

  return foundModels.reduce(
    (models, fn) => {
      // eslint-disable-next-line  @typescript-eslint/no-require-imports
      const loaded = require(fn) as Record<string, PgTable>;
      if (loaded) {
        Object.entries(loaded).map(([modelName, model]: [string, PgTable | Relation]) => {
          if (typeof model === 'function' || is(model, PgTable) || is(model, Relation)) {
            // TODO: models should be probably be add to the container store
            models[modelName] = model;
          }
        });
      }

      return models;
    },
    {} as Record<string, PgTable | Relation>,
  );
};
