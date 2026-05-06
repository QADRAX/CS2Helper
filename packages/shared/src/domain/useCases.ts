/**
 * Generic contract for application use cases with explicit port injection.
 * 
 * @typeParam TPorts - Interface containing required infrastructure ports.
 * @typeParam TArgs - Tuple of business arguments.
 * @typeParam TResult - Use case output.
 */
export type UseCase<TPorts, TArgs extends unknown[], TResult = void> = 
  (ports: TPorts, ...args: TArgs) => TResult;

/**
 * Async variation of the standard use case.
 */
export type AsyncUseCase<TPorts, TArgs extends unknown[], TResult = void> = 
  UseCase<TPorts, TArgs, Promise<TResult>>;
