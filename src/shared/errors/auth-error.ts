import { ApplicationError } from './application-error';

export class AuthenticationError extends ApplicationError {
  constructor(message: string) {
    super({ message, code: 'AUTHENTICATION_ERROR' });
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message: string) {
    super({ message, code: 'PERMISSION_DENIED' });
  }
}
