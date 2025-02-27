import { AwilixContainer } from 'awilix';

export enum ContainerStore {
  DB_ENTITIES = 'DB_ENTITIES',
  RESOLVERS = 'RESOLVERS',
  GQL_ENTITY_TYPES = 'GQL_ENTITY_TYPES',
  INPUTS = 'INPUTS',
}

export type AppContainer = AwilixContainer & {
  registerStore: <T>(name: ContainerStore, registration: T) => AppContainer;
  createScope: () => AppContainer;
};

export type Loader<T, O = object> = (
  opt: { container: AppContainer } & O,
) => T | Promise<T>;
