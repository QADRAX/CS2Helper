import type { WindowCapturePort } from "../../application/ports/windowCapturePort";
import { captureCs2ClientPng } from "../windowsCs2Capture";

export class WindowsCs2WindowCaptureAdapter implements WindowCapturePort {
  async captureCs2ClientPng(): Promise<Uint8Array> {
    return captureCs2ClientPng();
  }
}
