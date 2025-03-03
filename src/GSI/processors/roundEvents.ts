import { GameState, PhaseRound, TeamType } from '../../types/CSGO';
import { updateIfExists } from '../../utils/GenericStateContainer';
import { matchState, updateRoundIfExists } from '../state/matchState';

let lastGameRound: number = 0;
let lastRoundPhase: PhaseRound | null = null;
let lastRoundWiningTeam: TeamType | undefined;

export const processRoundEvents = (gameState: Required<GameState>) => {
  const roundPhase = gameState.round.phase;
  const gameRound = gameState.map.round;
  const roundWiningTeam = gameState.round.win_team;
  const currentMatch = matchState.get();

  if (!currentMatch) return;

  const currentMatchRound = currentMatch.rounds.find(
    (r) => r.roundNumber === gameRound,
  );

  // Iniciar una nueva ronda cuando entramos en "freezetime"
  if (
    !currentMatchRound &&
    roundPhase === 'freezetime' &&
    lastRoundPhase !== 'freezetime'
  ) {
    console.log(`🔄 New round detected: ${gameRound}`);
    updateIfExists(matchState, (match) => {
      match.rounds.push({
        timestamp: gameState.provider.timestamp,
        roundNumber: gameRound,
        kills: [],
        deaths: [],
        damageReceived: [],
        weaponTransactions: [],
        playerTeam: gameState.player.team,
      });

      return match;
    });
  }

  // Detectar fin de la ronda cuando pasa de "live" a "over"
  if (currentMatchRound && lastRoundPhase === 'live' && roundPhase === 'over') {
    console.log(`🔚 Round ${lastGameRound} ended`);
    updateRoundIfExists(lastGameRound, (currentRound) => {
      currentRound.roundOverTimestamp = gameState.provider.timestamp;
    });
  }

  // Detectar ganador de la ronda cuando cambia el 'win_team'.
  if (currentMatchRound && lastRoundWiningTeam !== roundWiningTeam) {
    const playerTeam = gameState.player.team;
    if (playerTeam === roundWiningTeam) {
      console.log(`🔚 You win this round!`);
    } else {
      console.log(`🔚 You lose this round!`);
    }
    updateRoundIfExists(gameRound, (currentRound) => {
      currentRound.winnerTeam = roundWiningTeam;
    });
  }

  lastRoundWiningTeam = roundWiningTeam;
  lastRoundPhase = roundPhase;
  lastGameRound = gameRound;
};
