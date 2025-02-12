export const EmailConfig = {
  /** SMTP email hostname */
  EMAIL_HOSTNAME: process.env.EMAIL_HOSTNAME || '',
  /** Base64 stringified email account */
  EMAIL_ACCOUNTS: process.env.EMAIL_ACCOUNTS || '',
};
