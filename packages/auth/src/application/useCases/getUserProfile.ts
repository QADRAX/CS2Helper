import type { AsyncUseCase } from "@cs2helper/shared";
import type { UserProfile } from "../../domain";
import { AuthDomainError } from "../../domain";
import type { RbacRepositoryPort, UserProfileRepositoryPort } from "../ports";

/** Permission key seeded for cross-user profile reads (admin). */
export const PROFILE_READ_ANY_PERMISSION = "users.profile.read_any" as const;

/**
 * Ports tuple order: `[profiles, rbac]`.
 */
export const getUserProfile: AsyncUseCase<
  [UserProfileRepositoryPort, RbacRepositoryPort],
  [subjectUserId: string, actorUserId: string],
  UserProfile
> = async ([profiles, rbac], subjectUserId, actorUserId) => {
  if (subjectUserId !== actorUserId) {
    const keys = await rbac.getEffectivePermissionKeysForUser(actorUserId);
    if (!keys.includes(PROFILE_READ_ANY_PERMISSION)) {
      throw new AuthDomainError("FORBIDDEN", "Cannot read another user's profile");
    }
  }
  const profile = await profiles.findByUserId(subjectUserId);
  if (!profile) {
    throw new AuthDomainError("PROFILE_NOT_FOUND", "Profile not found");
  }
  return profile;
};
