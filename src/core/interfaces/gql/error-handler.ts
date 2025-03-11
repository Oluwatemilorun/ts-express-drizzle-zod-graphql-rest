import { GraphQLErrorExtensions } from 'graphql';

import { ApplicationError, BadRequestError } from '@shared/errors';

export function handleError(error: unknown): [string, GraphQLErrorExtensions] {
  const stacktrace = (error as Error).stack?.split('\n');

  if (error instanceof BadRequestError) {
    return [
      error.message,
      {
        code: error.code,
        errors: error.errors,
        stack: stacktrace,
      },
    ];
  } else if (error instanceof ApplicationError) {
    return [
      error.message,
      {
        code: error.code,
        http: { status: error.statusCode, headers: error.attachHeaders },
        stack: stacktrace,
      },
    ];
  } else {
    return [
      'Internal Server Error',
      {
        code: 'INTERNAL_SERVER_ERROR',
        http: { status: 500 },
        stack: stacktrace,
      },
    ];
  }
}
