import { ApolloServer, ContextFunction } from '@apollo/server';
import {
  ExpressContextFunctionArgument,
  expressMiddleware,
} from '@apollo/server/express4';
import { Express } from 'express';
import { GraphQLSchema } from 'graphql';

import { ApolloContext } from '@shared/types';

import { queryComplexityPlugin } from './plugins';

interface GqServerOpts {
  app: Express;
  context: ContextFunction<[ExpressContextFunctionArgument], ApolloContext<object>>;
  route: string;
  schema: GraphQLSchema;
}

export const CreateGraphqlServer = async ({
  app,
  context,
  route,
  schema,
}: GqServerOpts): Promise<void> => {
  const server = new ApolloServer<ApolloContext>({
    schema,
    plugins: [queryComplexityPlugin(schema)],
  });

  await server.start();

  app.use(
    route,
    expressMiddleware(server, {
      context,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any,
  );
};
