/**
 * Creates an in-memory pub/sub bus for processor domain events.
 *
 * This adapter is intentionally tiny: events are delivered synchronously to all
 * current listeners in subscription order.
 */
export function createInMemoryGsiProcessorEventsBus() {
    let listeners = [];
    return {
        publish(event) {
            for (const listener of listeners) {
                listener(event);
            }
        },
        subscribe(listener) {
            listeners = [...listeners, listener];
            return () => {
                listeners = listeners.filter((entry) => entry !== listener);
            };
        },
    };
}
