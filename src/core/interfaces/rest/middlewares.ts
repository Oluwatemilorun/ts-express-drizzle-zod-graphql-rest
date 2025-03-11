import { NextFunction, Request, Response } from 'express';

import { sendError } from './error-handler';
import { Middleware } from './types';

export function middlewareWrapper(
  middleware: Middleware,
): (req: Request, res: Response, next: NextFunction) => void {
  return async function (req, res, next) {
    try {
      await middleware(req, res);
      next();
    } catch (error) {
      sendError(res, error);
    }
  };
}
