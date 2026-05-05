import type { GsiProcessorStatePort, GsiProcessorState } from "../../../domain/gsiProcessor";

/**
 * Creates an in-memory state store for aggregate processor state.
 *
 * Stored snapshots are frozen on write so consumers cannot accidentally mutate
 * the shared state object outside the reducer pipeline.
 */
export function createInMemoryGsiProcessorStateStore(
  initialState: GsiProcessorState
): GsiProcessorStatePort {
  let state: Readonly<GsiProcessorState> = Object.freeze({ ...initialState });
  let listeners: Array<(state: Readonly<GsiProcessorState>) => void> = [];

  return {
    getState() {
      return state;
    },
    setState(nextState) {
      state = Object.freeze(nextState);
      for (const listener of listeners) {
        listener(state);
      }
    },
    subscribeState(listener) {
      listeners = [...listeners, listener];
      return () => {
        listeners = listeners.filter((entry) => entry !== listener);
      };
    },
  };
}
