import { relations } from 'drizzle-orm';
import * as orm from 'drizzle-orm/pg-core';

import { TimestampColumn } from '@core/utils';
import { User } from '@modules/user';

export const Session = orm.pgTable(
  'session',
  {
    token: orm.varchar().primaryKey(),
    userId: orm.varchar().notNull(),
    userAgent: orm.text(),
    userIp: orm.inet(),
    active: orm.boolean().default(true).notNull(),
    ...TimestampColumn,
  },
  (table) => [
    orm.uniqueIndex('session__user_id_idx').on(table.userId),
    orm.foreignKey({ columns: [table.userId], foreignColumns: [User.id] }),
  ],
);

export const SessionRelation = relations(Session, ({ one }) => ({
  user: one(User, { fields: [Session.userId], references: [User.id] }),
}));
