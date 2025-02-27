import { GraphQLFieldConfigArgumentMap } from 'graphql';

import { BadRequestError } from '@shared/errors';

import { getInputName } from './inputs';
import { InputsObject } from './types';

export function mapArgsToValidator(
  args: GraphQLFieldConfigArgumentMap,
  inputs: InputsObject,
): InputsObject {
  const argsToInputMap = {} as InputsObject;

  for (const [argName, argConfig] of Object.entries(args)) {
    const inputName = getInputName(argConfig.type);
    if (inputs[inputName]) {
      argsToInputMap[argName] = inputs[inputName];
    }
  }

  return argsToInputMap;
}

export function validateArgsValues(args: object, argsToValidatorMap: InputsObject): void {
  const errors = {} as Record<string, unknown>;

  for (const [argName, value] of Object.entries(args)) {
    const validator = argsToValidatorMap[argName];

    if (validator) {
      const result = validator.safeParse(value);

      if (!result.success) {
        errors[argName] = result.error.format();
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new BadRequestError('Argument Validation Error', errors);
  }
}
