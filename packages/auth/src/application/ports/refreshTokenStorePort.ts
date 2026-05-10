export interface RefreshTokenStorePort {
  saveForUser(params: {
    userId: string;
    tokenPlain: string;
    expiresAt: Date;
  }): Promise<void>;

  /**
   * If the old token is valid and not expired/revoked, revoke it and persist the new token.
   */
  rotate(params: {
    oldTokenPlain: string;
    newTokenPlain: string;
    newExpiresAt: Date;
  }): Promise<{ userId: string } | null>;

  revokeByPlainToken(tokenPlain: string): Promise<void>;
}
