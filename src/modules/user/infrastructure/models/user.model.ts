import * as orm from 'drizzle-orm/pg-core';

import { IdColumn, TimestampColumn } from '@core/utils';

export const UserType = orm.pgEnum('user_type', ['DJ', 'ARTIST', 'LABEL']);

export const User = orm.pgTable(
  'user',
  {
    ...IdColumn('USR'),

    type: UserType().notNull().default('ARTIST'),

    firstName: orm.varchar({ length: 256 }),
    lastName: orm.varchar({ length: 256 }),
    email: orm.varchar({ length: 120 }).notNull().unique(),
    phone: orm.varchar({ length: 20 }).notNull().unique(),
    password: orm.varchar().notNull(),

    appleLoginId: orm.varchar(),
    googleLoginId: orm.varchar(),

    ...TimestampColumn,
  },
  (table) => [
    // Indexes
    orm.index('user_created_idx').on(table.createdAt),
    orm.uniqueIndex('user_phone_idx').on(table.phone),
    orm.uniqueIndex('user_email_gin_idx').using('gin', table.email),

    // Relations
  ],
);
