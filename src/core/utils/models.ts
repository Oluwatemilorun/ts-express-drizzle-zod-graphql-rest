import { timestamp, varchar } from 'drizzle-orm/pg-core';

import { generateEntityId } from './id-generator';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const IdColumn = (prefix?: string) => ({
  id: varchar()
    .primaryKey()
    .$default(() => generateEntityId(undefined, prefix)),
});

export const CreatedTimestampColumn = {
  createdAt: timestamp().defaultNow().notNull(),
};

export const TimestampColumn = {
  ...CreatedTimestampColumn,
  updatedAt: timestamp(),
};

export const SoftDeletableTimestampColumn = {
  deletedAt: timestamp(),
};
