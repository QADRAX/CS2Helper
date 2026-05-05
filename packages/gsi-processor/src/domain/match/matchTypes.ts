import type { PhaseRound, TeamType } from "../csgo/phases";

/** A contiguous flash effect window. */
export interface FlashRecords {
  /** Flash start timestamp. */
  timestamp: number;
  /** Duration in milliseconds. */
  duration: number;
}

export interface DamageRecord {
  /** Hit timestamp */
  timestamp: number;
  /** Round phase when damage was received */
  roundPhase: PhaseRound;
  /** Weapon held while receiving damage */
  equippedWeapon: string;
  damage: number;
  /** Flash intensity (0–255) at hit time */
  flashed: number;
  /** Smoke coverage (0–255) at hit time */
  smoked: number;
}

export interface KillRecord {
  /** Event timestamp. */
  timestamp: number;
  /** Round phase in which the kill was observed. */
  roundPhase: PhaseRound;
  /** Equipped weapon identifier. */
  weapon: string;
  /** Flash intensity (0-255). */
  flashed: number;
  /** Smoke intensity (0-255). */
  smoked: number;
}

export interface WeaponTransactionRecord {
  /** Event timestamp. */
  timestamp: number;
  /** Round phase in which the transaction was inferred. */
  roundPhase: PhaseRound;
  /** Buy or refund inference. */
  transactionType: "purchase" | "refund";
  /** Weapon identifier. */
  weaponName: string;
  /** Inferred cost/refund value. */
  cost: number;
}

export interface DeathRecord {
  /** Event timestamp. */
  timestamp: number;
  /** Round phase in which the death was observed. */
  roundPhase: PhaseRound;
  /** Equipped weapon identifier at death time. */
  equippedWeapon: string;
  /** Flash intensity (0-255). */
  flashed: number;
  /** Smoke intensity (0-255). */
  smoked: number;
}

/** Aggregate for one match round. */
export interface RoundData {
  /** Round number reported by GSI map slice. */
  roundNumber: number;
  /** First timestamp this round aggregate was created. */
  timestamp: number;
  /** Timestamp when freezetime -> live transition was detected. */
  roundLiveTimestamp?: number;
  /** Timestamp when live -> over transition was detected. */
  roundOverTimestamp?: number;
  /** Per-round kill events. */
  kills: KillRecord[];
  /** Per-round death events. */
  deaths: DeathRecord[];
  /** Per-round flash windows. */
  flashes: FlashRecords[];
  /** Per-round damage-received events. */
  damageReceived: DamageRecord[];
  /** Per-round weapon transaction inferences. */
  weaponTransactions: WeaponTransactionRecord[];
  /** Team associated with the tracked/player context at round start. */
  playerTeam: TeamType;
  /** Winner team when resolved. */
  winnerTeam?: TeamType;
}

/** Aggregate for one match/map session. */
export interface MatchData {
  /** Match mode (competitive, casual, etc.). */
  mode: string;
  /** Map name (e.g. de_dust2). */
  mapName: string;
  /** Match creation timestamp. */
  timestamp: number;
  /** Ordered rounds aggregated for this match. */
  rounds: RoundData[];
}
