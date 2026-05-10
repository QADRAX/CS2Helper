import type { AsyncUseCase } from "@cs2helper/shared";
import { AuthDomainError } from "../../domain";
import { validateEmail } from "../../domain";
import { validatePassword } from "../../domain";
import type { PasswordHasherPort, RbacRepositoryPort, UserRepositoryPort } from "../ports";

/**
 * Sets password for an existing user with the `admin` role. For trusted recovery flows only.
 *
 * Ports tuple order: `[users, passwordHasher, rbac]`.
 */
export const resetRootAdminPassword: AsyncUseCase<
  [UserRepositoryPort, PasswordHasherPort, RbacRepositoryPort],
  [email: string, newPassword: string],
  { updated: boolean }
> = async ([users, passwordHasher, rbac], emailRaw, newPassword) => {
  const email = validateEmail(emailRaw);
  validatePassword(newPassword);

  const user = await users.findWithPasswordByEmail(email);
  if (!user) {
    throw new AuthDomainError("USER_NOT_FOUND", "User not found");
  }

  const roles = await rbac.getRoleNamesForUser(user.id);
  if (!roles.includes("admin")) {
    throw new AuthDomainError("NOT_ADMIN", "User is not an administrator");
  }

  const passwordHash = await passwordHasher.hash(newPassword);
  await users.updatePasswordHash(user.id, passwordHash);
  return { updated: true };
};
