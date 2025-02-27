import {
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';
import { AnyZodObject } from 'zod';

import { IModelFromZodOptions, modelFromZod } from './model-from-zod';

export const getInputName = (input: GraphQLInputType): string => {
  if (input instanceof GraphQLNonNull || input instanceof GraphQLList) {
    return getInputName(input.ofType);
  } else {
    return input.name;
  }
};

export function CreateGqlInputFromSchema<
  T extends AnyZodObject,
  O extends Omit<IModelFromZodOptions, 'modelType'> & {
    /**
     * if `true`, the input will be wrapped in a {@link GraphQLNonNull} required
     */
    required?: boolean;
  },
>(wrappedSchema: Record<string, T>, options: O = {} as O): GraphQLInputType {
  const { required } = options;
  const schemaName = Object.keys(wrappedSchema)[0];
  const zodInput = Object.values(wrappedSchema)[0];
  const { name, description, fields } = modelFromZod(zodInput, {
    ...options,
    name: options.name || schemaName,
    modelType: 'input',
  });

  const input = new GraphQLInputObjectType({
    name,
    description,
    fields,
  });

  return required === true ? new GraphQLNonNull(input) : input;
}
