import type { AsyncUseCase } from "@cs2helper/shared";
import type { UserProfile, UserProfileUpdate } from "../../domain";
import {
  AuthDomainError,
  PROFILE_UPDATE_ANY_PERMISSION,
  effectiveKeysGrantPermission,
} from "../../domain";
import type { RbacRepositoryPort, UserProfileRepositoryPort } from "../ports";

/**
 * Ports tuple order: `[profiles, rbac]`.
 */
export const updateUserProfile: AsyncUseCase<
  [UserProfileRepositoryPort, RbacRepositoryPort],
  [subjectUserId: string, actorUserId: string, patch: UserProfileUpdate],
  UserProfile
> = async ([profiles, rbac], subjectUserId, actorUserId, patch) => {
  if (subjectUserId !== actorUserId) {
    const keys = await rbac.getEffectivePermissionKeysForUser(actorUserId);
    if (!effectiveKeysGrantPermission(keys, PROFILE_UPDATE_ANY_PERMISSION)) {
      throw new AuthDomainError("FORBIDDEN", "Cannot update another user's profile");
    }
  }
  const existing = await profiles.findByUserId(subjectUserId);
  if (!existing) {
    throw new AuthDomainError("PROFILE_NOT_FOUND", "Profile not found");
  }
  return profiles.updateProfile(subjectUserId, patch);
};
