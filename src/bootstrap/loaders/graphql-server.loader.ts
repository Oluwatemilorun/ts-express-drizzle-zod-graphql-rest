import path from 'path';

import { buildGraphqlSchemaFromDb, Database } from '@core/infrastructure/database';
import {
  buildSchema,
  loadInputsFromPath,
  loadResolversFromPath,
} from '@core/interfaces/gql';
import { CreateGraphqlServer } from '@core/servers';
import Constants from '@shared/constants';
import { AppContainer, Express, Loader } from '@shared/types';

export default <Loader<void, { db: Database; app: Express }>>(
  async function ({ container, db, app }) {
    const inputsPath = path.join(__dirname, '../../modules/**/*.input.{ts,js}');
    const resolversPath = path.join(__dirname, '../../modules/**/*.resolver.{ts,js}');

    const inputs = loadInputsFromPath(inputsPath);

    const {
      entities: { types, enums },
    } = buildGraphqlSchemaFromDb(db);

    const { queries, mutations } = loadResolversFromPath(
      resolversPath,
      { ...types, ...enums },
      inputs,
    );

    const schema = buildSchema(
      queries,
      mutations,
      types,
      {
        // Drizzle generates a bunch of inputs that are probably not required.
        // Uncomment this line to include the generated input types
        // ...entities.inputs,
      }, // TODO: merge custom inputs
    );

    await CreateGraphqlServer({
      route: Constants.APP_CONFIG.GRAPHQL_ENDPOINT_ROUTE,
      app,
      schema,
      context: async ({ req }) => {
        return {
          token: req.headers.authorization,
          // Inject the registered services into the apollo graphql server context
          scope: container.createScope() as AppContainer,
          // Inject the client remote address into the apollo graphql server context
          remoteAddress:
            (req as unknown as Record<string, string>)[
              Constants.REQUEST_ATTRIBUTES.IP_ADDRESS
            ] || 'localhost',
        };
      },
    });
  }
);
