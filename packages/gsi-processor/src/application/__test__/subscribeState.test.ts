import { describe, expect, it, vi } from "vitest";
import { subscribeState } from "../gsiProcessor";

describe("subscribeState use case", () => {
  it("delegates to statePort.subscribeState", () => {
    const unsub = vi.fn();
    const statePort = {
      getState: vi.fn(),
      setState: vi.fn(),
      subscribeState: vi.fn().mockReturnValue(unsub),
    };
    const listener = vi.fn();
    
    // Injected as an object { state }
    const result = subscribeState({ state: statePort as any }, listener);
    
    expect(statePort.subscribeState).toHaveBeenCalledWith(listener);
    expect(result).toBe(unsub);
  });
});
