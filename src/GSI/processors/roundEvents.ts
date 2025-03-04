import { GameState, PhaseRound, TeamType } from '../../types/CSGO';
import { updateIfExists } from '../../utils/GenericStateContainer';
import { matchState, updateRoundIfExists } from '../state/matchState';
import { EventProcessor } from '../../types/EventProcessor';

let lastGameRound: number = 0;
let lastRoundPhase: PhaseRound | null = null;
let lastRoundWiningTeam: TeamType | undefined;

export const processRoundEvents: EventProcessor<GameState> = (gameState, timestamp) => {
  if(!gameState.player || !gameState.round || !gameState.map) return;

  const roundPhase = gameState.round.phase;
  const gameRound = gameState.map.round;
  const roundWiningTeam = gameState.round.win_team;
  const currentMatch = matchState.get();
  const currentTeam = gameState.player.team;

  if (!currentMatch) return;

  const currentMatchRound = currentMatch.rounds.find(
    (r) => r.roundNumber === gameRound,
  );

  const lastMatchRound = currentMatch.rounds.find(
    (r) => r.roundNumber === lastGameRound,
  )

  // Iniciar una nueva ronda cuando entramos en "freezetime"
  if (
    !currentMatchRound &&
    roundPhase === 'freezetime' &&
    lastRoundPhase !== 'freezetime'
  ) {
    console.log(`🔄 New round detected: ${gameRound}`);
    updateIfExists(matchState, (match) => {
      match.rounds.push({
        timestamp,
        roundNumber: gameRound,
        kills: [],
        deaths: [],
        damageReceived: [],
        weaponTransactions: [],
        flashes: [],
        playerTeam: currentTeam,
      });

      return match;
    });
  }

  // Detectar fin de la ronda cuando pasa de "freezetime" a "live"
  if (currentMatchRound && lastRoundPhase === 'freezetime' && roundPhase === 'live') {
    console.log(`🔜 Round ${lastGameRound} start`);
    updateRoundIfExists(gameRound, (currentRound) => {
      currentRound.roundLiveTimestamp = timestamp;
    });
  }


  // Detectar fin de la ronda cuando pasa de "live" a "over"
  if (lastMatchRound && lastRoundPhase === 'live' && roundPhase === 'over') {
    console.log(`🔚 Round ${lastGameRound} ended`);
    updateRoundIfExists(lastGameRound, (currentRound) => {
      currentRound.roundOverTimestamp = timestamp;
    });
  }

  // Detectar ganador de la ronda cuando cambia el 'win_team'.
  if (lastMatchRound && lastRoundWiningTeam !== roundWiningTeam) {
    const playerTeam = gameState.player.team;
    if (playerTeam === roundWiningTeam) {
      console.log(`🔚 You win this round!`);
    } else {
      console.log(`🔚 You lose this round!`);
    }
    updateRoundIfExists(lastGameRound, (currentRound) => {
      currentRound.winnerTeam = roundWiningTeam;
    });
  }

  lastRoundWiningTeam = roundWiningTeam;
  lastRoundPhase = roundPhase;
  lastGameRound = gameRound;
};
