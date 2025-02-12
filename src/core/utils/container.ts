import {
  asFunction,
  asValue,
  AwilixContainer,
  ClassOrFunctionReturning,
  createContainer,
  Resolver,
} from 'awilix';
import { parse } from 'path';

import { AppContainer, ContainerStore } from '@shared/types';

/**
 * Formats a filename into the correct container resolution name.
 * Names are camelCase formatted and namespaced by the folder i.e:
 * models/example-person -> examplePersonModel
 * @param path - the full path of the file
 * @return the formatted name
 */
export function formatRegistrationName(path: string): string {
  const parsed = parse(path);
  const parsedDir = parse(parsed.dir);

  let rawname = parsed.name;
  let namespace = parsedDir.name;
  if (namespace.startsWith('__')) {
    const parsedCoreDir = parse(parsedDir.dir);
    namespace = parsedCoreDir.name;
  }

  switch (namespace) {
    // We strip the last character when adding the type of registration
    // this is a trick for plural "ies"
    case 'repositories':
      namespace = 'repositorys';
      break;
    case 'strategies':
      namespace = 'strategys';
      break;
    default:
      break;
  }

  const upperNamespace = namespace.charAt(0).toUpperCase() + namespace.slice(1, -1);

  rawname = rawname.replace(`.${upperNamespace.toLowerCase()}`, '');

  const parts = rawname.split('-').map((n, index) => {
    if (index !== 0) {
      return n.charAt(0).toUpperCase() + n.slice(1);
    }
    return n;
  });

  return parts.join('') + upperNamespace;
}

function asArray(resolvers: (ClassOrFunctionReturning<unknown> | Resolver<unknown>)[]): {
  resolve: (container: AwilixContainer) => unknown[];
} {
  return {
    resolve: (container: AwilixContainer) =>
      resolvers.map((resolver) => container.build(resolver)),
  };
}

function registerStore(
  this: AppContainer,
  name: ContainerStore,
  registration: typeof asFunction | typeof asValue,
): AppContainer {
  const storeKey = name + '_STORE';

  if (this.registrations[storeKey] === undefined) {
    this.register(storeKey, asValue([] as Resolver<unknown>[]));
  }
  const store = this.resolve(storeKey) as (
    | ClassOrFunctionReturning<unknown>
    | Resolver<unknown>
  )[];

  if (this.registrations[name] === undefined) {
    this.register(name, asArray(store));
  }
  store.unshift(registration);

  return this;
}

export function createAppContainer(...args: []): AppContainer {
  const container = createContainer(...args) as AppContainer;

  (container.registerStore as unknown) = registerStore.bind(container);

  const originalScope = container.createScope;
  container.createScope = (): AppContainer => {
    const scoped = originalScope() as AppContainer;
    (scoped.registerStore as unknown) = registerStore.bind(scoped);

    return scoped;
  };

  return container;
}
