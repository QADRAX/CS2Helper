import { describe, expect, it, vi } from "vitest";
import { Cs2ClientListenerAlreadyRunningError } from "../../../domain";
import type { Cs2ClientListenerControlPort } from "../../ports";
import { startCs2ClientListener } from "../startCs2ClientListener";

describe("startCs2ClientListener", () => {
  it("throws when control reports running", async () => {
    const control: Cs2ClientListenerControlPort = {
      isRunning: () => true,
      enterRunningMode: vi.fn(),
      exitRunningMode: vi.fn(),
    };
    await expect(startCs2ClientListener([control])).rejects.toBeInstanceOf(Cs2ClientListenerAlreadyRunningError);
    expect(control.enterRunningMode).not.toHaveBeenCalled();
  });

  it("delegates to enterRunningMode when idle", async () => {
    const control: Cs2ClientListenerControlPort = {
      isRunning: () => false,
      enterRunningMode: vi.fn().mockResolvedValue({ gatewayPort: 4242 }),
      exitRunningMode: vi.fn(),
    };
    const r = await startCs2ClientListener([control]);
    expect(r).toEqual({ gatewayPort: 4242 });
    expect(control.enterRunningMode).toHaveBeenCalledTimes(1);
  });
});
