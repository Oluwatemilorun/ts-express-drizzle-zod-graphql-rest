import { AppContainer } from './container';

export interface AppContext<User = object> {
  remoteAddress: string;
  scope: AppContainer;
  // sentryScope: SentryScope;
  token?: string;
  user?: User;
  admin?: User;
}

export type ApolloContext<ContextUser = object> = AppContext<ContextUser>;
