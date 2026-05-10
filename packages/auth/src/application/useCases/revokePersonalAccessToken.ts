import type { AsyncUseCase } from "@cs2helper/shared";
import { AuthDomainError } from "../../domain";
import type { PersonalAccessTokenRepositoryPort } from "../ports";

/**
 * Ports tuple order: `[patTokens]`.
 */
export const revokePersonalAccessToken: AsyncUseCase<
  [PersonalAccessTokenRepositoryPort],
  [userId: string, tokenId: string],
  void
> = async ([patTokens], userId, tokenId) => {
  const ok = await patTokens.revokeForUser(userId, tokenId);
  if (!ok) {
    throw new AuthDomainError("PERSONAL_ACCESS_TOKEN_NOT_FOUND", "Personal access token not found");
  }
};
