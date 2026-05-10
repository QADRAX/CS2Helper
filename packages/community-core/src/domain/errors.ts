export type CommunityErrorCode = "INSTANCE_DISPLAY_NAME_INVALID";

export class CommunityDomainError extends Error {
  readonly code: CommunityErrorCode;

  constructor(code: CommunityErrorCode, message: string) {
    super(message);
    this.name = "CommunityDomainError";
    this.code = code;
  }
}
