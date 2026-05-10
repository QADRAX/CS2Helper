import { vi } from "vitest";
import type {
  ClockPort,
  JwtPort,
  PasswordHasherPort,
  RbacRepositoryPort,
  RefreshTokenStorePort,
  SecureRandomPort,
  SessionPolicyPort,
  UserProfileRepositoryPort,
  UserRepositoryPort,
} from "../../ports";
import type { SessionIssuePortsTuple } from "../../useCases/issueSessionForUser";
import { createClockFake } from "./clock";
import { createJwtPortFake } from "./jwtPort";
import { createPasswordHasherFake } from "./passwordHasher";
import { createRbacRepositoryFake } from "./rbacRepository";
import { createRefreshTokenStoreFake } from "./refreshTokenStore";
import { createSecureRandomFake } from "./secureRandom";
import { createSessionPolicyFake } from "./sessionPolicy";
import { createUserProfileRepositoryFake } from "./userProfileRepository";
import { createUserRepositoryFake } from "./userRepository";

export type RegisterUserPorts = [
  UserRepositoryPort,
  UserProfileRepositoryPort,
  RbacRepositoryPort,
  PasswordHasherPort,
  JwtPort,
  RefreshTokenStorePort,
  ClockPort,
  SecureRandomPort,
  SessionPolicyPort,
];

export function createRegisterUserPorts(overrides?: {
  users?: Partial<UserRepositoryPort>;
  profiles?: Partial<UserProfileRepositoryPort>;
  rbac?: Partial<RbacRepositoryPort>;
  passwordHasher?: Partial<PasswordHasherPort>;
  jwt?: Partial<JwtPort>;
  refresh?: Partial<RefreshTokenStorePort>;
  clock?: ClockPort;
  random?: SecureRandomPort;
  policy?: Partial<SessionPolicyPort>;
}): RegisterUserPorts {
  const users = createUserRepositoryFake(overrides?.users);
  const profiles = createUserProfileRepositoryFake(overrides?.profiles);
  const rbac = createRbacRepositoryFake({
    getEffectivePermissionKeysForUser: vi.fn(async () => ["users.profile.read"]),
    getRoleNamesForUser: vi.fn(async () => ["member"]),
    ...overrides?.rbac,
  });
  const passwordHasher = createPasswordHasherFake(overrides?.passwordHasher);
  const jwt = createJwtPortFake(overrides?.jwt);
  const refresh = createRefreshTokenStoreFake(overrides?.refresh);
  const clock = overrides?.clock ?? createClockFake();
  const random = overrides?.random ?? createSecureRandomFake();
  const policy = createSessionPolicyFake(overrides?.policy);
  return [
    users,
    profiles,
    rbac,
    passwordHasher,
    jwt,
    refresh,
    clock,
    random,
    policy,
  ];
}

export type AuthenticateUserPorts = [
  UserRepositoryPort,
  PasswordHasherPort,
  RbacRepositoryPort,
  JwtPort,
  RefreshTokenStorePort,
  ClockPort,
  SecureRandomPort,
  SessionPolicyPort,
];

export function createAuthenticateUserPorts(overrides?: {
  users?: Partial<UserRepositoryPort>;
  passwordHasher?: Partial<PasswordHasherPort>;
  rbac?: Partial<RbacRepositoryPort>;
  jwt?: Partial<JwtPort>;
  refresh?: Partial<RefreshTokenStorePort>;
  clock?: ClockPort;
  random?: SecureRandomPort;
  policy?: Partial<SessionPolicyPort>;
}): AuthenticateUserPorts {
  const users = createUserRepositoryFake(overrides?.users);
  const passwordHasher = createPasswordHasherFake(overrides?.passwordHasher);
  const rbac = createRbacRepositoryFake({
    getEffectivePermissionKeysForUser: vi.fn(async () => ["p1"]),
    getRoleNamesForUser: vi.fn(async () => ["member"]),
    ...overrides?.rbac,
  });
  const jwt = createJwtPortFake(overrides?.jwt);
  const refresh = createRefreshTokenStoreFake(overrides?.refresh);
  const clock = overrides?.clock ?? createClockFake();
  const random = overrides?.random ?? createSecureRandomFake();
  const policy = createSessionPolicyFake(overrides?.policy);
  return [
    users,
    passwordHasher,
    rbac,
    jwt,
    refresh,
    clock,
    random,
    policy,
  ];
}

export type RefreshAccessTokenPorts = [
  UserRepositoryPort,
  RefreshTokenStorePort,
  JwtPort,
  ClockPort,
  SecureRandomPort,
  RbacRepositoryPort,
  SessionPolicyPort,
];

export function createRefreshAccessTokenPorts(overrides?: {
  users?: Partial<UserRepositoryPort>;
  refresh?: Partial<RefreshTokenStorePort>;
  jwt?: Partial<JwtPort>;
  clock?: ClockPort;
  random?: SecureRandomPort;
  rbac?: Partial<RbacRepositoryPort>;
  policy?: Partial<SessionPolicyPort>;
}): RefreshAccessTokenPorts {
  const users = createUserRepositoryFake(overrides?.users);
  const refresh = createRefreshTokenStoreFake(overrides?.refresh);
  const jwt = createJwtPortFake(overrides?.jwt);
  const clock = overrides?.clock ?? createClockFake();
  const random = overrides?.random ?? createSecureRandomFake();
  const rbac = createRbacRepositoryFake({
    getEffectivePermissionKeysForUser: vi.fn(async () => ["p1"]),
    getRoleNamesForUser: vi.fn(async () => ["member"]),
    ...overrides?.rbac,
  });
  const policy = createSessionPolicyFake(overrides?.policy);
  return [users, refresh, jwt, clock, random, rbac, policy];
}

export function createSessionIssuePorts(overrides?: {
  jwt?: Partial<JwtPort>;
  refresh?: Partial<RefreshTokenStorePort>;
  clock?: ClockPort;
  random?: SecureRandomPort;
  rbac?: Partial<RbacRepositoryPort>;
  policy?: Partial<SessionPolicyPort>;
}): SessionIssuePortsTuple {
  const jwt = createJwtPortFake(overrides?.jwt);
  const refresh = createRefreshTokenStoreFake(overrides?.refresh);
  const clock = overrides?.clock ?? createClockFake();
  const random = overrides?.random ?? createSecureRandomFake();
  const rbac = createRbacRepositoryFake({
    getEffectivePermissionKeysForUser: vi.fn(async () => ["p1"]),
    getRoleNamesForUser: vi.fn(async () => ["member"]),
    ...overrides?.rbac,
  });
  const policy = createSessionPolicyFake(overrides?.policy);
  return [jwt, refresh, clock, random, rbac, policy];
}
