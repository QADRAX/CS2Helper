export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_TAKEN"
  | "USER_NOT_FOUND"
  | "USER_INACTIVE"
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  | "REFRESH_TOKEN_INVALID"
  | "FORBIDDEN"
  | "ROLE_NOT_FOUND"
  | "PERMISSION_NOT_FOUND"
  | "PERMISSION_DENIED"
  | "VALIDATION_ERROR"
  | "PROFILE_NOT_FOUND"
  | "INVITATION_REQUIRED"
  | "INVITATION_INVALID"
  | "INVITATION_NOT_FOUND"
  | "PERSONAL_ACCESS_TOKEN_NOT_FOUND"
  | "NOT_ADMIN";

export class AuthDomainError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthDomainError";
    this.code = code;
  }
}
