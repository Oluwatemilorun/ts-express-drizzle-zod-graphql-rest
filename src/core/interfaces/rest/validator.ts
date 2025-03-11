import { Request } from 'express';
import { ZodFormattedError, ZodType } from 'zod';

import { BadRequestError } from '@shared/errors';

export function validateAndSerializeSchemaValues<TArgs extends object = object>(
  object: TArgs,
  schema: ZodType,
): [TArgs | null, ZodFormattedError<TArgs> | null] {
  const result = schema.safeParse(object);

  if (result.success) {
    return [result.data as TArgs, null];
  } else {
    return [null, result.error.issues as unknown as ZodFormattedError<TArgs>];
  }
}

export function validateAndSerializeRequest<
  TParams extends ZodType,
  TQuery extends ZodType,
  TBody extends ZodType,
>(
  req: Request,
  schemas: [TParams | null, TQuery | null, TBody | null],
): [TParams['_output'], TQuery['_output'], TBody['_output']] {
  const [paramSchema, querySchema, bodySchema] = schemas;
  const { params, query, body } = req;
  const errors = {} as Record<'params' | 'query' | 'body', unknown>;

  let cleanedParams;
  let cleanedQuery;
  let cleanedBody;

  if (paramSchema) {
    const [cleaned, error] = validateAndSerializeSchemaValues(params, paramSchema);
    if (error) errors['params'] = error;
    else cleanedParams = cleaned;
  }

  if (querySchema) {
    const [cleaned, error] = validateAndSerializeSchemaValues(query, querySchema);
    if (error) errors['query'] = error;
    else cleanedParams = cleaned;
  }

  if (bodySchema) {
    const [cleaned, error] = validateAndSerializeSchemaValues(body, bodySchema);
    if (error) errors['query'] = error;
    else cleanedParams = cleaned;
  }

  if (Object.keys(errors).length) {
    throw new BadRequestError(`${Object.keys(errors)[0]} validation error`, errors);
  }

  return [cleanedParams, cleanedQuery, cleanedBody];
}
