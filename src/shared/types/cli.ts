/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CommandOptionDefinition {
  /**
   * The long option name.
   */
  name: string;

  /**
   * A setter function (you receive the output from this) enabling you to be specific about the type and value received. Typical values
   * are `String` (the default), `Number` and `Boolean` but you can use a custom function. If no option value was set you will receive `null`.
   */
  type?: ((input: string) => any) | undefined;

  /**
   * A get opt-style short option name. Can be any single character except a digit or hyphen.
   */
  alias?: string | undefined;

  /**
   * Set this flag if the option accepts multiple values. In the output, you will receive an array of values each passed through the `type` function.
   */
  multiple?: boolean | undefined;

  /**
   * Identical to `multiple` but with greedy parsing disabled.
   */
  lazyMultiple?: boolean | undefined;

  /**
   * Any values unaccounted for by an option definition will be set on the `defaultOption`. This flag is typically set
   * on the most commonly-used option to enable more concise usage.
   */
  defaultOption?: boolean | undefined;

  /**
   * An initial value for the option.
   */
  defaultValue?: any;

  /**
   * One or more group names the option belongs to.
   */
  group?: string | string[] | undefined;
}
