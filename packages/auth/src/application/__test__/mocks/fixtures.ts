import type { Permission, Role, User, UserProfile } from "../../../domain";

export function sampleUser(overrides: Partial<User> = {}): User {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    id: "user-1",
    steamId: "76561198000000001",
    displayName: "Player",
    avatarUrl: null,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function sampleUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    userId: "user-1",
    displayName: "Display",
    avatarUrl: null,
    updatedAt: now,
    ...overrides,
  };
}

export function sampleRole(overrides: Partial<Role> = {}): Role {
  return {
    id: "role-1",
    name: "moderator",
    description: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

export function samplePermission(overrides: Partial<Permission> = {}): Permission {
  return {
    id: "perm-1",
    key: "team.invite",
    description: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}
