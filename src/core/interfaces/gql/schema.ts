import {
  type GraphQLFieldConfig,
  GraphQLObjectType,
  GraphQLSchema,
  type ThunkObjMap,
} from 'graphql';

import { ApolloContext } from '@shared/types';

export const buildSchema = (
  queries: ThunkObjMap<GraphQLFieldConfig<unknown, ApolloContext, unknown>>,
  mutations: ThunkObjMap<GraphQLFieldConfig<unknown, ApolloContext, unknown>>,
  types: Record<string, GraphQLObjectType>,
  inputs: Record<string, GraphQLObjectType>,
): GraphQLSchema => {
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queries,
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: mutations,
    }),
    types: [...Object.values(types), ...Object.values(inputs)],
  });

  return schema;
};
