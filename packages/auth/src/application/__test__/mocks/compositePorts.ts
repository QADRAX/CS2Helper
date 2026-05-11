import { vi } from "vitest";
import type {
  ClockPort,
  JwtPort,
  RbacRepositoryPort,
  RefreshTokenStorePort,
  SecureRandomPort,
  SessionPolicyPort,
  UserRepositoryPort,
} from "../../ports";
import type { SessionIssuePortsTuple } from "../../useCases/issueSessionForUser";
import { createClockFake } from "./clock";
import { createJwtPortFake } from "./jwtPort";
import { createRbacRepositoryFake } from "./rbacRepository";
import { createRefreshTokenStoreFake } from "./refreshTokenStore";
import { createSecureRandomFake } from "./secureRandom";
import { createSessionPolicyFake } from "./sessionPolicy";
import { createUserRepositoryFake } from "./userRepository";

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
