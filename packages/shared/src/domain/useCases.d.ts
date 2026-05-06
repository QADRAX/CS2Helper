/**
 * Generic contract for application use cases.
 *
 * @typeParam TArgs - Ordered tuple of input arguments.
 * @typeParam TResult - Return type produced by the use case.
 */
export interface UseCase<TArgs extends unknown[] = [], TResult = void> {
    execute: (...args: TArgs) => TResult;
}
/**
 * Generic factory for building use cases from a context object.
 *
 * @typeParam TUseCase - Concrete use case contract to create.
 * @typeParam TContext - Context shape required by the use case.
 */
export type UseCaseFactory<TUseCase, TContext> = (context: TContext) => TUseCase;
