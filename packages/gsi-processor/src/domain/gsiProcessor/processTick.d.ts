import type { GsiProcessorMemory, GsiProcessorState, TickProcessingResult } from "./gsiProcessorTypes";
import type { WatcherPayload } from "../csgo";
/**
 * Processes one watcher tick with strict stream-consistency rules.
 *
 * Pipeline:
 * - normalize raw payload
 * - classify snapshot quality
 * - transition stream state machine
 * - gate critical reducers when stream is not healthy
 * - update state/memory/watermarks and emit domain + operational events
 */
export declare function processTickDomain(state: GsiProcessorState, memory: GsiProcessorMemory, payload: WatcherPayload | null, timestamp: number): TickProcessingResult;
