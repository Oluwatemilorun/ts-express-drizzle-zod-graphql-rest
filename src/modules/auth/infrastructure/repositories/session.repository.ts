import { BaseRepository, Schema } from '@core/infrastructure/database';

import { Session } from '../models';

export default class SessionRepository extends BaseRepository<Schema<typeof Session>> {
  constructor() {
    // eslint-disable-next-line prefer-rest-params
    super(arguments[0], 'Session');
  }

  async getActiveSessions() {
    this.findMany({
      where(session, { eq }) {
        return eq(session.active, true);
      },
    });
  }
}
