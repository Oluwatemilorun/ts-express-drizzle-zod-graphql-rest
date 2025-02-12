import { createAppContainer } from '@core/utils';

import databaseLoader from './database.loader';
import modelsLoader from './models.loader';
import repositoriesLoader from './repositories.loader';

const container = createAppContainer();

export default async (): Promise<void> => {
  const models = await modelsLoader({ container });

  await databaseLoader({ container, models });

  await repositoriesLoader({ container });

  const sessionRepo = container.resolve('sessionRepository');

  sessionRepo.findOne();
};
