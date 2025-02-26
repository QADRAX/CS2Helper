import { PhaseMap } from "../../types/CSGO";
import { CSState, isGameStatePlaying } from "../../types/CSState";
import { Observer } from "../Observer";

export function createGameStartObserver(onGameStart: (state: CSState) => void): Observer<CSState> {
  let lastPhase: PhaseMap | null = null;

  return (state: CSState) => {
    if (!isGameStatePlaying(state)) return;

    const currentPhase = state.map?.phase ?? null;

    if ((lastPhase === 'warmup' || lastPhase === 'intermission') && currentPhase === 'live') {
      onGameStart(state);
    }

    lastPhase = currentPhase;
  };
}
