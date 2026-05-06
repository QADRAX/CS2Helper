import { describe, expect, it, vi } from "vitest";
import { getState } from "../gsiProcessor/useCases/getStateUseCase";

describe("getState use case", () => {
  it("delegates to statePort.getState", () => {
    const statePort = {
      getState: vi.fn().mockReturnValue({ totalTicks: 10 }),
      setState: vi.fn(),
      subscribeState: vi.fn(),
    };
    const result = getState(statePort as any);
    expect(result.totalTicks).toBe(10);
    expect(statePort.getState).toHaveBeenCalledTimes(1);
  });
});
