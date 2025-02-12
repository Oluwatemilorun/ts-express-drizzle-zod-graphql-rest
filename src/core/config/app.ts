export const AppConfig = {
  APP_ENV: process.env.APP_ENV || 'staging',
  APP_VERSION: process.env.npm_package_version || '0.0.0',
  APP_TEST_ACCOUNTS: process.env.APP_TEST_ACCOUNTS || '{}',
  APP_FORGOT_PASSWORD_URL: process.env.APP_FORGOT_PASSWORD_URL || '',
};
