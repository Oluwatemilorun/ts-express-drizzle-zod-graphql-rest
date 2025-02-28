import commandLineArgs from 'command-line-args';

import { CommandOptionDefinition } from '@shared/types';

function createCliCommand<T extends Record<string, unknown>>({
  args,
  run,
}: {
  args: CommandOptionDefinition[];
  run: (args: T) => void;
}): (agrv?: string[]) => void {
  return function (argv?: string[]) {
    const parsedArgs = commandLineArgs(args, {
      argv,
      partial: true,
      caseInsensitive: true,
      camelCase: true,
    });
    const { _unknown, ...commandOptions } = parsedArgs;

    run(commandOptions as unknown as T);
  };
}

export const helloWorld = createCliCommand({
  args: [
    { name: 'version', alias: 'v', type: Boolean },
    { name: 'uppercase', alias: 'u', type: Boolean, defaultValue: false },
  ],
  run: (opts: { version: boolean; uppercase: boolean }) => {
    const message = opts.uppercase ? 'HELLO WORLD' : 'hello world';
    // eslint-disable-next-line no-console
    console.log(message);
  },
});
