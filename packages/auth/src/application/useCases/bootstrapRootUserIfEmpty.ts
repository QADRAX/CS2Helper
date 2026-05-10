import type { AsyncUseCase } from "@cs2helper/shared";
import { AuthDomainError } from "../../domain";
import { validateEmail } from "../../domain";
import { validatePassword } from "../../domain";
import type {
  PasswordHasherPort,
  RbacRepositoryPort,
  UserProfileRepositoryPort,
  UserRepositoryPort,
} from "../ports";

/**
 * Creates the first `admin` user when no user has the admin role yet.
 * Intended only for trusted host bootstrap. Idempotent when an admin exists.
 *
 * Ports tuple order: `[users, profiles, rbac, passwordHasher]`.
 */
export const bootstrapRootUserIfEmpty: AsyncUseCase<
  [UserRepositoryPort, UserProfileRepositoryPort, RbacRepositoryPort, PasswordHasherPort],
  [input: { email: string; password: string }],
  { created: boolean }
> = async ([users, profiles, rbac, passwordHasher], input) => {
  if (await rbac.existsUserWithRole("admin")) {
    return { created: false };
  }

  const email = validateEmail(input.email);
  validatePassword(input.password);

  const existing = await users.findWithPasswordByEmail(email);
  if (existing) {
    throw new AuthDomainError("EMAIL_TAKEN", "Email is already registered");
  }

  const passwordHash = await passwordHasher.hash(input.password);
  const { id: userId } = await users.createUser({ email, passwordHash });
  await profiles.createEmptyProfile(userId);
  await rbac.assignRoleToUserByRoleName(userId, "admin");

  return { created: true };
};
