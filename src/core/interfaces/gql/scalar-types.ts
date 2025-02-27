import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLScalarType,
  GraphQLString,
} from 'graphql';
import { resolvers } from 'graphql-scalars';

import { GqlScalarTypes } from '@shared/types';

const DEFAULT_TYPES = ['String', 'Int', 'Float', 'Number', 'Boolean', 'ID'];

/**
 * Checks if the GraphQL scalar type is defined and available.
 * @param type the graphql scalar type to check
 * @returns `true` if the scalar type is defined, otherwise `false`
 */
export const isDefinedGqlScalarType = (type: string): boolean => {
  if (DEFAULT_TYPES.includes(type)) return true;
  else if (type in resolvers) return true;
  return false;
};

/** Gets the GraphQL scalar type */
export const getGqlScalarType = (type: GqlScalarTypes): GraphQLScalarType => {
  // Default GraphQL scalar types
  if (DEFAULT_TYPES.includes(type)) {
    switch (type) {
      case 'String':
        return GraphQLString;
      case 'ID':
        return GraphQLID;
      case 'Boolean':
        return GraphQLBoolean;
      case 'Int':
        return GraphQLInt;
      case 'Float':
      case 'Number':
      default:
        return GraphQLFloat;
    }
  } else if (type in resolvers) {
    return resolvers[type];
  } else {
    throw new Error(`Unknown GraphQL scalar type (${type}).`);
  }
};
