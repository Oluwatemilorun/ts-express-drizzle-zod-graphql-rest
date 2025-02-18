import { ApplicationError } from './application-error';

export class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super({ message, code: 'NOT_FOUND' });
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string) {
    super({ message, code: 'FORBIDDEN' });
  }
}

export class MaxQueryReached extends ApplicationError {
  constructor(
    message: string,
    limiterRes?: {
      remainingPoints: number;
      msBeforeNext: number;
      consumedPoints: number;
      isFirstInDuration: boolean;
    },
  ) {
    super({
      message,
      code: 'MAX_QUERY_COMPLEXITY_EXCEEDED',
      attachHeaders: limiterRes
        ? { 'Retry-After': String(limiterRes.msBeforeNext / 1000) }
        : undefined,
    });
  }
}
