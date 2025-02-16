/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, Router } from 'express';
// @ts-expect-error the module is available
import Layer from 'express/lib/router/layer';
import helmet from 'helmet';
import morgan from 'morgan';
import requestIp from 'request-ip';

import { Config } from '@core/config';
import Constants from '@shared/constants';
import logger from '@shared/logger';

import { F, FunctionWithProps } from './types';

export * from './types';

const last = <T>(arr: T[] = []): T => arr[arr.length - 1];
const noop = Function.prototype;

function copyFnProps(
  oldFn: FunctionWithProps,
  newFn: FunctionWithProps | F<FunctionWithProps>,
): F {
  Object.keys(oldFn).forEach((key) => {
    (newFn as any)[key] = oldFn[key];
  });
  return newFn;
}

function wrap(fn: FunctionWithProps): F {
  const newFn = function newFn(this: any, ...args: any[]): FunctionWithProps {
    const ret = fn.apply(this, args);
    const next = (args.length === 5 ? args[2] : last(args)) || noop;
    if (ret && ret.catch) ret.catch((err: unknown) => next(err));
    return ret;
  };
  Object.defineProperty(newFn, 'length', {
    value: fn.length,
    writable: false,
  });
  return copyFnProps(fn, newFn);
}

/**
 * When an exception is thrown in an async operation/method,
 * the express app crashes and the servers exits.
 * Instead of patching all methods on an express Router to handle the exception and prevent the crash,
 * it wraps the Layer#handle property in one place, leaving all the rest of the express guts intact.
 *
 * The idea is that you require the patch once and then use the 'express' lib the usual way in the rest of your application.
 *
 * See https://www.npmjs.com/package/express-async-errors
 */
function patchRouterParam(): void {
  const originalParam = Router.prototype.constructor.param;
  Router.prototype.constructor.param = function param(
    name: string,
    fn: FunctionWithProps,
  ): any {
    fn = wrap(fn) as FunctionWithProps;
    return originalParam.call(this, name, fn);
  };
}

Object.defineProperty(Layer.prototype, 'handle', {
  enumerable: true,
  get() {
    return this.__handle;
  },
  set(fn) {
    fn = wrap(fn);
    this.__handle = fn;
  },
});

export const CreateExpressServer = (): Express => {
  // Patch
  patchRouterParam();

  // Init express
  const app = express();

  // Set basic express settings
  app.use(
    cors({
      origin: true, // ['http://localhost'],
      optionsSuccessStatus: 200,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser(Config.COOKIE_SECRET));
  // app.use(health.ping('/health')); TODO: add over authentication layer

  // Show routes called in console during development
  if (process.env.NODE_ENV === 'development') {
    app.use(
      morgan(':method :status :url :res[content-length] - :response-time ms', {
        stream: {
          // Configure Morgan to use our custom logger with the http severity.
          // FIXME: using the http severity prepends 'undefined' to the message
          write: (message) => logger.info(message.trim()),
        },
      }),
    );
  }

  // Security
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
    // Retrieve a request's IP address using the `constants.CLIENT_IP_ADDRESS_ATTRIBUTE`
    app.use(requestIp.mw({ attributeName: Constants.REQUEST_ATTRIBUTES.IP_ADDRESS }));
  }

  //  TODO: Add favicon.

  return app;
};
