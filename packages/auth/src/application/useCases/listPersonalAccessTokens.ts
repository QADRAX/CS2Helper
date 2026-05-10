import type { AsyncUseCase } from "@cs2helper/shared";
import type { PersonalAccessTokenSummary } from "../../domain";
import type { PersonalAccessTokenRepositoryPort } from "../ports";

/**
 * Ports tuple order: `[patTokens]`.
 */
export const listPersonalAccessTokens: AsyncUseCase<
  [PersonalAccessTokenRepositoryPort],
  [userId: string],
  PersonalAccessTokenSummary[]
> = async ([patTokens], userId) => patTokens.listActiveForUser(userId);
