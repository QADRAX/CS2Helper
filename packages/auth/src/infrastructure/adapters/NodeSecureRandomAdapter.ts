import { randomBytes } from "node:crypto";
import type { SecureRandomPort } from "../../application/ports";

export class NodeSecureRandomAdapter implements SecureRandomPort {
  randomBytes(length: number): Uint8Array {
    return new Uint8Array(randomBytes(length));
  }
}
