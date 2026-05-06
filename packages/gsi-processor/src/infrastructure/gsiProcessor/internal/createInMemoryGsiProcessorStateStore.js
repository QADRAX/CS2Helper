/**
 * Creates an in-memory state store for aggregate processor state.
 *
 * Stored snapshots are frozen on write so consumers cannot accidentally mutate
 * the shared state object outside the reducer pipeline.
 */
export function createInMemoryGsiProcessorStateStore(initialState) {
    let state = Object.freeze({ ...initialState });
    let listeners = [];
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
