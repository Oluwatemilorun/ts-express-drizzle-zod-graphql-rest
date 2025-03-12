import { z } from 'zod';

import { createInsertInputFromSchema } from '@core/infrastructure/database';

import { User } from '../../infrastructure';

export const CreateUserInput = createInsertInputFromSchema(User, {
  email: (z) => z.email().describe('The email of the user'),
  password: (z) =>
    z
      .refine((v) => (v.length >= 8 ? true : 'Password must be at least 8 characters'))
      .describe('The password of the user'),
})
  .extend({
    metadata: z.object({
      wallet: z.string(),
    }),
  })
  .pick({
    firstName: true,
    email: true,
    password: true,
    phone: true,
  })
  .describe('Used when creating a new user');

export type CreateUserInput = z.infer<typeof CreateUserInput>;

export const FilterUserInput = z.object({
  active: z.boolean().optional(),
});

export const GetSingleUserInput = z.object({
  id: z.string(),
});
