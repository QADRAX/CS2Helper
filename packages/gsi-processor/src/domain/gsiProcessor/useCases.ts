import type { GsiProcessorEvent, GsiProcessorState, CS2GameState } from "./gsiProcessorTypes";
import type {
  GsiProcessorClockPort,
  GsiProcessorEventsPort,
  GsiProcessorMemoryPort,
  GsiProcessorStatePort,
} from "./contracts";
import type { UseCase, UseCaseFactory } from "@cs2helper/shared";

export type { UseCase, UseCaseFactory };

/**
 * Shared execution context available for core engine use cases.
 *
 * Infrastructure assembles this context once per processor instance and passes
 * it to the application factories so every use case operates on the same ports.
 */
export interface GsiProcessorUseCaseContext {
  /** Aggregate state port. */
  state: GsiProcessorStatePort;
  /** Rolling memory port used for delta-based inference. */
  memory: GsiProcessorMemoryPort;
  /** Event publication/subscription port. */
  events: GsiProcessorEventsPort;
  /** Clock abstraction for deterministic timestamps. */
  clock: GsiProcessorClockPort;
}

/** Application use case that processes one watcher payload tick. */
export type ProcessTickUseCase = UseCase<[CS2GameState, number?], void>;
/** Application use case that returns the latest aggregate state. */
export type GetStateUseCase = UseCase<[], Readonly<GsiProcessorState>>;
/** Application use case that subscribes to state updates. */
export type SubscribeStateUseCase = UseCase<
  [(state: Readonly<GsiProcessorState>) => void],
  () => void
>;
/** Application use case that subscribes to emitted domain events. */
export type SubscribeEventsUseCase = UseCase<
  [(event: GsiProcessorEvent) => void],
  () => void
>;
