export interface WindowCapturePort {
  /** Encodes the CS2 client area as PNG bytes (alpha unused / opaque). */
  captureCs2ClientPng(): Promise<Uint8Array>;
}
