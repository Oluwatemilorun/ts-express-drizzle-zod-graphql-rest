import winston from 'winston';

const { combine, timestamp, colorize, json, errors, cli } = winston.format;
const { File, Console } = winston.transports;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug', // minimum
});

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
    format: combine(colorize(), errors({ stack: true }), cli()),
  });

  logger.add(consoleTransport);
}

export default logger;
