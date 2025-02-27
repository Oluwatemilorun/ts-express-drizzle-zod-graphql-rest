import { createAppContainer } from '@core/utils';
import { AppContainer } from '@shared/types';

import databaseLoader from './database.loader';
import repositoriesLoader from './repositories.loader';

export default async (): Promise<{
  container: AppContainer;
}> => {
  const container = createAppContainer();

  await databaseLoader({ container });

  await repositoriesLoader({ container });

  return { container };
};
