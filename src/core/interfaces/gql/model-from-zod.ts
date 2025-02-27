// This module was extracted from the nestjs-graphql-zod package (https://github.com/incetarik/nestjs-graphql-zod/tree/master)
// with the nestjs part and decorators and their metadata description stripped out.
// Some parts have been changed to suit the use case of just converting zod schemas and types into the appropriate GraphQL types

import {
  GraphQLEnumType,
  GraphQLEnumValueConfig,
  GraphQLFieldConfigArgumentMap,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLScalarType,
  GraphQLType,
} from 'graphql';
import { ObjMap } from 'graphql/jsutils/ObjMap';
import {
  AnyZodObject,
  ZodAny,
  ZodArray,
  ZodBigInt,
  ZodBoolean,
  ZodCatch,
  ZodDate,
  ZodDefault,
  ZodEffects,
  ZodEnum,
  ZodLazy,
  ZodLiteral,
  ZodNativeEnum,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodNumberCheck,
  ZodObject,
  ZodOptional,
  ZodPromise,
  ZodRecord,
  ZodSet,
  ZodString,
  ZodTransformer,
  ZodType,
  ZodTypeAny,
  ZodUnion,
} from 'zod';

import { ClassConstructor } from '@shared/types';
import { toTitleCase, withSuffix } from '@shared/utils';

import { getGqlScalarType, isDefinedGqlScalarType } from './scalar-types';

/**
 * The type provider function.
 *
 * The type name will be calculated and it will be similar to `TypeScript`
 * types such as: `Record<Optional<String>, Array<Number | String>>`.
 *
 * The user will provide custom scalar type to use for that kind of
 * zod validation.
 */
export type TypeProvider = (typeName: string) => GraphQLScalarType | undefined;

export type NullableList = 'itemsAndList' | 'items';

export type ModelType = 'input' | 'output';

export type ModelConfig<M extends ModelType> = {
  name: string;
  description?: string;
  fields: ObjMap<Field<M>>;
};

/**
 * The enum provider data.
 */
export interface EnumProviderData {
  /**
   * The property name of the enum.
   */
  name: string;

  /**
   * The parent name that contains the enum type.
   */
  parentName?: string;

  /**
   * The description of the enum.
   */
  description?: string;

  /**
   * Indicates that if the enum was a native enum.
   */
  isNative?: boolean;
}

/**
 * Gets an enum type for given information.
 *
 * Use this function to prevent creating different enums in GraphQL schema
 * if you are going to use same values in different places.
 *
 * @param {(Record<string, string | number>)} enumObject The enum object
 * that is extracted from the zod.
 *
 * @param {EnumProviderData} info The information of the enum property.
 *
 * @return {(Record<string, string | number> | undefined)} The enum
 * that will be used instead of creating a new one. If `undefined` is
 * returned, then a new enum will be created.
 */
export type EnumProvider = (
  enumObject: object,
  info: EnumProviderData,
) => GraphQLEnumType | undefined;

export interface IModelFromZodOptions {
  /**
   * If the model is an input object.
   */
  modelType: ModelType;

  /**
   * Description of the model field.
   */
  description?: string;

  /**
   * If `true`, type will not be registered in the schema.
   */
  isAbstract?: boolean;

  /**
   * Interfaces implemented by this object type.
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  implements?: Function | Function[] | (() => Function | Function[]);

  /**
   * If `true`, direct descendant classes will inherit the parent's description if own description is not set.
   * Also works on classes marked with `isAbstract: true`.
   */
  inheritDescription?: boolean;

  /**
   * The name of the model class in GraphQL schema.
   */
  name?: string;

  /**
   * Gets an enum type for given information.
   *
   * Use this function to prevent creating different enums in GraphQL schema
   * if you are going to use same values in different places.
   *
   * @param {string | undefined} name The parent name that contains the enum
   * type.
   * @param {string} key The property name of the enum.
   * @param {(Record<string, string | number>)} enumObject The enum object
   * that is extracted from the zod.
   * @return {(Record<string, string | number> | undefined)} The enum
   * that will be used instead of creating a new one. If `undefined` is
   * returned, then a new enum will be created.
   *
   * @memberof IModelFromZodOptions
   */
  getEnumType?: EnumProvider;
}

