/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DBQueryConfig, Table, TableRelationalConfig } from 'drizzle-orm';
import { NodePgClient, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { RelationalQueryBuilder } from 'drizzle-orm/pg-core/query-builders/query';

import { FindConfig } from '@shared/types';

import { Transaction } from './types';

export class BaseRepository<M extends TableRelationalConfig> {
  protected _db: NodePgDatabase<{ table: M }> & {
    $client: NodePgClient;
  };

  protected constructor(
    protected readonly __container__: any,
    /**
     * The table name for the repository.
     * This is used to extract the schema definition from the database
     */
    protected readonly __table__: string,
  ) {
    this._db = __container__.database;
  }

  protected _getReturnObject<TSchema extends Table>(
    schema: TSchema,
    config?: FindConfig<TSchema['$inferSelect']>,
  ) {
    const select = config?.select;

    if (!select) {
      return null;
    }

    return select.reduce(
      (obj, field) => {
        (obj[field] as unknown) = schema[field];
        return obj;
      },
      {} as { [x in keyof TSchema['$inferInsert']]: TSchema[x] },
    );
  }

  async findFirst(config?: Omit<DBQueryConfig<'many', true, any, M>, 'limit'>) {
    return await (
      (this._db.query as any)[this.__table__] as RelationalQueryBuilder<{ table: M }, M>
    ).findFirst(config);
  }

  async findMany(config?: DBQueryConfig<'many', true, any, M>) {
    return await (
      (this._db.query as any)[this.__table__] as RelationalQueryBuilder<{ table: M }, M>
    ).findMany(config);
  }

  withTransaction(tx: Transaction): this {
    const cloned = new (this.constructor as any)(this.__container__, this.__table__);

    cloned._db = tx;

    return cloned;
  }
}
