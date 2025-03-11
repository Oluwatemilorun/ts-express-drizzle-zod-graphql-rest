import { Request, Response, Router } from 'express';

import Constants from '@shared/constants';
import { AppContainer } from '@shared/types';

import { sendError } from './error-handler';
import { middlewareWrapper } from './middlewares';
import { HttpMethod, MethodOptions, ResponseWrapper, RouteConfig } from './types';
import { validateAndSerializeRequest } from './validator';

function requestHandler(
  {
    body: bodySchema,
    params: paramsSchema,
    query: querySchema,
    handler,
  }: ReturnType<RouteConfig['controller']>,
  container: AppContainer,
) {
  return async function (req: Request, res: Response): Promise<void> {
    try {
      const [params, query, body] = validateAndSerializeRequest(req, [
        paramsSchema || null,
        querySchema || null,
        bodySchema || null,
      ]);

      const response = await handler({
        body,
        params,
        query,
        ctx: {
          token: req.headers.authorization,
          // Inject the registered services into the apollo graphql server context
          scope: container.createScope() as AppContainer,
          // Inject the client remote address into the apollo graphql server context
          remoteAddress:
            (req as unknown as Record<string, string>)[
              Constants.REQUEST_ATTRIBUTES.IP_ADDRESS
            ] || '127.0.0.1',
        },
      });

      res.send({
        ...response,
        status: true,
      } as ResponseWrapper<(typeof response)['data']>);
    } catch (error) {
      sendError(res, error);
    }
  };
}

export function createRoutingController<TConfig extends RouteConfig = RouteConfig>(
  controllerRoute: string,
  routesConfig: Record<
    string,
    (config: TConfig) => Partial<Record<HttpMethod, ReturnType<TConfig['controller']>>>
  >,
) {
  const controller = ((opts: MethodOptions) => {
    return opts;
  }) as TConfig['controller'];

  return function (baseRouter: Router, container: AppContainer): Router {
    const controllerRouter = Router();

    for (const [route, methods] of Object.entries(routesConfig)) {
      const definedMethods = methods({ controller } as TConfig);

      for (const [method, methodConfig] of Object.entries(definedMethods)) {
        const { middlewares = [], ...otherConfigs } = methodConfig;

        controllerRouter[method as HttpMethod](
          route,
          ...middlewares.map((m) => middlewareWrapper(m)),
          requestHandler(otherConfigs, container),
        );
      }
    }

    baseRouter.use(controllerRoute, controllerRouter);

    return baseRouter;
  };
}
