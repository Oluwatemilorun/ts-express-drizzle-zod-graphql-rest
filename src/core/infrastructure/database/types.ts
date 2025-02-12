import type { TableRelationalConfig } from 'drizzle-orm';
import type { NodePgClient, NodePgDatabase } from 'drizzle-orm/node-postgres';

export type Schema<M> = TableRelationalConfig & M;

export type Database = NodePgDatabase<Record<string, unknown>> & {
  $client: NodePgClient;
};
