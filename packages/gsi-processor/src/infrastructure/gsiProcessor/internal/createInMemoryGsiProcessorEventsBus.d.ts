import type { GsiProcessorEventsPort } from "../../../domain/gsiProcessor";
/**
 * Creates an in-memory pub/sub bus for processor domain events.
 *
 * This adapter is intentionally tiny: events are delivered synchronously to all
 * current listeners in subscription order.
 */
export declare function createInMemoryGsiProcessorEventsBus(): GsiProcessorEventsPort;
