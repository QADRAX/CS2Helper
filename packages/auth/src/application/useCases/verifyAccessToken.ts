import type { AsyncUseCase } from "@cs2helper/shared";
import type { AccessTokenClaims } from "../../domain";
import type { JwtPort } from "../ports";

/**
 * Ports tuple order: `[jwt]`.
 */
export const verifyAccessToken: AsyncUseCase<[JwtPort], [accessToken: string], AccessTokenClaims> =
  async ([jwt], accessToken) => jwt.verifyAccess(accessToken);
