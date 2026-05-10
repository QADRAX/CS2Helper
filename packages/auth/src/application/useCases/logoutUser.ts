import type { AsyncUseCase } from "@cs2helper/shared";
import type { RefreshTokenStorePort } from "../ports";

/**
 * Revokes a refresh token (best-effort idempotent for unknown tokens).
 *
 * Ports tuple order: `[refreshTokens]`.
 */
export const logoutUser: AsyncUseCase<
  [RefreshTokenStorePort],
  [refreshTokenPlain: string],
  void
> = async ([refreshTokens], refreshTokenPlain) => {
  await refreshTokens.revokeByPlainToken(refreshTokenPlain);
};
