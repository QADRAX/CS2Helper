/**
 * Generic contract for application use cases with explicit port injection.
 *
 * @typeParam TPorts - Injected ports as a **tuple** (fixed order per use case). Use `[]` when a use case has no ports.
 * @typeParam TArgs - Tuple of business arguments.
 * @typeParam TResult - Use case output.
 */
export type UseCase<
  TPorts extends readonly unknown[],
  TArgs extends unknown[],
  TResult = void,
> = (ports: TPorts, ...args: TArgs) => TResult;

/**
 * Async variation of the standard use case.
 */
export type AsyncUseCase<
  TPorts extends readonly unknown[],
  TArgs extends unknown[],
  TResult = void,
> = UseCase<TPorts, TArgs, Promise<TResult>>;
