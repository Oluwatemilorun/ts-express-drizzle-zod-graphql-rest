import { Config } from '@core/config';
import { CreateExpressServer } from '@core/servers';
import logger from '@shared/logger';
import { GracefulShutdownServer } from '@shared/utils';

import loaders from './loaders';

process.on('unhandledRejection', function (reason, p) {
  logger.warn('Possibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});

export const StartApp = async (): Promise<void> => {
  async function start(): Promise<void> {
    const app = CreateExpressServer();

    try {
      const { container } = await loaders();
      const port = Number(Config.PORT);

      const server = GracefulShutdownServer.create(
        app.listen(port, () => {
          logger.info(`🚀 ${Config.APP_NAME}@${Config.APP_VERSION} Server Started!`);
        }),
      );

      // Handle graceful shutdown of database and server
      const gracefulShutDown = (): void => {
        Promise.all([container.dispose(), server.shutdown()])
          .then(() => {
            logger.info('Gracefully stopping the server.');
            process.exit(0);
          })
          .catch((e) => {
            logger.error('Error received when shutting down the server.', e);
            process.exit(1);
          });
      };

      process.on('SIGTERM', gracefulShutDown);
      process.on('SIGINT', gracefulShutDown);
    } catch (err) {
      logger.error('Error starting server', err);
      process.exit(1);
    }
  }

  await start();
};
