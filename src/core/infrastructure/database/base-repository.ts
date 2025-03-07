/* eslint-disable @typescript-eslint/no-explicit-any */
import { DBQueryConfig, TableRelationalConfig } from 'drizzle-orm';
import { NodePgClient, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { RelationalQueryBuilder } from 'drizzle-orm/pg-core/query-builders/query';

import { Transaction } from './types';

export class BaseRepository<M extends TableRelationalConfig> {
  protected _db: NodePgDatabase<{ table: M }> & {
    $client: NodePgClient;
  };

  protected constructor(
    protected readonly __container__: any,
    protected readonly __moduleDeclaration__?: Record<string, unknown>,
  ) {
    this._db = __container__.database;
  }

  async findFirst(config?: Omit<DBQueryConfig<'many', true, any, M>, 'limit'>) {
    return await (
      (this._db.query as any).schema as RelationalQueryBuilder<{ table: M }, M>
    ).findFirst(config);
  }

  async findMany(config?: DBQueryConfig<'many', true, any, M>) {
    return await (
      (this._db.query as any).schema as RelationalQueryBuilder<{ table: M }, M>
    ).findMany(config);
  }

  withTransaction(tx: Transaction): this {
    const cloned = new (this.constructor as any)(
      this.__container__,
      this.__moduleDeclaration__,
    );

    cloned._db = tx;

    return cloned;
  }
}
