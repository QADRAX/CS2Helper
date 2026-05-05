import type { CoreEngineEvent, CoreEngineState, CS2GameState } from "./gsiProcessorTypes";

/**
 * Public API exposed by the CS2 core engine instance.
 *
 * This API is assembled in infrastructure from application use cases,
 * but its contract lives in domain to keep architectural boundaries explicit.
 */
export interface MatchEngineAPI {
  /**
   * Processes one CS2 GSI snapshot and updates aggregated match state.
   *
   * @param gameState - Raw CS2 GSI tick. `null` is allowed and still counts as a processed tick.
   * @param timestamp - Optional event-time in milliseconds. If omitted, infrastructure clock is used.
   */
  processTick: (gameState: CS2GameState, timestamp?: number) => void;

  /**
   * Returns the latest immutable aggregate state for this engine instance.
   */
  getState: () => Readonly<CoreEngineState>;

  /**
   * Subscribes to aggregate state changes.
   *
   * @param listener - Callback invoked after state updates.
   * @returns Unsubscribe function.
   */
  subscribeState: (
    listener: (state: Readonly<CoreEngineState>) => void
  ) => () => void;

  /**
   * Subscribes to emitted domain events derived from incoming ticks.
   *
   * @param listener - Callback invoked for each emitted event.
   * @returns Unsubscribe function.
   */
  subscribeEvents: (listener: (event: CoreEngineEvent) => void) => () => void;
}
