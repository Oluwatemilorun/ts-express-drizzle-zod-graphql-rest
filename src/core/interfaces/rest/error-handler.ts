import { Response } from 'express';

import { ApplicationError, BadRequestError } from '@shared/errors';

import { ErrorObject, ResponseWrapper } from './types';

export function handleError(error: unknown): ErrorObject {
  if (error instanceof BadRequestError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      errors: error.errors,
    };
  } else if (error instanceof ApplicationError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      errors: {
        applicationError: error.stack,
      },
      attachHeaders: error.attachHeaders,
    };
  } else {
    return {
      message: 'Internal Server Error',
      statusCode: 500,
      errors: {
        serverError: (error as Error).stack,
      },
    };
  }
}

export function sendError(res: Response, error: unknown): void {
  const { errors, message, statusCode, attachHeaders } = handleError(error);

  if (attachHeaders) {
    res.setHeaders(new Headers(attachHeaders));
  }

  res.status(statusCode).send({
    data: null,
    errors,
    message,
    status: false,
  } as ResponseWrapper<null, typeof errors>);
}