/**
 * Unwraps any given zod type by one level.
 *
 * The supported zod wrappers are:
 * - {@link ZodArray}
 * - {@link ZodCatch}
 * - {@link ZodDefault}
 * - {@link ZodEffects}
 * - {@link ZodLazy}
 * - {@link ZodNullable}
 * - {@link ZodOptional}
 * - {@link ZodPromise}
 * - {@link ZodSet}
 * - {@link ZodTransformer}
 */
type UnwrapNestedZod<T extends ZodType> =
  T extends ZodArray<infer I>
    ? I
    : T extends ZodOptional<infer I>
      ? I
      : T extends ZodTransformer<infer I>
        ? I
        : T extends ZodDefault<infer I>
          ? I
          : T extends ZodEffects<infer I>
            ? I
            : T extends ZodNullable<infer I>
              ? I
              : T extends ZodCatch<infer I>
                ? I
                : T extends ZodPromise<infer I>
                  ? I
                  : T extends ZodSet<infer I>
                    ? I
                    : T extends ZodLazy<infer I>
                      ? I
                      : T;

/**
 * An interface describing a parsed field.
 */
export interface ParsedField {
  /**
   * The key of the parsed property.
   */
  key: string;

  /**
   * The type of the field of the parsed property.
   */
  fieldType: GraphQLType;

  /**
   * The description of the field
   */
  description?: string;

  /**
   * The set default value of the field
   */
  defaultValue?: unknown;

  /**
   * If this field is nullable
   */
  nullable: boolean | NullableList;
}

export interface Field<T extends ModelType> {
  name?: string;
  type: FieldType<T>;
  description?: string;
  deprecationReason?: string;
  defaultValue?: unknown;
  args?: GraphQLFieldConfigArgumentMap; // TODO: handle field arguments
}

export type FieldType<T extends ModelType> = T extends 'input'
  ? GraphQLInputType
  : GraphQLOutputType;

/**
 * Describes the properties of a zod type that can be used
 * to build a {@link GraphQLObjectType} or {@link GraphQLInputType}
 *
 * @export
 * @interface ZodTypeInfo
 */
export interface ZodTypeInfo {
  /**
   * The corresponding GraphQL type of the `zod` property.
   */
  type: GraphQLType;

  /**
   * Indicates whether or not the property is optional.
   */
  isOptional: boolean;

  /**
   * Indicates whether or not the property is nullable.
   */
  isNullable: boolean;

  /**
   * Indicates whether or not the property is an enum type.
   */
  isEnum?: boolean;

  /**
   * Indicates whether or not the property is an object (another type).
   */
  isType?: boolean;

  /**
   * Indicates whether or not the property is an array.
   */
  isOfArray?: boolean;

  /**
   * Indicates whether or not the item of the array of the property is
   * optional.
   */
  isItemOptional?: boolean;

  /**
   * Indicates whether or not the item of the array of the property is
   * nullable.
   */
  isItemNullable?: boolean;
}

// A global variable tracking the registered classes count.
// This is used for providing unique class names.
let registerCount = 0;

export function modelFromZod<
  T extends AnyZodObject,
  O extends IModelFromZodOptions,
  M extends O['modelType'],
>(zodInput: T, options: O = {} as O): ModelConfig<M> {
  const { name, description } = extractNameAndDescription(zodInput, options);

  const parsed = parseFields(zodInput, {
    ...options,
    name,
    description,
    // getDecorator: options.getDecorator as any,
  });

  return {
    name,
    description: options.description,
    fields: parsed.reduce(
      (fields, fieldConfig) => {
        fields[fieldConfig.key] = buildField(options.modelType, fieldConfig);

        return fields;
      },
      {} as ObjMap<Field<typeof options.modelType>>,
    ),
  };
}

/**
 * Checks whether the given `input` is instance of given `type`.
 *
 * @param {T} type The class type.
 * @param {Object} input The object input.
 * @return {input is InstanceType<T>} A boolean value indicating if the
 * input is instance of given class.
 */
export function isZodInstance<T extends ClassConstructor<ZodTypeAny>>(
  type: T,
  input: object,
): input is InstanceType<T> {
  return type.name === input.constructor.name;
}

