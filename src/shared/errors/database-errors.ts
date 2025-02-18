import { ERROR_CODES } from '@shared/constants';

import { ApplicationError } from './application-error';

export enum PostgresError {
  DUPLICATE_ERROR = '23505',
  FOREIGN_KEY_ERROR = '23503',
  SERIALIZATION_FAILURE = '40001',
  NULL_VIOLATION = '23502',
  INVALID_UUID = '22P02',
}

export class DatabaseError extends ApplicationError {
  constructor(err: unknown) {
    const props = DatabaseError._formatException(err);
    super(props);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected static _formatException(err: any): {
    message: string;
    code: keyof typeof ERROR_CODES;
    attachHeaders?: Record<string, string>;
  } {
    switch (err.code) {
      case PostgresError.DUPLICATE_ERROR:
        const dupliErrMatch = /Key \(([\w]+)\)=\(([\s\S]+)\) already exists\./g.exec(
          err.detail,
        );
        const dupliKey = dupliErrMatch?.[1].replace(/\_/g, ' ');
        const dupliVal = dupliErrMatch?.[2];

        return {
          message: `${dupliKey} with value "${dupliVal}" already exist.`,
          code: 'BAD_USER_INPUT',
        };

      case PostgresError.FOREIGN_KEY_ERROR:
        let message: string;
        const matches =
          /Key \(([\w-\d]+)\)=\(([\w-\d]+)\) is not present in table "(\w+)"/g.exec(
            err.detail,
          );

        if (matches?.length !== 4) {
          message = JSON.stringify(matches);
        }

        message = `${matches?.[3]?.charAt?.(0).toUpperCase()}${matches?.[3]?.slice(1)} with ${
          matches?.[1]
        } ${matches?.[2]} does not exist.`;

        return {
          message,
          code: 'NOT_FOUND',
        };

      case PostgresError.INVALID_UUID:
        return {
          message: 'Invalid ID passed. ID must be a UUID',
          code: 'BAD_USER_INPUT',
        };

      case PostgresError.NULL_VIOLATION:
        return {
          message: `${err?.column} cannot be null`,
          code: 'BAD_USER_INPUT',
        };

      default:
        // TODO: log error

        return {
          message: err.message,
          code: 'SERVICE_UNAVAILABLE',
        };
    }
  }
}
