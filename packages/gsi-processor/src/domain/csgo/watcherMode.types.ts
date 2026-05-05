/**
 * Supported watcher profiles for CS2 GSI ingestion.
 *
 * - `client_local`: local player client feed
 * - `spectator_hltv`: observer/HLTV-oriented feed
 * - `dedicated_server`: server-side polling feed
 */
export type WatcherMode = "client_local" | "spectator_hltv" | "dedicated_server";
