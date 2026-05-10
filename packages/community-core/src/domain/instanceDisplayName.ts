import { CommunityDomainError } from "./errors";

export const DEFAULT_INSTANCE_DISPLAY_NAME = "CS2 Community";

const MAX_LEN = 120;

/**
 * Normalizes and validates the public name of this installation (homelab / team).
 */
export function parseInstanceDisplayName(raw: string): string {
  const name = raw.trim();
  if (!name) {
    throw new CommunityDomainError(
      "INSTANCE_DISPLAY_NAME_INVALID",
      "Instance display name cannot be empty"
    );
  }
  if (name.length > MAX_LEN) {
    throw new CommunityDomainError(
      "INSTANCE_DISPLAY_NAME_INVALID",
      `Instance display name must be at most ${MAX_LEN} characters`
    );
  }
  return name;
}
