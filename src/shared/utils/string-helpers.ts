import { Suffixed } from '@shared/types';

/**
 * Creates another string where the initial letters of the words are
 * capitalized.
 *
 * @export
 * @param {string} value The input string.
 * @return {string} A string which is title-cased.
 */
export function toTitleCase(value: string): string {
  return value.replace(/\b(\p{Alpha})(.*?)\b/u, (_string, match, rest) => {
    return match.toUpperCase() + rest;
  });
}

/**
 * Returns a function which will take a string and return another string
 * with the given suffix, if the suffix was already there then this function
 * will simply return the string value.
 *
 * @param {S} suffix The suffix string.
 * @return {(input: string) => string} The suffixed string.
 */
export function withSuffix<S extends string>(suffix: S) {
  /**
   * Returns a string with previously entered suffix is applied.
   * @param {I} input The input string.
   * @return {Suffixed<S, I>} The suffixed string.
   */
  return function _withSuffix<I extends string>(input: I): Suffixed<S, I> {
    if (input.endsWith(suffix)) {
      return input as Suffixed<S, I>;
    }

    return (input + suffix) as Suffixed<S, I>;
  };
}

/**
 * Converts string into camelCase.
 *
 * @see http://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
 */
export function toCamelCase(str: string, firstCapital = false): string {
  if (firstCapital) str = ' ' + str;
  return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
}
