import { CSState } from "../types/CSState";
import { Observer } from "../utils/Observer";

export function createGameStateObserver(ui: Electron.WebContents | null): Observer<CSState> {
  return (state: CSState) => {
    if(ui) {
      ui.send('game-state', state);
    }
  };
}
