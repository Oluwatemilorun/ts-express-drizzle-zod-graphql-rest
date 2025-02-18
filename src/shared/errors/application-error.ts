import { ERROR_CODES } from '@shared/constants';

export class ApplicationError extends Error {
  code: keyof typeof ERROR_CODES;
  attachHeaders?: Record<string, string>;

  constructor(error: {
    message: string;
    code: keyof typeof ERROR_CODES;
    attachHeaders?: Record<string, string>;
  }) {
    super(error.message);

    this.name = 'ApplicationError';
    this.code = error.code;
    this.attachHeaders = error.attachHeaders;
  }

  get statusCode(): number {
    switch (this.code) {
      case 'BAD_REQUEST':
      case 'BAD_USER_INPUT':
        return 400;
      case 'AUTHENTICATION_ERROR':
        return 401;
      case 'PERMISSION_DENIED':
      case 'FORBIDDEN':
        return 403;
      case 'NOT_FOUND':
        return 404;
      case 'MAX_QUERY_COMPLEXITY_EXCEEDED':
        return 429;
      case 'SERVICE_UNAVAILABLE':
        return 503;
      case 'INTERNAL_SERVER_ERROR':
      default:
        return 500;
    }
  }
}
