export interface SecureRandomPort {
  randomBytes(length: number): Uint8Array;
}
