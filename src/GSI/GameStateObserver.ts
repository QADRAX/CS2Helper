import { Channels } from "../main/preload";
import { Observer } from "../utils/Observer";

export function createUIObserver<T>(
  ui: Electron.WebContents | null,
  channel: Channels,
): Observer<T> {
  return (state: T) => {
    if(ui) {
      ui.send(channel, state);
    }
  }
}
