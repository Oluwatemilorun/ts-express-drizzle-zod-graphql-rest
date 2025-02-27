import { glob } from 'glob';
import { ZodObject } from 'zod';

import { ApolloContext } from '@shared/types';

import {
  EntitiesObject,
  InputsObject,
  MutationResolverConfig,
  QueryResolverConfig,
  ResolverBuilder,
} from './types';

export const loadResolversFromPath = (
  path: string,
  entities: EntitiesObject,
  inputs: InputsObject,
): {
  queries: Record<string, QueryResolverConfig<unknown, ApolloContext, unknown>>;
  mutations: Record<string, MutationResolverConfig<unknown, ApolloContext, unknown>>;
} => {
  const foundResolvers = glob.sync(path, {
    cwd: __dirname,
  });
  const resolversSchema = {
    queries: {} as Record<string, QueryResolverConfig<unknown, ApolloContext, unknown>>,
    mutations: {} as Record<
      string,
      MutationResolverConfig<unknown, ApolloContext, unknown>
    >,
  };

  return foundResolvers.reduce((resolvers, fn) => {
    // eslint-disable-next-line  @typescript-eslint/no-require-imports
    const loaded = require(fn) as Record<
      string,
      ResolverBuilder<unknown, ApolloContext, unknown>
    >;

    if (loaded) {
      Object.entries(loaded).map(
        ([resolverName, resolver]: [
          string,
          ResolverBuilder<unknown, ApolloContext, unknown>,
        ]) => {
          if (
            typeof resolver === 'function' // TODO: add function type check
          ) {
            const resolverConfig = resolver({
              entities,
              inputs,
            });

            if (resolverConfig.resolverType === 'query') {
              resolvers.queries[resolverName] = resolverConfig;
            }

            if (resolverConfig.resolverType === 'mutation') {
              resolvers.mutations[resolverName] = resolverConfig;
            }
          }
        },
      );
    }

    return resolvers;
  }, resolversSchema);
};

export const loadInputsFromPath = (path: string): InputsObject => {
  const foundInputs = glob.sync(path, {
    cwd: __dirname,
  });

  return foundInputs.reduce((inputs, fn) => {
    // eslint-disable-next-line  @typescript-eslint/no-require-imports
    const loaded = require(fn) as InputsObject;

    if (loaded) {
      Object.entries(loaded).map(
        ([inputName, input]: [string, InputsObject[keyof InputsObject]]) => {
          if (input instanceof ZodObject) {
            inputs[inputName] = input;
          }
        },
      );
    }

    return inputs;
  }, {} as InputsObject);
};
