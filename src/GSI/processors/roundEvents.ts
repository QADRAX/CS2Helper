import { GameState, PhaseRound, TeamType } from '../../types/CSGO';
import { updateIfExists } from '../../utils/GenericStateContainer';
import { matchState, updateRoundIfExists } from '../state/matchState';

let lastRoundPhase: PhaseRound | null = null;
let lastRoundWiningTeam: TeamType | undefined;

export const processRoundEvents = (gameState: Required<GameState>) => {
  const roundPhase = gameState.round.phase;
  const gameRound = gameState.map.round;
  const roundWiningTeam = gameState.round.win_team;
  const currentMatch = matchState.get();

  if (!currentMatch) return;

  // Iniciar una nueva ronda cuando entramos en "freezetime"
  if (roundPhase === 'freezetime' && lastRoundPhase !== 'freezetime') {
    if (!currentMatch.rounds.some((r) => r.roundNumber === gameRound)) {
      console.log(`🔄 New round detected: ${gameRound}`);
      updateIfExists(matchState, (match) => {
        match.rounds.push({
          timestamp: gameState.provider.timestamp,
          roundNumber: gameRound,
          kills: [],
          deaths: [],
          damageReceived: [],
          playerTeam: gameState.player.team,

        });

        return match;
      });
    }
  }

  // Detectar fin de la ronda cuando pasa de "live" a "over"
  if (lastRoundPhase === 'live' && roundPhase === 'over') {
    console.log(`🔚 Round ${gameRound} ended`);
    updateRoundIfExists(gameRound, (currentRound) => {
      currentRound.roundOverTimestamp = gameState.provider.timestamp;
    });
  }

  // Detectar ganador de la ronda cuando cambia el 'win_team'.
  if(lastRoundWiningTeam !== roundWiningTeam) {
    const playerTeam = gameState.player.team;
    if(playerTeam === roundWiningTeam) {
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
};
