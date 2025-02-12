import * as orm from 'drizzle-orm/pg-core';

import { IdColumn, TimestampColumn } from '@core/utils';

export const User = orm.pgTable(
  'users',
  {
    ...IdColumn('USR'),
    firstName: orm.varchar('first_name', { length: 256 }),
    lastName: orm.varchar('last_name', { length: 256 }),
    email: orm.varchar().notNull().unique(),
    ...TimestampColumn,
  },
  (table) => [
    orm.index('user_created_idx').on(table.createdAt),
    orm.uniqueIndex('user_email_gin_idx').using('gin', table.email),
  ],
);
