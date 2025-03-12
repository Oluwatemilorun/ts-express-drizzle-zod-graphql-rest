import { createRoutingController } from '@core/interfaces/rest';

import {
  CreateUserInput,
  FilterUserInput,
  GetSingleUserInput,
  UserService,
} from '../../application';

export const UserController = createRoutingController('/users', {
  '/': ({ controller }) => ({
    post: controller({
      body: CreateUserInput,
      handler: async ({ body, ctx }) => {
        const res = await ctx.scope.resolve<UserService>('userService').createUser(body);

        return {
          data: res,
          message: 'User created successfully',
        };
      },
    }),

    get: controller({
      query: FilterUserInput,
      handler: async ({ query }) => {
        return {
          data: [],
          message: `${query.active ? 'Active' : 'Inactive'} users retrieved successfully`,
        };
      },
    }),
  }),

  '/:id': ({ controller }) => ({
    get: controller({
      params: GetSingleUserInput,
      handler: async ({ params }) => {
        return {
          data: params,
          message: 'User retrieved successfully',
        };
      },
    }),
  }),
});
