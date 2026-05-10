import type { ForegroundPort } from "../../application/ports/foregroundPort";
import { isCs2ForegroundWindow } from "../windowsCs2Capture";

export class WindowsCs2ForegroundAdapter implements ForegroundPort {
  async isCs2Foreground(): Promise<boolean> {
    if (process.platform !== "win32") {
      return false;
    }
    return isCs2ForegroundWindow();
  }
}
