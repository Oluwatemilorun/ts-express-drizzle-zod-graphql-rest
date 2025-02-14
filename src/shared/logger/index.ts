import winston from 'winston';

import * as stackTrace from '@shared/utils';
import { getOsInfo, getProcessInfo } from '@shared/utils';

const { combine, timestamp, colorize, json, errors, cli, splat, align } = winston.format;
const { File, Console } = winston.transports;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug', // minimum
});

/**
 * Extracted utility wrapper to make the logger object.
 * See https://github.com/winstonjs/winston/issues/2531#issuecomment-2660346993
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getAllInfo(err: Error) {
  return {
    error: err,
    message: [
      `${err.message || '(no error message)'}`,
      (err && err.stack) || '  No stack trace',
    ].join('\n'),
    stack: err && err.stack,
    // exception: true,
    // date: new Date().toString(),
    process: getProcessInfo(),
    os: getOsInfo(),
    trace: getTrace(err),
  };
}

/**
 * Gets a stack trace for the specified error.
 */
function getTrace(err: Error): {
  column: number;
  file: string;
  function: string;
  line: number;
  method: string;
  native: boolean;
}[] {
  const trace = err ? stackTrace.parse(err) : stackTrace.get();
  return trace.map((site) => {
    return {
      column: site.getColumnNumber(),
      file: site.getFileName(),
      function: site.getFunctionName(),
      line: site.getLineNumber(),
      method: site.getMethodName(),
      native: site.isNative(),
    };
  });
}

/**
 * For production write to all logs with level `debug` and below
 * to `combined.log. Write all logs error (and below) to `error.log`.
 * For development, print to the console.
 */
if (process.env.NODE_ENV === 'production') {
  const fileFormat = combine(
    errors({ stack: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    json(),
  );

  const errTransport = new File({
    filename: process.cwd() + './logs/error.log',
    format: fileFormat,
    level: 'error',
  });
  const infoTransport = new File({
    filename: process.cwd() + './logs/combined.log',
    format: fileFormat,
  });

  logger.add(errTransport);
  logger.add(infoTransport);
} else {
  // const errorStackFormat = winston.format((info) => {
  //   if (info.stack) {
  //     // eslint-disable-next-line no-console
  //     console.log(info.stack);
  //     return false;
  //   }
  //   return info;
  // });

  const consoleTransport = new Console({
    format: combine(colorize(), cli(), splat(), align()),
  });

  logger.add(consoleTransport);
}

export default {
  ...logger,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  info: (message: string) => logger.log({ level: 'info', message }),
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  error: (error: string | Error) =>
    error instanceof Error
      ? logger.log({ ...getAllInfo(error), level: 'error' })
      : logger.log({ level: 'error', message: error }),
};
