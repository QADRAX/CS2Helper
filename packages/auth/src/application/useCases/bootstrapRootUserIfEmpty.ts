import type { AsyncUseCase } from "@cs2helper/shared";
import { AuthDomainError } from "../../domain";
import type {
  RbacRepositoryPort,
  UserProfileRepositoryPort,
  UserRepositoryPort,
} from "../ports";

/**
 * Creates the first `admin` user when no user has the admin role yet.
 * Intended only for trusted host bootstrap. Idempotent when an admin exists.
 *
 * Ports tuple order: `[users, profiles, rbac]`.
 */
export const bootstrapRootUserIfEmpty: AsyncUseCase<
  [
    UserRepositoryPort,
    UserProfileRepositoryPort,
    RbacRepositoryPort,
  ],
  [
    input: {
      steamId64: string;
      displayName?: string | null;
      avatarUrl?: string | null;
    },
  ],
  { created: boolean }
> = async ([users, profiles, rbac], input) => {
  if (await rbac.existsUserWithRole("admin")) {
    return { created: false };
  }

  const steamId64 = input.steamId64.trim();
  if (!steamId64) {
    throw new AuthDomainError("STEAM_OPENID_INVALID", "Missing steamId64 for bootstrap admin");
  }

  const { id: userId } = await users.createUser({ steamId: steamId64 });
  await profiles.createEmptyProfile(userId);
  await profiles.updateProfile(userId, {
    displayName: input.displayName?.trim() ?? null,
    avatarUrl: input.avatarUrl?.trim() ?? null,
  });
  await rbac.assignRoleToUserByRoleName(userId, "admin");

  return { created: true };
};
