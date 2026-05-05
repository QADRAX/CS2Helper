import type { CoreEngineEvent, CoreEngineState, CS2GameState } from "./gsiProcessorTypes";
import type {
  CoreEngineClockPort,
  CoreEngineEventsPort,
  CoreEngineMemoryPort,
  CoreEngineStatePort,
} from "./contracts";

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

/**
 * Shared execution context available for core engine use cases.
 *
 * Infrastructure assembles this context once per processor instance and passes
 * it to the application factories so every use case operates on the same ports.
 */
export interface CoreEngineUseCaseContext {
  /** Aggregate state port. */
  state: CoreEngineStatePort;
  /** Rolling memory port used for delta-based inference. */
  memory: CoreEngineMemoryPort;
  /** Event publication/subscription port. */
  events: CoreEngineEventsPort;
  /** Clock abstraction for deterministic timestamps. */
  clock: CoreEngineClockPort;
}

/** Application use case that processes one watcher payload tick. */
export type ProcessTickUseCase = UseCase<[CS2GameState, number?], void>;
/** Application use case that returns the latest aggregate state. */
export type GetStateUseCase = UseCase<[], Readonly<CoreEngineState>>;
/** Application use case that subscribes to state updates. */
export type SubscribeStateUseCase = UseCase<
  [(state: Readonly<CoreEngineState>) => void],
  () => void
>;
/** Application use case that subscribes to emitted domain events. */
export type SubscribeEventsUseCase = UseCase<
  [(event: CoreEngineEvent) => void],
  () => void
>;
