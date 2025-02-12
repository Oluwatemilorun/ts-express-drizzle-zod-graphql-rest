import { TableRelationalConfig } from 'drizzle-orm';

export type Schema<M> = TableRelationalConfig & M;
