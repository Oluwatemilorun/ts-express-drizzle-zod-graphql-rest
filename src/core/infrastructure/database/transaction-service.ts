import { LifetimeType } from 'awilix';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import { PgDatabase } from 'drizzle-orm/pg-core';

import { IsolationLevel, Transaction } from './types';

type Database = PgDatabase<NodePgQueryResultHKT>;

export class TransactionService {
  static readonly __LIFETIME__: LifetimeType = 'SCOPED';

  protected _db: Database;

  protected _transaction: Transaction | undefined;

  protected constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected readonly __container__: any,
    protected readonly __moduleDeclaration__?: Record<string, unknown>,
  ) {
    this._db = __container__.database;
  }

  protected _shouldRetryTransaction(
    err: { code: string } | Record<string, unknown>,
  ): boolean {
    if (!(err as { code: string })?.code) {
      return false;
    }
    const code = (err as { code: string })?.code;
    return code === '40001' || code === '40P01';
  }

  /**
   * Wraps some work within a transactional block. If the service already has
   * a transaction manager attached this will be reused, otherwise a new
   * transaction manager is created.
   *
   * @param work - the transactional work to be done
   * @param isolationOrErrorHandler - the isolation level to be used for the work.
   * @param maybeErrorHandlerOrDontFail Potential error handler
   * @return the result of the transactional work
   */
  protected async _atomicPhase<TResult, TError>(
    work: (tx: Transaction) => Promise<TResult | never>,
    isolationOrErrorHandler?:
      | IsolationLevel
      | ((error: TError) => Promise<never | TResult | void>),
    maybeErrorHandlerOrDontFail?: (error: TError) => Promise<never | TResult | void>,
  ): Promise<never | TResult> {
    let errorHandler = maybeErrorHandlerOrDontFail;
    let isolation:
      | IsolationLevel
      | ((error: TError) => Promise<never | TResult | void>)
      | undefined
      | null = isolationOrErrorHandler;
    let dontFail = false;
    if (typeof isolationOrErrorHandler === 'function') {
      isolation = null;
      errorHandler = isolationOrErrorHandler;
      dontFail = !!maybeErrorHandlerOrDontFail;
    }

    if (this._transaction) {
      const doWork = async (wTx: Transaction): Promise<TResult> => {
        this._db = wTx;
        this._transaction = wTx;

        try {
          return await work(wTx);
        } catch (error) {
          if (errorHandler) {
            this._transaction.rollback();

            await errorHandler(error as TError);
          }
          throw error;
        }
      };

      return doWork(this._transaction);
    } else {
      const temp = this._db;

      const doWork = async (wTx: Transaction): Promise<never | TResult> => {
        this._db = wTx;
        this._transaction = wTx;
        try {
          const result = await work(wTx);
          this._db = temp;
          this._transaction = undefined;
          return result;
        } catch (error) {
          this._db = temp;
          this._transaction = undefined;
          throw error;
        }
      };

      if (isolation && this._db) {
        let result;
        try {
          result = await this._db.transaction(async (tx) => doWork(tx), {
            isolationLevel: isolation as IsolationLevel,
          });

          return result;
        } catch (error) {
          if (this._shouldRetryTransaction(error as Record<string, unknown>)) {
            return this._db.transaction(async (tx) => doWork(tx), {
              isolationLevel: isolation as IsolationLevel,
            });
          } else {
            if (errorHandler) {
              await errorHandler(error as TError);
            }
            throw error;
          }
        }
      }

      try {
        return await this._db.transaction(async (m) => doWork(m));
      } catch (error) {
        if (errorHandler) {
          const result = await errorHandler(error as TError);
          if (dontFail) {
            return result as TResult;
          }
        }

        throw error;
      }
    }
  }

  withTransaction(tx?: Transaction): this {
    if (!tx) {
      return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cloned = new (this.constructor as any)(
      this.__container__,
      this.__moduleDeclaration__,
    );

    cloned._db = tx;
    cloned._transaction = tx;

    return cloned;
  }
}
