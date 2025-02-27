import { is, Relation } from 'drizzle-orm';
import { PgEnum, PgTable } from 'drizzle-orm/pg-core';
import { createSchemaFactory } from 'drizzle-zod';

/**
 * Gets the declared graphql type from the table schema.
 *
 * @example
 * import { UserSession } from '../models';
 *
 * const graphqlTypeName = getGqlTypeNameFromSchema({ UserSession });
 * @param schema drizzle database table schema.
 * You pass the schema in a mustache format like `{ SchemaName }`.
 * This makes it easy to maintain the same key variable name without passing a new parameter.
 * @param useSelect if to use the select type or the base type. Defaults to `true`
 * @returns the graphql schema type name
 */
export const getGqlTypeNameFromSchema = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Record<string, PgTable | Relation | PgEnum<any>>,
  useSelect = true,
): string => {
  const schemaName = Object.keys(schema)[0];
  const entity = Object.values(schema)[0];

  if (is(entity, PgTable)) {
    // Drizzle GraphQL generates two types of object types per table entity.
    // - <entity>Item - containing just the fields declared in the table.
    // - <entity>SelectItem - containing the fields plus relations of the table.
    return schemaName + (useSelect ? 'Select' : '') + 'Item';
  } else if (is(entity, Relation)) {
    return schemaName + 'Relation';
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((entity as PgEnum<any>).enumValues) {
      return schemaName + 'Enum';
    }
    // TODO: check for use case around enums
    throw new Error('Cannot get type name of unknown schema type');
  }
};

/**
 * Gets the graphql enum type from the drizzle enum schema.
 *
 * @param container the application DI container
 * @param schema the drizzle database enum schema.
 * You pass the schema in a mustache format like `{ SchemaName }`.
 * This makes it easy to maintain the same key variable name without passing a new parameter.
 * @returns the graphql enum type
 */
export const getGqlEnumTypeFromSchema = (
  entities: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Record<string, PgEnum<any>>,
): unknown => {
  const schemaName = Object.keys(schema)[0];
  const typeName = schemaName + 'Enum';
  return entities[typeName];
};

const schemaFactory = createSchemaFactory({
  coerce: {
    date: true,
  },
});

/**
 * Used to create a **create** input schema model from a database table schema with zod validation capabilities.
 *
 * @example
 * export const CreateUserInput = createInsertInputFromSchema(User, {
 *   name: (z) => z.max(20),
 *   email: (z) => z.email().required(),
 * }).pick({
 *   email: true,
 *   name: true,
 *   password: true,
 *   phone: true,
 * })
 */
export const createInsertInputFromSchema = schemaFactory.createInsertSchema;

/**
 * Used to create an **update** input schema model from a database table schema with zod validation capabilities.
 *
 * @example
 * export const CreateUserInput = createUpdateInputFromSchema(User, {
 *   name: (z) => z.max(20),
 *   email: (z) => z.email().required(),
 * }).pick({
 *   email: true,
 *   name: true,
 *   password: true,
 *   phone: true,
 * })
 */
export const createUpdateInputFromSchema = schemaFactory.createUpdateSchema;
