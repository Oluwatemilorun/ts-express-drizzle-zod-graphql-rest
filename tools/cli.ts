import commandLineArgs from 'command-line-args';
import path from 'path';

import logger from '@shared/logger';
import { toCamelCase } from '@shared/utils';

((): void => {
  // eslint-disable-next-line  @typescript-eslint/no-require-imports
  const loadedCommands = require(path.join(__dirname, '../src/cli')) as Record<
    string,
    (agr?: string[]) => void
  >;
  const commandsList = Object.keys(loadedCommands);

  const main = commandLineArgs([{ name: 'command', type: String, defaultOption: true }], {
    stopAtFirstUnknown: true,
    camelCase: true,
    caseInsensitive: true,
  });

  if (!main.command) {
    logger.error('No command provided');
    process.exit(1);
  }

  const commandName = toCamelCase(main.command);

  if (commandsList.includes(commandName)) {
    const command = loadedCommands[commandName];

    command(main._unknown);
  } else {
    logger.error(`Unknown command ${main.command}`);
  }
})();
