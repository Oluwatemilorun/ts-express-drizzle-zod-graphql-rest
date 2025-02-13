import { createAppContainer } from '@core/utils';
import { AppContainer } from '@shared/types';

import databaseLoader from './database.loader';
import modelsLoader from './models.loader';
import repositoriesLoader from './repositories.loader';

export default async (): Promise<{
  container: AppContainer;
}> => {
  const container = createAppContainer();

  const models = await modelsLoader({ container });

  await databaseLoader({ container, models });

  await repositoriesLoader({ container });

  return { container };
};
