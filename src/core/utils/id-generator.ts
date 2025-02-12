import { ulid } from 'ulid';

/**
 * Simple random ID
 */
export const generateSRID = (): string => {
  function s4(): string {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return `${s4()}-${s4()}-${s4()}`;
};

/**
 * Generate a composed id based on the input parameters and return either the id if it exists or the generated one.
 * @param idProperty
 * @param prefix
 */
export function generateEntityId(idProperty?: string, prefix?: string): string {
  if (idProperty) {
    return idProperty;
  }

  const id = ulid();
  prefix = prefix ? `${prefix}_` : '';
  return `${prefix}${id}`;
}
