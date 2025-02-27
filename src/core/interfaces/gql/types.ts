import {
  type GraphQLFieldConfig,
  type GraphQLOutputType,
  type GraphQLResolveInfo,
} from 'graphql';
import { AnyZodObject } from 'zod';

import { ApolloContext } from '@shared/types';

export type ResolverConfig<TSource, TContext, TArgs = object> = Omit<
  GraphQLFieldConfig<TSource, TContext, TArgs>,
  'resolver' | 'subscribe' | 'type'
> & { type: string | GraphQLOutputType };

export type ResolverConfigThunk<TSource, TContext, TArgs = object> = (
  opts: ResolverBuilderOpts,
) => ResolverConfig<TSource, TContext, TArgs>;

export type Resolver<
  TArgs = object,
  TReturn = unknown,
  TContextUser = object,
> = (resolveArgs: {
  args: TArgs;
  ctx: ApolloContext<TContextUser>;
  info: GraphQLResolveInfo;
}) => TReturn | Promise<TReturn>;

export type QueryResolverConfig<TSource, TContext, TArgs> = GraphQLFieldConfig<
  TSource,
  TContext,
  TArgs
> & { resolverType: 'query' };

export type MutationResolverConfig<TSource, TContext, TArgs> = GraphQLFieldConfig<
  TSource,
  TContext,
  TArgs
> & { resolverType: 'mutation' };

export type ResolverBuilderOpts = {
  entities: EntitiesObject;
  inputs: InputsObject;
  // container: AppContainer;
};

export type ResolverBuilder<TSource, TContext = ApolloContext, TArgs = object> = (
  opts: ResolverBuilderOpts,
) =>
  | QueryResolverConfig<TSource, TContext, TArgs>
  | MutationResolverConfig<TSource, TContext, TArgs>;

export type EntitiesObject = Record<string, GraphQLOutputType>;
export type InputsObject = Record<string, AnyZodObject>;
