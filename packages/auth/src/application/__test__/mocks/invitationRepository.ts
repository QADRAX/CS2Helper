import { vi } from "vitest";
import type { InvitationRepositoryPort } from "../../ports";

export function createInvitationRepositoryFake(
  overrides: Partial<InvitationRepositoryPort> = {}
): InvitationRepositoryPort {
  return {
    insertInvitation: vi.fn(async () => ({ id: "inv-1" })),
    claimOneUseIfValid: vi.fn(async () => null),
    releaseClaimedUse: vi.fn(async () => {}),
    revokeInvitation: vi.fn(async () => {}),
    listInvitations: vi.fn(async () => []),
    ...overrides,
  };
}
