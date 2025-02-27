import { appConfig } from './app-config';
import { errorCodes } from './error-codes';
import { otpConfig } from './otp-config';
import { rateLimitConfig } from './rate-limit-config';
import { requestBodyAttributes } from './request-body-attributes';

/** The request body attributes */
export const REQUEST_ATTRIBUTES = requestBodyAttributes;

/** The error codes to use with custom Graphql error handler */
export const ERROR_CODES = errorCodes;

/** The configurations of the OTPs */
export const OTP_CONFIG = otpConfig;

/** The configurations for setting up rate limiting */
export const RATE_LIMIT_CONFIG = rateLimitConfig;

export const APP_CONFIG = appConfig;

const Constants = {
  REQUEST_ATTRIBUTES,
  ERROR_CODES,
  OTP_CONFIG,
  RATE_LIMIT_CONFIG,
  APP_CONFIG,
} as const;

export default Constants;
