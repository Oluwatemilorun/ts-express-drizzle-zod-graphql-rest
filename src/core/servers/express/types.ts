// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type F<T = any> = (...args: any[]) => T;
export type FunctionWithProps = F & Record<string, unknown>;
