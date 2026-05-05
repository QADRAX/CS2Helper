import type { NormalizedSnapshot, WatcherMode, WatcherPayload } from "../csgo";
import type { PhaseRound, TeamType } from "../csgo/phases";
import type { MatchData } from "../match/matchTypes";
import type { SnapshotQuality, StreamMetrics, StreamState, StreamWatermarks } from "./stream";

/** Input snapshot type accepted by the processor API. */
export type CS2GameState = WatcherPayload | null;

/** Aggregated per-player projection kept in engine state. */
export interface PlayerAggregate {
  steamid: string;
  name: string;
  team: TeamType;
  health: number;
  money: number;
  kills: number;
  deaths: number;
  lastSeenAt: number;
}

/** Global aggregate state for one processor instance. */
export interface CoreEngineState {
  currentMatch: MatchData | null;
  lastGameState: WatcherPayload | null;
  lastSnapshot: NormalizedSnapshot | null;
  watcherMode: WatcherMode | null;
  playersBySteamId: Record<string, PlayerAggregate>;
  streamState: StreamState;
  streamMetrics: StreamMetrics;
  streamWatermarks: StreamWatermarks;
  totalTicks: number;
  lastProcessedAt: number | null;
}

/** Per-player rolling memory used for delta/event derivation. */
export interface PlayerMemoryState {
  health: number;
  kills: number;
  deaths: number;
  flashed: number;
  money: number;
  weapons: string[];
  flashStartTimestamp: number | null;
}

/** Mutable domain memory used between ticks. */
export interface CoreEngineMemory {
  lastMapPhase: string | undefined;
  lastRoundPhase: string | null;
  lastRoundWinningTeam: TeamType | undefined;
  lastGameRound: number;
  players: Record<string, PlayerMemoryState>;
}

/** Emitted when a match/map session starts. */
export interface MatchStartedEvent {
  type: "match_started";
  timestamp: number;
  mapName: string;
  mode: string;
}

/** Emitted when a match/map session ends. */
export interface MatchEndedEvent {
  type: "match_ended";
  timestamp: number;
  mapName: string;
}

/** Emitted when a new round is created/detected. */
export interface RoundStartedEvent {
  type: "round_started";
  timestamp: number;
  roundNumber: number;
  playerTeam: TeamType;
}

/** Emitted on freezetime -> live transition. */
export interface RoundLiveEvent {
  type: "round_live";
  timestamp: number;
  roundNumber: number;
}

/** Emitted on live -> over transition. */
export interface RoundOverEvent {
  type: "round_over";
  timestamp: number;
  roundNumber: number;
}

/** Emitted when a winner side is resolved for a round. */
export interface RoundWinnerEvent {
  type: "round_winner";
  timestamp: number;
  roundNumber: number;
  winnerTeam: TeamType;
}

/** Per-player kill event. */
export interface KillEvent {
  type: "kill";
  steamid?: string;
  timestamp: number;
  roundNumber: number;
  roundPhase: PhaseRound;
  weapon: string;
}

/** Per-player death event. */
export interface DeathEvent {
  type: "death";
  steamid?: string;
  timestamp: number;
  roundNumber: number;
  roundPhase: PhaseRound;
  weapon: string;
}

/** Per-player received-damage event. */
export interface DamageReceivedEvent {
  type: "damage_received";
  steamid?: string;
  timestamp: number;
  roundNumber: number;
  roundPhase: PhaseRound;
  damage: number;
  weapon: string;
}

/** Per-player flash start marker. */
export interface FlashStartedEvent {
  type: "flash_started";
  steamid?: string;
  timestamp: number;
  roundNumber: number;
}

/** Per-player flash completion marker with duration. */
export interface FlashEndedEvent {
  type: "flash_ended";
  steamid?: string;
  timestamp: number;
  roundNumber: number;
  duration: number;
}

/** Per-player inferred weapon transaction event. */
export interface WeaponTransactionEvent {
  type: "weapon_transaction";
  steamid?: string;
  timestamp: number;
  roundNumber: number;
  roundPhase: PhaseRound;
  transactionType: "purchase" | "refund";
  weaponName: string;
  cost: number;
}

/** Emitted on first valid tick during cold start. */
export interface StreamColdStartedEvent {
  type: "stream_cold_started";
  timestamp: number;
}

/** Emitted when stream transitions into a gap/degraded zone. */
export interface GapStartedEvent {
  type: "gap_started";
  timestamp: number;
}

/** Emitted when stream exits gap and becomes healthy. */
export interface GapEndedEvent {
  type: "gap_ended";
  timestamp: number;
}

/** Emitted when snapshot is rejected by quality gate. */
export interface SnapshotRejectedEvent {
  type: "snapshot_rejected";
  timestamp: number;
  quality: SnapshotQuality;
}

/** Emitted when recovery concludes and stream is healthy again. */
export interface StreamRecoveredEvent {
  type: "stream_recovered";
  timestamp: number;
}

/** Full event union emitted by the processor. */
export type CoreEngineEvent =
  | MatchStartedEvent
  | MatchEndedEvent
  | RoundStartedEvent
  | RoundLiveEvent
  | RoundOverEvent
  | RoundWinnerEvent
  | KillEvent
  | DeathEvent
  | DamageReceivedEvent
  | FlashStartedEvent
  | FlashEndedEvent
  | WeaponTransactionEvent
  | StreamColdStartedEvent
  | GapStartedEvent
  | GapEndedEvent
  | SnapshotRejectedEvent
  | StreamRecoveredEvent;

/** Return envelope for one domain tick reduction. */
export interface TickProcessingResult {
  state: CoreEngineState;
  memory: CoreEngineMemory;
  events: CoreEngineEvent[];
}
