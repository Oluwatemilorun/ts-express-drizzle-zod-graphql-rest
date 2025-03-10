import commandLineArgs from 'command-line-args';
import dotenv from 'dotenv';

// Setup command line options
const options = commandLineArgs(
  [
    {
      name: 'env',
      alias: 'e',
      defaultValue: 'production',
      type: String,
    },
  ],
  { partial: true },
);

// Set the env file
if (options.env === 'production') {
  dotenv.config();
} else {
  const result2 = dotenv.config({
    path: `./env/${options.env}.env`,
  });

  if (result2.error) {
    throw result2.error;
  }
}
