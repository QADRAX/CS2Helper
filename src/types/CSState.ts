import { GameState, PhaseRound, TeamType } from './CSGO';

export type CSState = GameState | null;

export type ValidGameState = Required<GameState>;

export function isValidGameState(
  gameState: CSState,
): gameState is ValidGameState {
  return (
    !!gameState && !!gameState.player && !!gameState.provider && !!gameState.map
  );
}

export interface DamageRecord {
  /**
   * Timestamp del hit
   */
  timestamp: number;
  /**
   * Fase de la ronda cuando se recibió el hit
   */
  roundPhase: PhaseRound;
  /**
   * Arma equipada mientras el player recibio daño
   */
  equippedWeapon: string;
  /**
   * Daño infligido en el hit
   */
  damage: number;
  /**
   * Valor de flashed al momento del hit (hasta 255)
   */
  flashed: number;
  /**
   * Valor de smoked al momento del hit (hasta 255)
   */
  smoked: number;
}

export interface KillRecord {
  /**
   * Timestamp de la kill
   */
  timestamp: number;
  /**
   * Fase de la ronda
   */
  roundPhase: PhaseRound;
  /**
   * Arma del kill
   */
  weapon: string;
  /**
   * Indica cuanto de flaseado estaba el jugador cuando hizo la kill, hasta 255
   */
  flashed: number;
  /**
   * Indica cuanto de cubierto por el humo estaba el jugador cuando hizo la kill, hasta 255
   */
  smoked: number;
}

export interface DeathRecord {
  /**
   * Timestamp de la muerte
   */
  timestamp: number;
  /**
   * Fase de la ronda donde el player murió
   */
  roundPhase: PhaseRound;
  /**
   * Arma equipada mientras el player la palmo
   */
  equippedWeapon: string;
  /**
   * Indica cuanto de flaseado estaba el jugador cuando murio, hasta 255
   */
  flashed: number;
  /**
   * Indica cuanto de cubierto por el humo estaba el jugador cuando murio, hasta 255
   */
  smoked: number;
}

export interface RoundData {
  /**
   * Número de ronda
   */
  roundNumber: number;
  /**
   * Timestamp de inicio de la ronda
   */
  timestamp: number;
  /**
   * Timestamp de cuando el round phase pasa a 'over'
   */
  roundOverTimestamp?: number;
  /**
   * Kills del jugador
   */
  kills: KillRecord[];
  /**
   * Muertes del jugador en la ronda
   */
  deaths: DeathRecord[];
  /**
   * Daño recibido del jugador en la ronda
   */
  damageReceived: DamageRecord[];
  /**
   * Equipo del jugador
   */
  playerTeam: TeamType;
  /**
   * Equipo ganador de la ronda
   */
  winnerTeam?: TeamType;
}

export interface MatchData {
  mode: string;
  mapName: string;
  timestamp: number;
  rounds: RoundData[];
}
