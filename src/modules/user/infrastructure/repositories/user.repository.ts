import { BaseRepository, Schema } from '@core/infrastructure/database';

import { User } from '../models';

export default class UserRepository extends BaseRepository<Schema<typeof User>> {
  constructor() {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0]);
  }
}
