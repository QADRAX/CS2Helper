import type {
  AccessTokenClaims,
  AuthTokens,
  HostCreateInvitationInput,
  Permission,
  RegisterUserInput,
  Role,
  UserProfile,
  UserProfileUpdate,
} from "../domain";

/**
 * Application API exposed to Next.js routes or other hosts.
 * Admin RBAC requires `auth.rbac.manage`; invitation create/revoke requires `users.invitations.manage` (see domain `permissionKeys`).
 */
export interface AuthApp {
  registerUser(input: RegisterUserInput): Promise<AuthTokens>;
  authenticateUser(email: string, password: string): Promise<AuthTokens>;
  refreshAccessToken(refreshTokenPlain: string): Promise<AuthTokens>;
  logout(refreshTokenPlain: string): Promise<void>;
  verifyAccessToken(accessToken: string): Promise<AccessTokenClaims>;

  assertUserHasPermission(userId: string, permissionKey: string): Promise<void>;
  getEffectivePermissions(userId: string): Promise<string[]>;

  getUserProfile(subjectUserId: string, actorUserId: string): Promise<UserProfile>;
  updateUserProfile(
    subjectUserId: string,
    actorUserId: string,
    patch: UserProfileUpdate
  ): Promise<UserProfile>;

  createRole(
    actorUserId: string,
    name: string,
    description?: string | null
  ): Promise<{ id: string }>;
  deleteRole(actorUserId: string, roleName: string): Promise<void>;
  createPermission(
    actorUserId: string,
    key: string,
    description?: string | null
  ): Promise<{ id: string }>;
  assignPermissionToRole(
    actorUserId: string,
    roleName: string,
    permissionKey: string
  ): Promise<void>;
  revokePermissionFromRole(
    actorUserId: string,
    roleName: string,
    permissionKey: string
  ): Promise<void>;
  assignRoleToUser(actorUserId: string, userId: string, roleName: string): Promise<void>;
  removeRoleFromUser(actorUserId: string, userId: string, roleName: string): Promise<void>;
  listRoles(actorUserId: string): Promise<Role[]>;
  listPermissions(actorUserId: string): Promise<Permission[]>;

  createInvitation(
    actorUserId: string,
    input: HostCreateInvitationInput
  ): Promise<{ plainCode: string; invitationId: string; expiresAt: Date }>;
  revokeInvitation(actorUserId: string, invitationId: string): Promise<void>;
}
