import { type GSIProcessor } from "../../domain/gsiProcessor";
/** Optional infrastructure overrides when creating a processor instance. */
export interface CreateGsiProcessorOptions {
    /** Deterministic timestamp source, mainly useful for tests and replays. */
    getTimestamp?: () => number;
}
/**
 * Assembles a fully wired GSI processor instance from in-memory adapters.
 *
 * Infrastructure is the composition root: it chooses concrete state/memory/event
 * adapters, creates the application use cases, and exposes them as a public API.
 */
export declare function createGsiProcessor(options?: CreateGsiProcessorOptions): GSIProcessor;
