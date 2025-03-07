import { createAppContainer } from '@core/utils';
import { AppContainer, Express } from '@shared/types';

import databaseLoader from './database.loader';
import graphqlServerLoader from './graphql-server.loader';
import repositoriesLoader from './repositories.loader';
import servicesLoader from './services.loader';

export default async (
  app: Express,
): Promise<{
  container: AppContainer;
}> => {
  const container = createAppContainer();

  const db = await databaseLoader({ container });

  await repositoriesLoader({ container });

  await servicesLoader({ container });

  await graphqlServerLoader({ app, container, db });

  return { container };
};
