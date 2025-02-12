import { asFunction } from 'awilix';
import glob from 'glob';
import path from 'path';

import { formatRegistrationName } from '@core/utils';
import { Loader } from '@shared/types';

/**
 * Registers all repositories in the repositories directory
 */
export default <Loader<void>>function ({ container }) {
  const repositoriesPath = path.join(__dirname, '../../modules/**/*.repository.{ts,js}');

  const foundRepositories = glob.sync(repositoriesPath, { cwd: __dirname });
  foundRepositories.forEach((fn) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const loaded = require(fn).default;

    if (loaded) {
      const name = formatRegistrationName(fn);
      const repository = asFunction((cradle) => new loaded(cradle));
      container.register({
        [name]: repository.scoped(),
      });
    }
  });
};
