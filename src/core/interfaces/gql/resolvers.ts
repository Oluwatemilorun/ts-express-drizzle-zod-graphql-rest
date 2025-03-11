import { GraphQLError, type GraphQLOutputType } from 'graphql';

import { ApolloContext } from '@shared/types';

import { handleError } from './error-handler';
import {
  InputsObject,
  Resolver,
  ResolverBuilder,
  ResolverConfig,
  ResolverConfigThunk,
} from './types';
import { mapArgsToValidator, validateArgsValues } from './validator';

/**
 * This helps configure a query resolver.
 * This will be used to setup all query resolvers that will be picked up by the
 * loader for resolvers.
 * 
 * @example
 * // user.resolver.ts
 * export const getUser = CreateQueryResolver<{ userId: string}, User>(
 *  {
 *    type: getGqlTypeNameFromSchema({ User }),
 *    args: {
        userId: { type: getGqlType('string') }
      }
 *  },
    async ({ args, ctx }) => {
      return ctx.resolve('userService').getUserById(args.userId)
    }
 * )
 * 
 * @param config resolver configuration options
 * @param resolve callback function that will run and returns the query result
 * @returns a graphql query resolver builder
 */
export function CreateQueryResolver<
  Args = object,
  TReturn = unknown,
  TContextUser = object,
>(
  config:
    | ResolverConfigThunk<unknown, ApolloContext<TContextUser>, Args>
    | ResolverConfig<unknown, ApolloContext<TContextUser>, Args>,
  resolve: Resolver<Args, TReturn, TContextUser>,
): ResolverBuilder<unknown, ApolloContext<TContextUser>, Args> {
  return function makeResolver({ entities, inputs }) {
    if (typeof config === 'function') config = config({ entities, inputs });

    // eslint-disable-next-line prefer-const
    let { type, ...opts } = config;
    let argsToValidatorMap = {} as InputsObject;

    if (typeof type === 'string') {
      type = entities[type] as GraphQLOutputType;
    }

    if (opts.args) {
      argsToValidatorMap = mapArgsToValidator(opts.args, inputs);
    }

    return {
      resolverType: 'query',
      type,
      ...opts,
      resolve: (_, args, ctx, info): TReturn | Promise<TReturn> => {
        try {
          if (args) {
            validateArgsValues(args, argsToValidatorMap);
          }

          return resolve({ args, ctx, info });
        } catch (error) {
          const [message, extensions] = handleError(error);
          throw new GraphQLError(message, { extensions });
        }
      },
    };
  };

  // return makeResolver;
}

/**
 * This helps configure a mutation resolver.
 * This will be used to setup all mutation resolvers that will be picked up by the
 * loader for resolvers.
 * 
 * @example
 * // user.resolver.ts
 * export const createUser = CreateMutationResolver<{ user: CreateUserInput}, User>(
 *  {
 *    type: User,
 *    args: {
        user: { type: CreateUserInput }
      }
 *  },
    async ({ args, ctx }) => {
      return ctx.resolve('userService').createUser(args.user)
    }
 * )
 * 
 * @param config resolver configuration options
 * @param resolve callback function that will run and returns the query result
 * @returns a graphql query resolver builder
 */
export function CreateMutationResolver<
  Args = object,
  TReturn = unknown,
  TContextUser = object,
>(
  config:
    | ResolverConfigThunk<unknown, ApolloContext<TContextUser>, Args>
    | ResolverConfig<unknown, ApolloContext<TContextUser>, Args>,
  resolve: Resolver<Args, TReturn, TContextUser>,
): ResolverBuilder<unknown, ApolloContext<TContextUser>, Args> {
  return function makeResolver({ entities, inputs }) {
    if (typeof config === 'function') config = config({ entities, inputs });

    // eslint-disable-next-line prefer-const
    let { type, ...opts } = config;
    let argsToValidatorMap = {} as InputsObject;

    if (typeof type === 'string') {
      // const entities = container.resolve(ContainerStore.GQL_ENTITY_TYPES);
      type = entities[type];
    }

    if (opts.args) {
      argsToValidatorMap = mapArgsToValidator(opts.args, inputs);
    }

    return {
      resolverType: 'mutation',
      type,
      ...opts,
      resolve: async (_, args, ctx, info): Promise<TReturn> => {
        try {
          if (args) {
            args = validateArgsValues(args, argsToValidatorMap);
          }

          return await resolve({ args, ctx, info });
        } catch (error) {
          const [message, extensions] = handleError(error);
          throw new GraphQLError(message, { extensions });
        }
      },
    };
  };

  // return makeResolver;
}
