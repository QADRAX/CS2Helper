export interface CreatePersonalAccessTokenInput {
  label?: string | null;
  /** When set, the token stops working after this instant. Omit or `null` for no expiry. */
  expiresAt?: Date | null;
}

export interface PersonalAccessTokenCreated {
  id: string;
  plainToken: string;
  label: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  tokenPrefix: string;
}

export interface PersonalAccessTokenSummary {
  id: string;
  label: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  lastUsedAt: Date | null;
  tokenPrefix: string;
}
