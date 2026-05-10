/**
 * Plaintext personal access tokens start with this prefix so API gateways can route verification
 * without attempting JWT signature validation first.
 */
export const PERSONAL_ACCESS_TOKEN_PREFIX = "cs2h_pat_" as const;

export function isPersonalAccessTokenPlain(plainToken: string): boolean {
  return plainToken.startsWith(PERSONAL_ACCESS_TOKEN_PREFIX);
}
