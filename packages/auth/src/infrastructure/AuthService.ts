import { withPortsAsync } from "@cs2helper/shared";
import type { Pool } from "pg";
import type { AuthApp } from "../application/AuthApp";
import {
  isPersonalAccessTokenPlain,
  type AccessTokenClaims,
  type AuthTokens,
  type CreateInvitationInput,
  type CreatePersonalAccessTokenInput,
  type HostCreateInvitationInput,
  type Permission,
  type PersonalAccessTokenCreated,
  type PersonalAccessTokenSummary,
  type RegisterUserInput,
  type Role,
  type UserProfile,
  type UserProfileUpdate,
} from "../domain";
import {
  AUTH_INVITATIONS_MANAGE_PERMISSION,
  AUTH_RBAC_MANAGE_PERMISSION,
} from "../domain";
import type { SessionPolicyPort } from "../application/ports";
import { assertUserHasPermission } from "../application/useCases/assertUserHasPermission";
import { assignPermissionToRole } from "../application/useCases/assignPermissionToRole";
import { assignRoleToUser } from "../application/useCases/assignRoleToUser";
import { authenticateUser } from "../application/useCases/authenticateUser";
import { createInvitation } from "../application/useCases/createInvitation";
import { createPersonalAccessToken } from "../application/useCases/createPersonalAccessToken";
import { createPermission } from "../application/useCases/createPermission";
import { createRole } from "../application/useCases/createRole";
import { deleteRole } from "../application/useCases/deleteRole";
import { getEffectivePermissions } from "../application/useCases/getEffectivePermissions";
import { getUserProfile } from "../application/useCases/getUserProfile";
import { listPermissions } from "../application/useCases/listPermissions";
import { listPersonalAccessTokens } from "../application/useCases/listPersonalAccessTokens";
import { listRoles } from "../application/useCases/listRoles";
import { logoutUser } from "../application/useCases/logoutUser";
import { refreshAccessToken } from "../application/useCases/refreshAccessToken";
import { registerUser } from "../application/useCases/registerUser";
import { removeRoleFromUser } from "../application/useCases/removeRoleFromUser";
import { revokeInvitation } from "../application/useCases/revokeInvitation";
import { revokePersonalAccessToken } from "../application/useCases/revokePersonalAccessToken";
import { revokePermissionFromRole } from "../application/useCases/revokePermissionFromRole";
import { updateUserProfile } from "../application/useCases/updateUserProfile";
import { verifyAccessToken } from "../application/useCases/verifyAccessToken";
import { verifyPersonalAccessToken } from "../application/useCases/verifyPersonalAccessToken";
import { DrizzleRbacRepository } from "./adapters/DrizzleRbacRepository";
import { DrizzleRefreshTokenStore } from "./adapters/DrizzleRefreshTokenStore";
import { DrizzleUserProfileRepository } from "./adapters/DrizzleUserProfileRepository";
import { DrizzleInvitationRepository } from "./adapters/DrizzleInvitationRepository";
import { DrizzlePersonalAccessTokenRepository } from "./adapters/DrizzlePersonalAccessTokenRepository";
import { DrizzleUserRepository } from "./adapters/DrizzleUserRepository";
import { JoseJwtAdapter } from "./adapters/JoseJwtAdapter";
import { NodeSecureRandomAdapter } from "./adapters/NodeSecureRandomAdapter";
import { ScryptPasswordHasher } from "./adapters/ScryptPasswordHasher";
import { SystemClockAdapter } from "./adapters/SystemClockAdapter";
import { createAuthDb } from "./db/createAuthDb";

export type AuthServiceOptions = {
  jwtSecret: string;
  jwtIssuer?: string;
  jwtAudience?: string;
  accessTokenTtlSec: number;
  refreshTokenTtlSec: number;
  defaultRegistrationRoleName: string;
  /** When true, signup requires a valid {@link RegisterUserInput.invitationPlainCode}. Default false. */
  requireInvitationForRegister?: boolean;
};

/**
 * Composition root: PostgreSQL + JWT session API for hosts such as Next.js route handlers.
 */
