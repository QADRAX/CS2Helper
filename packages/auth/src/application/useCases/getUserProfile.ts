import type { AsyncUseCase } from "@cs2helper/shared";
import type { UserProfile } from "../../domain";
import {
  AuthDomainError,
  PROFILE_READ_ANY_PERMISSION,
  effectiveKeysGrantPermission,
} from "../../domain";
import type { RbacRepositoryPort, UserProfileRepositoryPort } from "../ports";

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
    if (!effectiveKeysGrantPermission(keys, PROFILE_READ_ANY_PERMISSION)) {
      throw new AuthDomainError("FORBIDDEN", "Cannot read another user's profile");
    }
  }
  const profile = await profiles.findByUserId(subjectUserId);
  if (!profile) {
    throw new AuthDomainError("PROFILE_NOT_FOUND", "Profile not found");
  }
  return profile;
};
