import { Router } from 'express';
import glob from 'glob';
import path from 'path';

import { AppContainer, Express, Loader } from '@shared/types';

/**
 * Registers all routing controllers in modules
 */
export default <Loader<void, { app: Express }>>function ({ app, container }) {
  const controllersPath = path.join(__dirname, '../../modules/**/*.controller.{ts,js}');

  const baseRouter = Router();

  const foundControllers = glob.sync(controllersPath, { cwd: __dirname });
  foundControllers.forEach((fn) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const loaded = require(fn) as Record<
      string,
      (baseRouter: Router, container: AppContainer) => Router
    >;

    if (loaded) {
      Object.entries(loaded).forEach(([_, controller]) => {
        controller(baseRouter, container);
      });
    }
  });

  app.use('/v1', baseRouter);
};
