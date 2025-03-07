import { GraphQLEnumType } from 'graphql';

import {
  getGqlEnumTypeFromSchema,
  getGqlTypeNameFromSchema,
} from '@core/infrastructure/database';
import {
  CreateGqlInputFromSchema,
  CreateMutationResolver,
  CreateQueryResolver,
  getGqlScalarType,
} from '@core/interfaces/gql';

import { User, UserService, UserType } from '../../infrastructure';
import { CreateUserInput } from '../inputs/user.input';

export const getAllUsers = CreateQueryResolver(
  {
    type: getGqlTypeNameFromSchema({ User }),
  },
  async () => {
    throw 'Not implemented';
  },
);

export const testResolver = CreateQueryResolver(
  {
    type: getGqlScalarType('String'),
    args: {
      userId: { type: getGqlScalarType('String') },
    },
  },
  async () => {
    return 'ddd';
  },
);

export const createUser = CreateMutationResolver<{ user: CreateUserInput }, unknown>(
  ({ entities }) => ({
    type: getGqlTypeNameFromSchema({ User }),
    args: {
      user: {
        type: CreateGqlInputFromSchema(
          { CreateUserInput },
          {
            required: true,
            getEnumType(_, { name }) {
              if (name === 'type') {
                const type = getGqlEnumTypeFromSchema(entities, {
                  UserType,
                }) as GraphQLEnumType;

                return type;
              }
              return undefined;
            },
          },
        ),
      },
    },
  }),
  async ({ args, ctx }) => {
    return ctx.scope.resolve<UserService>('userService').createUser(args.user);
  },
);
