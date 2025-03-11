import { LifetimeType } from 'awilix';

import { TransactionService } from '@core/infrastructure/database';

export class BaseService extends TransactionService {
  static readonly __LIFETIME__: LifetimeType = 'SCOPED';

  protected _stripForbiddenFields<T extends Record<string, unknown>>(
    obj: T,
    fields: (keyof T)[],
  ): T {
    return Object.fromEntries(
      Object.entries(obj).filter(([key]) => !fields.includes(key)),
    ) as T;
  }
}
