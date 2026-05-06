import type { NormalizedSnapshot, WatcherPayload } from "../csgo";
/**
 * Normalizes watcher payloads (`client_local`, `spectator_hltv`, `dedicated_server`)
 * into a single canonical snapshot consumed by domain reducers.
 */
export declare function normalizeWatcherPayload(payload: WatcherPayload): NormalizedSnapshot;
