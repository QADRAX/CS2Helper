import { CSState, isGameStatePlaying } from "../../types/CSState";
import { Observer } from "../Observer";

export function createRoundEndObserver(
  onRoundEnd: (state: CSState) => void
): Observer<CSState> {
  let lastPhase: 'live' | 'freezetime' | 'over' | null = null;

  return (state: CSState) => {
    if (!isGameStatePlaying(state)) return;

    const currentPhase = state.round?.phase ?? null;

    if ((lastPhase === 'live' || lastPhase === 'freezetime') && currentPhase === 'over') {
      onRoundEnd(state);
    }

    lastPhase = currentPhase;
  };
}
