export const rateLimitConfig = {
  /** This is the maximum query complexity level per second */
  MAX_QUERY_COMPLEXITY: 3000,
  /** This is the maximum query complexity per request */
  MAX_QUERY_COMPLEXITY_PER_REQUEST: 1000,
} as const;
