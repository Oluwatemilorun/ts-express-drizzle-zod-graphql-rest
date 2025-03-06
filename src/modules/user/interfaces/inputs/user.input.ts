import { z } from 'zod';

import { createInsertInputFromSchema } from '@core/infrastructure/database';

import { User } from '../../infrastructure/models';

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
    id: true,
    firstName: true,
    email: true,
    password: true,
  })
  .describe('Used when creating a new user');

export type CreateUserInput = z.infer<typeof CreateUserInput>;
