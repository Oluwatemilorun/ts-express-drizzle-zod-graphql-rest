import { AppContainer } from './container';

export interface ApolloContext<User = object> {
  remoteAddress: string;
  scope: AppContainer;
  // sentryScope: SentryScope;
  token?: string;
  user?: User;
  admin?: User;
}
