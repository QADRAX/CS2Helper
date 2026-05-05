import type { CoreEngineStatePort, CoreEngineState } from "../../../domain/gsiProcessor";

/**
 * Creates an in-memory state store for aggregate processor state.
 *
 * Stored snapshots are frozen on write so consumers cannot accidentally mutate
 * the shared state object outside the reducer pipeline.
 */
export function createInMemoryGsiProcessorStateStore(
  initialState: CoreEngineState
): CoreEngineStatePort {
  let state: Readonly<CoreEngineState> = Object.freeze({ ...initialState });
  let listeners: Array<(state: Readonly<CoreEngineState>) => void> = [];

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
