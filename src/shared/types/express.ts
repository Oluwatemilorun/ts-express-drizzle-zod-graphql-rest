import { Express as E } from 'express';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Express {
  export interface Request {
    scope: unknown;
  }
}

export type Express = E;
