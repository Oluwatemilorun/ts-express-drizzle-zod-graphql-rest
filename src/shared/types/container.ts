import { AwilixContainer } from 'awilix';

export enum ContainerStore {
  DB_ENTITIES = 'DB_ENTITIES',
  RESOLVERS = 'RESOLVERS',
}

export type AppContainer = AwilixContainer & {
  registerStore: <T>(name: ContainerStore, registration: T) => AppContainer;
  createScope: () => AppContainer;
};

export type Loader<T, O = object> = (
  opt: { container: AppContainer } & O,
) => T | Promise<T>;
