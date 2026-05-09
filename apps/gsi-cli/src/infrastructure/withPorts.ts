import type { AsyncUseCase, UseCase } from "@cs2helper/shared";

export function withPorts<P extends unknown[], A extends unknown[], R>(
  fn: UseCase<P, A, R>,
  ports: P
): (...args: A) => R {
  return (...args: A) => fn(ports, ...args);
}

export function withPortsAsync<P extends unknown[], A extends unknown[], R>(
  fn: AsyncUseCase<P, A, R>,
  ports: P
): (...args: A) => Promise<R> {
  return (...args: A) => fn(ports, ...args);
}
