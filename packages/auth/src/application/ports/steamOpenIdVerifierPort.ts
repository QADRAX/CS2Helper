export type SteamOpenIdVerifyResult =
  | {
      readonly valid: true;
      readonly steamId64: string;
      readonly accountName: string | null;
      readonly avatarUrl: string | null;
    }
  | { readonly valid: false; readonly reason?: string };

/**
 * Verifies a Steam OpenID 2.0 assertion via `check_authentication` against Steam.
 */
export interface SteamOpenIdVerifierPort {
  verifyOpenIdAssertion(
    params: Readonly<Record<string, string>>
  ): Promise<SteamOpenIdVerifyResult>;
}
