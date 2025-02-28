import { GameState, PhaseRound } from './CSGO';

export type CSState = GameState | null;

export interface KillRecord {
  weapon: string;
  timestamp: number;
}

export interface DeathRecord {
  timestamp: number;
  roundPhase: PhaseRound;
}

export interface RoundData {
  roundNumber: number;
  kills: KillRecord[];
  deaths: DeathRecord[];
}

export interface MatchData {
  matchId: string;
  rounds: RoundData[];
}
