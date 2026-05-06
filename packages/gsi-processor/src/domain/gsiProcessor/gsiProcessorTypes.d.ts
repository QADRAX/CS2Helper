import type { NormalizedSnapshot, WatcherMode, WatcherPayload } from "../csgo";
import type { PhaseRound, TeamType } from "../csgo/phases";
import type { MatchData } from "../match/matchTypes";
import type { SnapshotQuality, StreamMetrics, StreamState, StreamWatermarks } from "./stream";
/** Input snapshot type accepted by the processor API. */
export type CS2GameState = WatcherPayload | null;
/** Aggregated per-player projection kept in engine state. */
export interface PlayerAggregate {
    /** The unique 64-bit Steam ID of the player. */
    steamid: string;
    /** The current in-game display name of the player. */
    name: string;
    /** The team the player is currently assigned to (T, CT, or SPECTATOR). */
    team: TeamType;
    /** Current health points (0-100). */
    health: number;
    /** Current account balance in dollars. */
    money: number;
    /** Total kills in the current match. */
    kills: number;
    /** Total deaths in the current match. */
    deaths: number;
    /** Timestamp of the last processed payload where this player was seen. */
    lastSeenAt: number;
}
/** Global aggregate state for one processor instance. */
export interface GsiProcessorState {
    /** Currently active match data, or null if no match is ongoing. */
    currentMatch: MatchData | null;
    /** The last raw payload received from the game. */
    lastGameState: WatcherPayload | null;
    /** The normalized and validated snapshot of the last payload. */
    lastSnapshot: NormalizedSnapshot | null;
    /** Current operation mode of the watcher (e.g., matching, observing). */
    watcherMode: WatcherMode | null;
    /** Dictionary of aggregated player stats keyed by their SteamID. */
    playersBySteamId: Record<string, PlayerAggregate>;
    /** The current health state of the incoming stream. */
    streamState: StreamState;
    /** Performance and reliability metrics of the stream. */
    streamMetrics: StreamMetrics;
    /** Reliability markers used for snapshot recovery logic. */
    streamWatermarks: StreamWatermarks;
    /** Total number of ticks successfully processed since instance creation. */
    totalTicks: number;
    /** Timestamp of the last processed tick. */
    lastProcessedAt: number | null;
}
/** Per-player rolling memory used for delta/event derivation. */
export interface PlayerMemoryState {
    /** Health points tracked to detect damage events. */
    health: number;
    /** Kill count tracked to detect kill events. */
    kills: number;
    /** Death count tracked to detect death events. */
    deaths: number;
    /** Flash intensity tracked to detect flash start/end events. */
    flashed: number;
    /** Account balance tracked to detect purchase/refund events. */
    money: number;
    /** List of currently held weapons used for transaction delta. */
    weapons: string[];
    /** Timestamp when the current flash effect started, if any. */
    flashStartTimestamp: number | null;
}
/** Mutable domain memory used between ticks. */
export interface GsiProcessorMemory {
    /** Map phase from the previous tick, used to detect map changes. */
    lastMapPhase: string | undefined;
    /** Round phase from the previous tick, used to detect round transitions. */
    lastRoundPhase: string | null;
    /** The winning team of the last concluded round. */
    lastRoundWinningTeam: TeamType | undefined;
    /** Counter of the current game round. */
    lastGameRound: number;
    /** Delta-tracking memory state for each player by SteamID. */
    players: Record<string, PlayerMemoryState>;
}
/** Base interface for all domain events emitted by the processor. */
export interface BaseEvent<TType extends string> {
    /** Identifier for the event type. */
    type: TType;
    /** Exact time the event was detected/inferred. */
    timestamp: number;
}
/** Base interface for events scoped to a specific round. */
export interface BaseRoundEvent<TType extends string> extends BaseEvent<TType> {
    /** The chronological round number when the event occurred. */
    roundNumber: number;
}
/** Base interface for events relating to a specific player's actions or state. */
export interface BasePlayerEvent<TType extends string> extends BaseRoundEvent<TType> {
    /** SteamID of the affected or acting player. Optional if player is unknown. */
    steamid?: string;
}
/** Emitted when a match/map session starts. */
export interface MatchStartedEvent extends BaseEvent<"match_started"> {
    /** Name of the loaded map. */
    mapName: string;
    /** The game mode being played (e.g., competitive). */
    mode: string;
}
/** Emitted when a match/map session ends. */
export interface MatchEndedEvent extends BaseEvent<"match_ended"> {
    /** Name of the map that just concluded. */
    mapName: string;
}
/** Emitted when a new round is created/detected. */
export interface RoundStartedEvent extends BaseRoundEvent<"round_started"> {
    /** The team the observing player belongs to, if local. */
    playerTeam: TeamType;
}
/** Emitted on freezetime -> live transition. */
export interface RoundLiveEvent extends BaseRoundEvent<"round_live"> {
}
/** Emitted on live -> over transition. */
export interface RoundOverEvent extends BaseRoundEvent<"round_over"> {
}
/** Emitted when a winner side is resolved for a round. */
export interface RoundWinnerEvent extends BaseRoundEvent<"round_winner"> {
    /** The team that won the round. */
    winnerTeam: TeamType;
}
/** Per-player kill event. */
export interface KillEvent extends BasePlayerEvent<"kill"> {
    /** Phase of the round during the kill. */
    roundPhase: PhaseRound;
    /** The weapon used to perform the kill. */
    weapon: string;
}
/** Per-player death event. */
export interface DeathEvent extends BasePlayerEvent<"death"> {
    /** Phase of the round during the death. */
    roundPhase: PhaseRound;
    /** The weapon equipped or responsible when the death occurred. */
    weapon: string;
}
/** Per-player received-damage event. */
export interface DamageReceivedEvent extends BasePlayerEvent<"damage_received"> {
    /** Phase of the round during the damage tick. */
    roundPhase: PhaseRound;
    /** Amount of damage points deducted from health. */
    damage: number;
    /** The weapon the player was holding when receiving damage. */
    weapon: string;
}
/** Per-player flash start marker. */
export interface FlashStartedEvent extends BasePlayerEvent<"flash_started"> {
}
/** Per-player flash completion marker with duration. */
export interface FlashEndedEvent extends BasePlayerEvent<"flash_ended"> {
    /** Total duration in milliseconds the player was flashed. */
    duration: number;
}
/** Per-player inferred weapon transaction event. */
export interface WeaponTransactionEvent extends BasePlayerEvent<"weapon_transaction"> {
    /** Phase of the round during the transaction. */
    roundPhase: PhaseRound;
    /** Whether the weapon was bought or refunded. */
    transactionType: "purchase" | "refund";
    /** System name of the transacted weapon. */
    weaponName: string;
    /** Inferred dollar value change of the transaction. */
    cost: number;
}
/** Emitted on first valid tick during cold start. */
export interface StreamColdStartedEvent extends BaseEvent<"stream_cold_started"> {
}
/** Emitted when stream transitions into a gap/degraded zone. */
export interface GapStartedEvent extends BaseEvent<"gap_started"> {
}
/** Emitted when stream exits gap and becomes healthy. */
export interface GapEndedEvent extends BaseEvent<"gap_ended"> {
}
/** Emitted when snapshot is rejected by quality gate. */
export interface SnapshotRejectedEvent extends BaseEvent<"snapshot_rejected"> {
    /** The quality assessment causing the rejection. */
    quality: SnapshotQuality;
}
/** Emitted when recovery concludes and stream is healthy again. */
export interface StreamRecoveredEvent extends BaseEvent<"stream_recovered"> {
}
/** Full event union emitted by the processor. */
export type GsiProcessorEvent = MatchStartedEvent | MatchEndedEvent | RoundStartedEvent | RoundLiveEvent | RoundOverEvent | RoundWinnerEvent | KillEvent | DeathEvent | DamageReceivedEvent | FlashStartedEvent | FlashEndedEvent | WeaponTransactionEvent | StreamColdStartedEvent | GapStartedEvent | GapEndedEvent | SnapshotRejectedEvent | StreamRecoveredEvent;
/** Return envelope for one domain tick reduction. */
export interface TickProcessingResult {
    /** The newly computed aggregate state. */
    state: GsiProcessorState;
    /** The updated mutable memory. */
    memory: GsiProcessorMemory;
    /** All domain events generated during this tick's derivation. */
    events: GsiProcessorEvent[];
}
