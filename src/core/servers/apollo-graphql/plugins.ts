import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { GraphQLSchema } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';
import { RateLimiterMemory } from 'rate-limiter-flexible';

import Constants from '@shared/constants';
import { MaxQueryReached } from '@shared/errors';
import { ApolloContext } from '@shared/types';

/**
 * This plugin helps integrate and implement query complexity settings and blocking.
 * Query complexity allows you to define how complex these fields are,
 * and to restrict queries with a maximum complexity.
 * The idea is to define how complex each field is by using a simple number.
 * ```sdl
 * query {
    author(id: "abc") { # complexity: 1
      posts {           # complexity: 1
        title           # complexity: 1
      }
    }
  }
 * ```
 * A simple addition gives us a total of 3 for the complexity of this query. 
 * We can then match this complexity with the maximum complexity of our schema
 * @param schema The generated graphql schema
 * @returns An Apollo server plugin
 */
export const queryComplexityPlugin: (
  schema: GraphQLSchema,
) => ApolloServerPlugin<ApolloContext> = (schema) => {
  const rateLimiter = new RateLimiterMemory({
    points: Constants.RATE_LIMIT_CONFIG.MAX_QUERY_COMPLEXITY,
    duration: 60, // Per minute
  });

  return {
    async requestDidStart(): Promise<GraphQLRequestListener<ApolloContext>> {
      return {
        async didResolveOperation({ request, document, contextValue }): Promise<void> {
          /**
           * This provides GraphQL query analysis to be able to react on complex queries to the GraphQL server.
           * This can be used to protect the server against resource exhaustion and DoS attacks.
           * More documentation can be found at https://github.com/ivome/graphql-query-complexity.
           */
          const complexity = getComplexity({
            schema,
            // To calculate query complexity properly,
            // we have to check only the requested operation
            // not the whole document that may contains multiple operations
            operationName: request.operationName,
            query: document,
            variables: request.variables,
            // Add any number of estimators. The estimators are invoked in order, the first
            // numeric value that is being returned by an estimator is used as the field complexity.
            // If no estimator returns a value, an exception is raised.
            estimators: [
              // Using fieldExtensionsEstimator is mandatory to make it work with type-graphql.
              fieldExtensionsEstimator(),
              // This will assign each field a complexity of 1
              // if no other estimator returned a value.
              simpleEstimator({ defaultComplexity: 1 }),
            ],
          });

          // Here we can react to the calculated complexity.
          // We throw an error if the complexity is greater than the max query complexity per request.
          const maxComplexity =
            Constants.RATE_LIMIT_CONFIG.MAX_QUERY_COMPLEXITY_PER_REQUEST;
          // res.status(429)
          if (complexity > maxComplexity) {
            throw new MaxQueryReached(
              `Query has depth of ${complexity}, which exceeds max depth of ${maxComplexity}`,
            );
          }

          // Using Throttling Based on Query Complexity with the help of `RateLimiterMemory`,
          // we consume the current complexity (as points) by the IP address. An error is thrown
          // when the threshold is reached by an IP address and there are no longer points to consume.
          await rateLimiter
            .consume(contextValue.remoteAddress, complexity)
            .catch((res) => {
              // Not enough points to consume
              throw new MaxQueryReached(
                `Maximum query complexity reached per minute. Please try again later.`,
                res,
              );
            });
        },
      };
    },
  };
};
