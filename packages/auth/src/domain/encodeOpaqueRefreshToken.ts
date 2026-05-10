/**
 * Encodes random bytes as an opaque refresh token string (base64url).
 */
export function encodeOpaqueRefreshToken(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}
