import { BaseRepository, Schema } from '@core/infrastructure/database';
import { FindConfig } from '@shared/types';
import { buildRelations, buildSelect } from '@shared/utils';

import { User } from '../models';

export class UserRepository extends BaseRepository<Schema<typeof User>> {
  constructor() {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0]);
  }

  async create(
    userObj: typeof User.$inferInsert,
    config?: FindConfig<typeof User.$inferSelect>,
  ) {
    const select = config?.select;
    if (select) {
      const returnObj = select.reduce(
        (obj, field) => {
          (obj[field] as unknown) = User[field];
          return obj;
        },
        {} as { [x in keyof typeof User.$inferInsert]: (typeof User)[x] },
      );
      return this._db.insert(User).values(userObj).returning(returnObj);
    } else {
      return this._db.insert(User).values(userObj).returning();
    }
  }

  async getById(id: string, config?: FindConfig<typeof User.$inferSelect>) {
    return this.findFirst({
      where(user, { eq }) {
        return eq(user.id, id);
      },
      with: config?.relations ? buildRelations(config.relations) : undefined,
      columns: config?.select ? buildSelect(config.select) : undefined,
    });
  }

  async getByPhone(phone: string, config?: FindConfig<typeof User.$inferSelect>) {
    return this.findFirst({
      where(user, { eq }) {
        return eq(user.phone, phone);
      },
      with: config?.relations ? buildRelations(config.relations) : undefined,
      columns: config?.select ? buildSelect(config.select) : undefined,
    });
  }

  async getByEmail(likeEmail: string, config?: FindConfig<typeof User.$inferSelect>) {
    return this.findFirst({
      where(user, { like }) {
        return like(user.email, `%${likeEmail}%`);
      },
      with: config?.relations ? buildRelations(config.relations) : undefined,
      columns: config?.select ? buildSelect(config.select) : undefined,
    });
  }
}

export default UserRepository;
