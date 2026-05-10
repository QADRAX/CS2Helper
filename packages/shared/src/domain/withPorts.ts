import type { AsyncUseCase, UseCase } from "./useCases";

/**
 * Partially applies a synchronous use case to a fixed ports tuple.
 */
export function withPorts<P extends readonly unknown[], A extends unknown[], R>(
  fn: UseCase<P, A, R>,
  ports: P
): (...args: A) => R {
  return (...args: A) => fn(ports, ...args);
}

/**
 * Partially applies an async use case to a fixed ports tuple.
 */
export function withPortsAsync<P extends readonly unknown[], A extends unknown[], R>(
  fn: AsyncUseCase<P, A, R>,
  ports: P
): (...args: A) => Promise<R> {
  return (...args: A) => fn(ports, ...args);
}
