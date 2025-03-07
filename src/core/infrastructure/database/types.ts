import type { ExtractTablesWithRelations, TableRelationalConfig } from 'drizzle-orm';
import type {
  NodePgClient,
  NodePgDatabase,
  NodePgQueryResultHKT,
} from 'drizzle-orm/node-postgres';
import { PgTransaction } from 'drizzle-orm/pg-core';

export type Schema<M> = TableRelationalConfig & M;

export type Database = NodePgDatabase<Record<string, unknown>> & {
  $client: NodePgClient;
};

export type Transaction = PgTransaction<
  NodePgQueryResultHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;

export type IsolationLevel =
  | 'read uncommitted'
  | 'read committed'
  | 'repeatable read'
  | 'serializable';
