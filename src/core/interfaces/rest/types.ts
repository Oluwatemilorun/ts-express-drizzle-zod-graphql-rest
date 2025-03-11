import { Request, Response } from 'express';
import { ZodType } from 'zod';

import { AppContext } from '@shared/types';

export type HandlerOptions<TParams, TBody, TQuery, TContextUser = object> = {
  params: TParams;
  body: TBody;
  query: TQuery;
  ctx: AppContext<TContextUser>;
};

export type HandlerResponse<TData = object> = {
  message: string;
  data: TData;
};

export type MethodOptions<
  TParams = undefined,
  TBody = undefined,
  TQuery = undefined,
  TContextUser = object,
> = {
  params?: TParams;
  body?: TBody;
  query?: TQuery;
  middlewares?: Middleware[];
  handler: (
    opts: HandlerOptions<
      TParams extends ZodType ? TParams['_output'] : undefined,
      TBody extends ZodType ? TBody['_output'] : undefined,
      TQuery extends ZodType ? TQuery['_output'] : undefined,
      TContextUser
    >,
  ) => Promise<HandlerResponse> | HandlerResponse;
};

export type RouteConfig = {
  controller: MethodBuilder;
};

export type MethodBuilder = <
  TParams extends ZodType | undefined = undefined,
  TBody extends ZodType | undefined = undefined,
  TQuery extends ZodType | undefined = undefined,
  TContextUser = object,
>(
  opts: MethodOptions<TParams, TBody, TQuery, TContextUser>,
) => typeof opts;

export type HttpMethod =
  | 'all'
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head';

export type ResponseWrapper<TData, TError = undefined> = {
  status: TError extends undefined ? true : false;
  message: string;
  data: TData;
  errors: TError;
};

export type ErrorObject = {
  statusCode: number;
  message: string;
  errors: Record<string, unknown>;
  attachHeaders?: Record<string, string>;
};

export type Middleware = (req: Request, res: Response) => Promise<void> | void;