/**
 * Unwraps the zod object one level.
 *
 * The supported zod wrappers are:
 * - {@link ZodArray}
 * - {@link ZodCatch}
 * - {@link ZodDefault}
 * - {@link ZodEffects}
 * - {@link ZodLazy}
 * - {@link ZodNullable}
 * - {@link ZodOptional}
 * - {@link ZodPromise}
 * - {@link ZodSet}
 * - {@link ZodTransformer}
 *
 * @param {T} input The zod input.
 * @return {UnwrapNestedZod<T>} The unwrapped zod instance.
 *
 * @__PURE__
 */
function unwrapNestedZod<T extends ZodType>(input: T): UnwrapNestedZod<T> {
  if (isZodInstance(ZodArray, input)) return input.element as UnwrapNestedZod<T>;
  if (isZodInstance(ZodCatch, input)) return input._def.innerType as UnwrapNestedZod<T>;
  if (isZodInstance(ZodDefault, input)) return input._def.innerType as UnwrapNestedZod<T>;
  if (isZodInstance(ZodEffects, input)) return input.innerType() as UnwrapNestedZod<T>;
  if (isZodInstance(ZodLazy, input)) return input.schema as UnwrapNestedZod<T>;
  if (isZodInstance(ZodNullable, input)) return input.unwrap() as UnwrapNestedZod<T>;
  if (isZodInstance(ZodOptional, input)) return input.unwrap() as UnwrapNestedZod<T>;
  if (isZodInstance(ZodPromise, input)) return input.unwrap() as UnwrapNestedZod<T>;
  if (isZodInstance(ZodSet, input)) return input._def.valueType as UnwrapNestedZod<T>;
  if (isZodInstance(ZodTransformer, input))
    return input.innerType() as UnwrapNestedZod<T>;
  return input as UnwrapNestedZod<T>;
}

/**
 * Iterates the zod layers by unwrapping the values of the following types:
 *
 * - {@link ZodArray}
 * - {@link ZodCatch}
 * - {@link ZodDefault}
 * - {@link ZodEffects}
 * - {@link ZodLazy}
 * - {@link ZodNullable}
 * - {@link ZodOptional}
 * - {@link ZodPromise}
 * - {@link ZodSet}
 * - {@link ZodTransformer}
 *
 * @param {T} input The zod input.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function* iterateZodLayers<T extends ZodType>(input: T) {
  let current = input as ZodType;
  let unwrapped = unwrapNestedZod(input) as ZodType;

  while (unwrapped !== current) {
    yield current;
    current = unwrapped;
    unwrapped = unwrapNestedZod(current) as ZodType;
  }

  yield current;
}

/**
 * Extracts the description from a given type.
 *
 * The given input may also be wrapped more than one time with the ones listed
 * above. Therefore, assuming there is a value which
 * is `Nullable<Array<Number>>` and there is no description associated to the
 * nullable and the array wrappers, the description will still tried to be
 * extracted from the number instance.
 *
 * @template T The type of the zod object.
 * @param {T} [input] The zod object input.
 * @return {(string | undefined)} The description of the input or `undefined.`
 */
function getDescription<T extends ZodType>(input?: T): string | undefined {
  if (!input) return;

  if (input.description) return input.description;

  for (const layer of iterateZodLayers(input)) {
    if (layer.description) return layer.description;
  }
}

/**
 * Extracts the name and description from a zod object input.
 *
 * @param {T} zodInput The zod object input.
 * @param {IModelFromZodOptions} options The options for the operation.
 * @return {{ name: string, description: string }} An object containing
 * normalized name and description info.
 */
function extractNameAndDescription<T extends ZodType>(
  zodInput: T,
  options: IModelFromZodOptions,
): {
  name: string;
  description: string | undefined;
} {
  let { name } = options;
  let description = getDescription(zodInput);

  if (!name) {
    if (description) {
      const match = description.match(/(\w+):\s*?(.*)+/);
      if (match) {
        const [_full, className, actualDescription] = match;

        name = className;
        description = actualDescription.trim();

        return { name, description };
      }
    }

    name = `ClassFromZod_${++registerCount}`;
  }

  return { name, description };
}