export class AuthService implements AuthApp {
  private readonly users: DrizzleUserRepository;
  private readonly profiles: DrizzleUserProfileRepository;
  private readonly rbac: DrizzleRbacRepository;
  private readonly refreshTokens: DrizzleRefreshTokenStore;
  private readonly passwordHasher: ScryptPasswordHasher;
  private readonly jwt: JoseJwtAdapter;
  private readonly clock: SystemClockAdapter;
  private readonly random: NodeSecureRandomAdapter;
  private readonly sessionPolicy: SessionPolicyPort;
  private readonly invitations: DrizzleInvitationRepository;
  private readonly patTokens: DrizzlePersonalAccessTokenRepository;

  private readonly register: (input: RegisterUserInput) => Promise<AuthTokens>;
  private readonly login: (email: string, password: string) => Promise<AuthTokens>;
  private readonly refresh: (refreshTokenPlain: string) => Promise<AuthTokens>;
  private readonly logoutBound: (refreshTokenPlain: string) => Promise<void>;
  private readonly verify: (accessToken: string) => Promise<AccessTokenClaims>;
  private readonly verifyPat: (plainToken: string) => Promise<AccessTokenClaims>;
  private readonly assertPermission: (userId: string, permissionKey: string) => Promise<void>;
  private readonly effectivePermissions: (userId: string) => Promise<string[]>;
  private readonly profileGet: (subjectUserId: string, actorUserId: string) => Promise<UserProfile>;
  private readonly profileUpdate: (
    subjectUserId: string,
    actorUserId: string,
    patch: UserProfileUpdate
  ) => Promise<UserProfile>;

  private readonly rbacCreateRole: (
    name: string,
    description?: string | null
  ) => Promise<{ id: string }>;
  private readonly rbacDeleteRole: (roleName: string) => Promise<void>;
  private readonly rbacCreatePermission: (
    key: string,
    description?: string | null
  ) => Promise<{ id: string }>;
  private readonly rbacAssignPermission: (roleName: string, permissionKey: string) => Promise<void>;
  private readonly rbacRevokePermission: (roleName: string, permissionKey: string) => Promise<void>;
  private readonly rbacAssignRole: (userId: string, roleName: string) => Promise<void>;
  private readonly rbacRemoveRole: (userId: string, roleName: string) => Promise<void>;
  private readonly rbacListRoles: () => Promise<Role[]>;
  private readonly rbacListPermissions: () => Promise<Permission[]>;

  private readonly inviteCreate: (
    createdByUserId: string,
    input: CreateInvitationInput
  ) => Promise<{ plainCode: string; invitationId: string; expiresAt: Date }>;
  private readonly inviteRevoke: (invitationId: string) => Promise<void>;

  private readonly patCreate: (
    userId: string,
    input: CreatePersonalAccessTokenInput
  ) => Promise<PersonalAccessTokenCreated>;
  private readonly patList: (userId: string) => Promise<PersonalAccessTokenSummary[]>;
  private readonly patRevoke: (userId: string, tokenId: string) => Promise<void>;

