import type {
  GsiProcessorEvent,
  GsiProcessorState,
} from "@cs2helper/gsi-processor";
import type { UseCase } from "@cs2helper/shared";

/** Ingests one raw CS2 GSI tick payload. */
export type IngestGsiTickUseCase = UseCase<[tick: any, raw: string], void>;

/** Retrieves the current aggregate engine state. */
export type GetStateUseCase = UseCase<[], Readonly<GsiProcessorState>>;

/** Subscribes to full state snapshots. */
export type SubscribeStateUseCase = UseCase<
  [listener: (state: Readonly<GsiProcessorState>) => void],
  () => void
>;

/** Subscribes to processor domain events. */
export type SubscribeEventsUseCase = UseCase<
  [listener: (event: GsiProcessorEvent) => void],
  () => void
>;

/** Subscribes to raw JSON ticks. */
export type SubscribeRawTicksUseCase = UseCase<
  [listener: (raw: string) => void],
  () => void
>;