function buildField<T extends ModelType>(modelType: T, parsed: ParsedField): Field<T> {
  const { fieldType, ...config } = parsed;
  return {
    ...config,
    type: config.nullable ? fieldType : new GraphQLNonNull(fieldType),
  } as Field<T>;
}

/**
 * Parses a zod input object with given options.
 *
 * @param {T} zodInput The zod object input.
 * @param {IModelFromZodOptions} [options={}] The options for the parsing.
 * @return {ParsedField[]} An array of {@link ParsedField}.
 */
export function parseFields<T extends ZodType>(
  zodInput: T,
  options: IModelFromZodOptions,
): ParsedField[] {
  // Parsing an object shape
  if (isZodInstance(ZodObject, zodInput)) {
    return Object.entries(zodInput.shape).map(([key, value]) =>
      parseSingleField(key, value as ZodType, options),
    );
  }

  // Parsing a primitive field
  const parsedField = parseSingleField('', zodInput, options);
  return [parsedField];
}

/**
 * Parses a field from given parameters.
 *
 * @param {string} key The Property key of the zod type.
 * @param {T} input The zod type input.
 * @param {IModelFromZodOptions} options The options for parsing.
 * @return {ParsedField} The parsed field output.
 */
function parseSingleField<T extends ZodType>(
  key: string,
  input: T,
  options: IModelFromZodOptions,
): ParsedField {
  const elementType = getFieldInfoFromZod(key, input, options);

  const { type: fieldType } = elementType;

  let defaultValue = elementType.isType ? undefined : generateDefaults(input);
  const nullable = getNullability(elementType);

  if (nullable === 'items') {
    defaultValue = undefined;
  }

  const description = getDescription(input);

  return {
    key,
    fieldType,
    description,
    defaultValue,
    nullable,
  };
}

/**
 * Converts a given `zod` object input for a key, into {@link ZodTypeInfo}.
 * @param {ZodTypeAny} prop The `zod` object property.
 * @param {IModelFromZodOptions} options The options for conversion.
 * @return {ZodTypeInfo} The {@link ZodTypeInfo} of the property.
 */
