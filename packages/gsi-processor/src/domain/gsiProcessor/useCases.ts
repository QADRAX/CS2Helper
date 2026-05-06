import type { UseCase } from "@cs2helper/shared";
import type { GsiProcessorEvent, GsiProcessorState } from "./gsiProcessorTypes";

/** Processes one raw GSI tick and updates the internal state. */
export type ProcessTickUseCase = UseCase<[tick: any, raw: string], void>;

/** Returns the latest aggregate state. */
export type GetStateUseCase = UseCase<[], Readonly<GsiProcessorState>>;

/** Subscribes to full state snapshots. */
export type SubscribeStateUseCase = UseCase<
  [listener: (state: Readonly<GsiProcessorState>) => void],
  () => void
>;

/** Subscribes to emitted domain events. */
export type SubscribeEventsUseCase = UseCase<
  [listener: (event: GsiProcessorEvent) => void],
  () => void
>;