  constructor(pool: Pool, options: AuthServiceOptions) {
    const db = createAuthDb(pool);
    this.clock = new SystemClockAdapter();
    this.users = new DrizzleUserRepository(db);
    this.profiles = new DrizzleUserProfileRepository(db);
    this.rbac = new DrizzleRbacRepository(db);
    this.invitations = new DrizzleInvitationRepository(db, this.clock);
    this.patTokens = new DrizzlePersonalAccessTokenRepository(db, this.clock);
    this.refreshTokens = new DrizzleRefreshTokenStore(db, this.clock);
    this.passwordHasher = new ScryptPasswordHasher();
    this.jwt = new JoseJwtAdapter({
      secret: options.jwtSecret,
      issuer: options.jwtIssuer,
      audience: options.jwtAudience,
      accessTokenTtlSec: options.accessTokenTtlSec,
      clock: this.clock,
    });
    this.random = new NodeSecureRandomAdapter();
    this.sessionPolicy = {
      accessTokenTtlSec: options.accessTokenTtlSec,
      refreshTokenTtlSec: options.refreshTokenTtlSec,
      defaultRegistrationRoleName: options.defaultRegistrationRoleName,
      requireInvitationForRegister: options.requireInvitationForRegister ?? false,
    };

    this.register = withPortsAsync(registerUser, [
      this.users,
      this.profiles,
      this.rbac,
      this.passwordHasher,
      this.jwt,
      this.refreshTokens,
      this.clock,
      this.random,
      this.sessionPolicy,
      this.invitations,
    ]);
    this.login = withPortsAsync(authenticateUser, [
      this.users,
      this.passwordHasher,
      this.rbac,
      this.jwt,
      this.refreshTokens,
      this.clock,
      this.random,
      this.sessionPolicy,
    ]);
    this.refresh = withPortsAsync(refreshAccessToken, [
      this.users,
      this.refreshTokens,
      this.jwt,
      this.clock,
      this.random,
      this.rbac,
      this.sessionPolicy,
    ]);
    this.logoutBound = withPortsAsync(logoutUser, [this.refreshTokens]);
    this.verify = withPortsAsync(verifyAccessToken, [this.jwt]);
    this.verifyPat = withPortsAsync(verifyPersonalAccessToken, [
      this.patTokens,
      this.users,
      this.rbac,
      this.jwt,
      this.clock,
    ]);
    this.assertPermission = withPortsAsync(assertUserHasPermission, [this.rbac]);
    this.effectivePermissions = withPortsAsync(getEffectivePermissions, [this.rbac]);
    this.profileGet = withPortsAsync(getUserProfile, [this.profiles, this.rbac]);
    this.profileUpdate = withPortsAsync(updateUserProfile, [this.profiles, this.rbac]);

    this.rbacCreateRole = withPortsAsync(createRole, [this.rbac]);
    this.rbacDeleteRole = withPortsAsync(deleteRole, [this.rbac]);
    this.rbacCreatePermission = withPortsAsync(createPermission, [this.rbac]);
    this.rbacAssignPermission = withPortsAsync(assignPermissionToRole, [this.rbac]);
    this.rbacRevokePermission = withPortsAsync(revokePermissionFromRole, [this.rbac]);
    this.rbacAssignRole = withPortsAsync(assignRoleToUser, [this.rbac]);
    this.rbacRemoveRole = withPortsAsync(removeRoleFromUser, [this.rbac]);
    this.rbacListRoles = withPortsAsync(listRoles, [this.rbac]);
    this.rbacListPermissions = withPortsAsync(listPermissions, [this.rbac]);

    this.inviteCreate = withPortsAsync(createInvitation, [
      this.invitations,
      this.random,
      this.clock,
    ]);
    this.inviteRevoke = withPortsAsync(revokeInvitation, [this.invitations]);

    this.patCreate = withPortsAsync(createPersonalAccessToken, [
      this.patTokens,
      this.random,
      this.clock,
    ]);
    this.patList = withPortsAsync(listPersonalAccessTokens, [this.patTokens]);
    this.patRevoke = withPortsAsync(revokePersonalAccessToken, [this.patTokens]);
  }

  registerUser(input: RegisterUserInput): Promise<AuthTokens> {
    return this.register(input);
  }

  authenticateUser(email: string, password: string): Promise<AuthTokens> {
    return this.login(email, password);
  }

  refreshAccessToken(refreshTokenPlain: string): Promise<AuthTokens> {
    return this.refresh(refreshTokenPlain);
  }

  logout(refreshTokenPlain: string): Promise<void> {
    return this.logoutBound(refreshTokenPlain);
  }

  verifyAccessToken(accessToken: string): Promise<AccessTokenClaims> {
    return this.verify(accessToken);
  }

  verifyAccessTokenOrPersonalAccessToken(token: string): Promise<AccessTokenClaims> {
    const t = token.trim();
    if (isPersonalAccessTokenPlain(t)) {
      return this.verifyPat(t);
    }
    return this.verify(t);
  }

  assertUserHasPermission(userId: string, permissionKey: string): Promise<void> {
    return this.assertPermission(userId, permissionKey);
  }

  getEffectivePermissions(userId: string): Promise<string[]> {
    return this.effectivePermissions(userId);
  }