function getFieldInfoFromZod(
  key: string,
  prop: ZodTypeAny,
  options: IModelFromZodOptions,
): ZodTypeInfo {
  if (isZodInstance(ZodArray, prop)) {
    const data = getFieldInfoFromZod(key, prop.element, options);

    const { type, isEnum, isNullable: isItemNullable, isOptional: isItemOptional } = data;

    return {
      type: new GraphQLList(
        isItemNullable || isItemOptional ? type : new GraphQLNonNull(type),
      ),
      isOptional: prop.isOptional(),
      isNullable: prop.isNullable(),
      isEnum,
      isOfArray: true,
      isItemNullable,
      isItemOptional,
    };
  } else if (isZodInstance(ZodBoolean, prop)) {
    return {
      type: getGqlScalarType('Boolean'),
      isOptional: prop.isOptional(),
      isNullable: prop.isNullable(),
    };
  }
  if (isZodInstance(ZodString, prop)) {
    return {
      type: getGqlScalarType('String'),
      isOptional: prop.isOptional(),
      isNullable: prop.isNullable(),
    };
  } else if (isZodInstance(ZodNumber, prop)) {
    const isInt = Boolean(
      prop._def.checks.find((check: ZodNumberCheck) => check.kind === 'int'),
    );

    return {
      type: isInt ? getGqlScalarType('Int') : getGqlScalarType('Float'),
      isOptional: prop.isOptional(),
      isNullable: prop.isNullable(),
    };
  } else if (isZodInstance(ZodOptional, prop)) {
    const { type, isEnum, isOfArray, isItemNullable, isItemOptional } =
      getFieldInfoFromZod(key, prop.unwrap(), options);

    return {
      type,
      isEnum,
      isOfArray,
      isItemNullable,
      isItemOptional,
      isOptional: true,
      isNullable: prop.isNullable(),
    };
  } else if (isZodInstance(ZodObject, prop)) {
    const isNullable = prop.isNullable() || prop.isOptional();
    const name = `${options.name}_${toTitleCase(key)}`;

    const nestedOptions = {
      ...options,
      name,
      description: prop.description,
      isAbstract: isNullable,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = modelFromZod(prop as any, nestedOptions);

    return {
      type:
        options.modelType === 'input'
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            new GraphQLInputObjectType(model as any)
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            new GraphQLObjectType(model as any),
      isType: true,
      isNullable: prop.isNullable(),
      isOptional: prop.isOptional(),
    };
  } else if (isZodInstance(ZodEnum, prop) || isZodInstance(ZodNativeEnum, prop)) {
    const isNative = isZodInstance(ZodNativeEnum, prop);

    if (isZodInstance(ZodEnum, prop) || isNative) {
      const enumObj = isNative ? prop.enum : prop.Enum;
      let enumType: GraphQLEnumType | undefined;
      const enumProvider = options.getEnumType;

      if (typeof enumProvider === 'function') {
        const foundEnum = enumProvider(enumObj, {
          isNative,
          name: String(key),
          parentName: options.name,
          description: prop.description,
        });

        enumType = foundEnum;
      }

      const incompatibleKey = getFirstIncompatibleEnumKey(enumObj);
      if (incompatibleKey) {
        throw new Error(
          `The value of the Key("${incompatibleKey}") of ${options.name}.${String(key)} Enum was not valid`,
        );
      }

      const enumDef = isNative ? prop._def : prop._def;
      const parentName = options.name;

      const enumName = withSuffix('Enum')(
        `${toTitleCase(parentName as string)}_${toTitleCase(key)}`,
      );

      return {
        type:
          enumType ??
          new GraphQLEnumType({
            name: enumName,
            values: (enumDef.values as string[]).reduce((vals, key) => {
              vals[key] = {
                value: key,
                description: `Value: ${key}`,
              };

              return vals;
            }, {} as ObjMap<GraphQLEnumValueConfig>),
          }),
        isNullable: prop.isNullable(),
        isOptional: prop.isOptional(),
        isEnum: true,
      };
    } else if (Array.isArray(prop)) {
      return getFieldInfoFromZod(key, prop[0], {
        ...options,
      });
    } else {
      throw new Error(`Unexpected enum type for Key("${String(key)}")`);
    }
  } else if (isZodInstance(ZodDefault, prop)) {
    return getFieldInfoFromZod(key, prop._def.innerType, options);
  } else if (isZodInstance(ZodTransformer, prop)) {
    return getFieldInfoFromZod(key, prop.innerType(), options);
  } else if (isZodInstance(ZodNullable, prop)) {
    return getFieldInfoFromZod(key, prop._def.innerType, options);
  } else {
    const typeName = getZodObjectName(prop);

    if (isDefinedGqlScalarType(typeName)) {
      const scalarType = getGqlScalarType(typeName as never);

      return {
        isType: true,
        type: scalarType,
        isNullable: prop.isNullable(),
        isOptional: prop.isOptional(),
      };
    }

    throw new Error(`Unsupported type info of Key("${key}") of Type("${typeName}")`);
  }
}

/**
 * Builds the corresponding zod type name.
 *
 * @param {ZodTypeAny} instance The zod type instance.
 * @return {string} A built type name for the input.
 *
 * @__PURE__
 */
function getZodObjectName(instance: ZodTypeAny): string {
  if (isZodInstance(ZodArray, instance)) {
    const innerName = getZodObjectName(instance.element);
    return `Array<${innerName}>`;
  }

  if (isZodInstance(ZodOptional, instance)) {
    const innerName = getZodObjectName(instance.unwrap());
    return `Optional<${innerName}>`;
  }

  if (isZodInstance(ZodTransformer, instance)) {
    return getZodObjectName(instance.innerType());
  }

  if (isZodInstance(ZodDefault, instance)) {
    return getZodObjectName(instance._def.innerType);
  }

  if (isZodInstance(ZodEnum, instance)) {
    const { description = '', Enum } = instance;
    const nameSeparatorIndex = description.indexOf(':');

    if (nameSeparatorIndex > 0) {
      const name = description.slice(0, nameSeparatorIndex);
      return `Enum<${name}>`;
    } else {
      const values = Object.values(Enum);
      const name = values.join(',');
      return `Enum<${name}>`;
    }
  }

  if (isZodInstance(ZodObject, instance)) {
    const { description = '' } = instance;
    const nameSeparatorIndex = description.indexOf(':');

    if (nameSeparatorIndex > 0) {
      const name = description.slice(0, nameSeparatorIndex);
      return name;
    } else {
      return `Object`;
    }
  }

  if (isZodInstance(ZodRecord, instance)) {
    const { keySchema, valueSchema } = instance;
    const keyName = getZodObjectName(keySchema);
    const valueName = getZodObjectName(valueSchema);
    return `Record<${keyName}, ${valueName}>`;
  }

  if (isZodInstance(ZodEffects, instance)) {
    return getZodObjectName(instance.innerType());
  }

  if (isZodInstance(ZodLiteral, instance)) {
    const { value } = instance;
    if (typeof value === 'object') {
      if (value === null) return `Literal<Null>`;
      let constructor: unknown;
      if ('prototype' in value) {
        const prototype = value['prototype'];
        if (typeof prototype === 'object' && prototype && 'constructor' in prototype) {
          constructor = prototype['constructor'];
        }
      } else if ('constructor' in value) {
        constructor = value['constructor'];
      }

      if (typeof constructor === 'function') {
        return `Literal<${constructor.name}>`;
      }
    }

    return `Literal<${toTitleCase(typeof instance.value)}>`;
  }

  if (isZodInstance(ZodUnion, instance)) {
    return instance.options.map(getZodObjectName).join(' | ');
  }

  if (isZodInstance(ZodNullable, instance)) {
    const innerName = getZodObjectName(instance._def.innerType);
    return `Nullable<${innerName}>`;
  }

  if (isZodInstance(ZodBoolean, instance)) return 'Boolean';
  if (isZodInstance(ZodString, instance)) return 'String';
  if (isZodInstance(ZodNumber, instance)) return 'Number';
  if (isZodInstance(ZodBigInt, instance)) return 'BigInt';
  if (isZodInstance(ZodDate, instance)) return 'Date';
  if (isZodInstance(ZodAny, instance)) return 'Any';
  if (isZodInstance(ZodNull, instance)) return 'Null';
  return 'Unknown';
}

/**
 * Gets the nullability of a field from type info.
 *
 * @param {ZodTypeInfo} typeInfo The type info.
 * @return {(boolean | NullableList)} The nullability state.
 */
function getNullability(typeInfo: ZodTypeInfo): boolean | NullableList {
  const { isNullable, isOptional, isOfArray, isItemOptional, isItemNullable } = typeInfo;

  let nullable: boolean | NullableList = isNullable || isOptional;

  if (isOfArray) {
    if (isItemNullable || isItemOptional) {
      if (nullable) {
        nullable = 'itemsAndList';
      } else {
        nullable = 'items';
      }
    }
  }

  return nullable;
}

/**
 * Generates the default values for given object.
 *
 * This function is recursive with {@link generateDefaults}.
 *
 * @param {AnyZodObject} input The input.
 * @return {Record<string, ZodTypeAny>} A record of default values.
 */
function generateDefaultsForObject(input: AnyZodObject): Record<string, ZodTypeAny> {
  return Object.keys(input.shape).reduce(
    (curr, key) => {
      const res = generateDefaults<ZodTypeAny>(input.shape[key]);
      if (res) {
        curr[key] = res;
      }

      return curr;
    },
    {} as Record<string, ZodTypeAny>,
  );
}

/**
 * Generates the default vales for given input.
 *
 * @param {T} input The input.
 * @return {*} A record containing keys and the zod
 * values with defaults.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateDefaults<T extends ZodTypeAny>(input: T): any {
  if (isZodInstance(ZodObject, input)) {
    return generateDefaultsForObject(input as AnyZodObject);
  } else if (isZodInstance(ZodDefault, input)) {
    return input._def.defaultValue?.();
  }
}

function getFirstIncompatibleEnumKey(
  input: Record<string, string | number>,
): string | undefined {
  const digitTest = /^\s*?\d/;

  for (const key in input) {
    const value = input[key];
    if (typeof value !== 'string') return key;
    if (digitTest.test(value)) return key;
  }
}
