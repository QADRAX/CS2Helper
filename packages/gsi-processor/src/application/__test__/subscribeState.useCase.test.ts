import { describe, expect, it, vi } from "vitest";
import { subscribeState } from "../gsiProcessor/useCases/subscribeStateUseCase";

describe("subscribeState use case", () => {
  it("delegates to statePort.subscribeState", () => {
    const unsub = vi.fn();
    const statePort = {
      getState: vi.fn(),
      setState: vi.fn(),
      subscribeState: vi.fn().mockReturnValue(unsub),
    };
    const listener = vi.fn();
    
    const result = subscribeState(statePort as any, listener);
    
    expect(statePort.subscribeState).toHaveBeenCalledWith(listener);
    expect(result).toBe(unsub);
  });
});