  getUserProfile(subjectUserId: string, actorUserId: string): Promise<UserProfile> {
    return this.profileGet(subjectUserId, actorUserId);
  }

  updateUserProfile(
    subjectUserId: string,
    actorUserId: string,
    patch: UserProfileUpdate
  ): Promise<UserProfile> {
    return this.profileUpdate(subjectUserId, actorUserId, patch);
  }

  async createRole(
    actorUserId: string,
    name: string,
    description?: string | null
  ): Promise<{ id: string }> {
    await this.assertPermission(actorUserId, AUTH_RBAC_MANAGE_PERMISSION);
    return this.rbacCreateRole(name, description);
  }

  async deleteRole(actorUserId: string, roleName: string): Promise<void> {
    await this.assertPermission(actorUserId, AUTH_RBAC_MANAGE_PERMISSION);
    return this.rbacDeleteRole(roleName);
  }

  async createPermission(
    actorUserId: string,
    key: string,
    description?: string | null
  ): Promise<{ id: string }> {
    await this.assertPermission(actorUserId, AUTH_RBAC_MANAGE_PERMISSION);
    return this.rbacCreatePermission(key, description);
  }

  async assignPermissionToRole(
    actorUserId: string,
    roleName: string,
    permissionKey: string
  ): Promise<void> {
    await this.assertPermission(actorUserId, AUTH_RBAC_MANAGE_PERMISSION);
    return this.rbacAssignPermission(roleName, permissionKey);
  }

  async revokePermissionFromRole(
    actorUserId: string,
    roleName: string,
    permissionKey: string
  ): Promise<void> {
    await this.assertPermission(actorUserId, AUTH_RBAC_MANAGE_PERMISSION);
    return this.rbacRevokePermission(roleName, permissionKey);
  }

  async assignRoleToUser(
    actorUserId: string,
    userId: string,
    roleName: string
  ): Promise<void> {
    await this.assertPermission(actorUserId, AUTH_RBAC_MANAGE_PERMISSION);
    return this.rbacAssignRole(userId, roleName);
  }

  async removeRoleFromUser(
    actorUserId: string,
    userId: string,
    roleName: string
  ): Promise<void> {
    await this.assertPermission(actorUserId, AUTH_RBAC_MANAGE_PERMISSION);
    return this.rbacRemoveRole(userId, roleName);
  }

  async listRoles(actorUserId: string): Promise<Role[]> {
    await this.assertPermission(actorUserId, AUTH_RBAC_MANAGE_PERMISSION);
    return this.rbacListRoles();
  }

  async listPermissions(actorUserId: string): Promise<Permission[]> {
    await this.assertPermission(actorUserId, AUTH_RBAC_MANAGE_PERMISSION);
    return this.rbacListPermissions();
  }

  async createInvitation(
    actorUserId: string,
    input: HostCreateInvitationInput
  ): Promise<{ plainCode: string; invitationId: string; expiresAt: Date }> {
    await this.assertPermission(actorUserId, AUTH_INVITATIONS_MANAGE_PERMISSION);
    const expiresAt = new Date(
      this.clock.now().getTime() + Math.max(0, input.ttlSec) * 1000
    );
    return this.inviteCreate(actorUserId, {
      expiresAt,
      maxUses: input.maxUses,
      extraRoleName: input.extraRoleName ?? null,
    });
  }

  async revokeInvitation(actorUserId: string, invitationId: string): Promise<void> {
    await this.assertPermission(actorUserId, AUTH_INVITATIONS_MANAGE_PERMISSION);
    return this.inviteRevoke(invitationId);
  }

  createPersonalAccessToken(
    actorUserId: string,
    input: CreatePersonalAccessTokenInput
  ): Promise<PersonalAccessTokenCreated> {
    return this.patCreate(actorUserId, input);
  }

  listPersonalAccessTokens(actorUserId: string): Promise<PersonalAccessTokenSummary[]> {
    return this.patList(actorUserId);
  }

  revokePersonalAccessToken(actorUserId: string, tokenId: string): Promise<void> {
    return this.patRevoke(actorUserId, tokenId);
  }
}
