import { describe, expect, it, vi } from "vitest";
import { processTick } from "../gsiProcessor/useCases/processTickUseCase";
import { createInitialGsiProcessorState, createInitialGsiProcessorMemory } from "../../domain/gsiProcessor";

describe("processTick use case", () => {
  it("orchestrates domain processing and updates ports", () => {
    const statePort = {
      getState: vi.fn().mockReturnValue(createInitialGsiProcessorState()),
      setState: vi.fn(),
      subscribeState: vi.fn(),
    };
    const memoryPort = {
      getMemory: vi.fn().mockReturnValue(createInitialGsiProcessorMemory()),
      setMemory: vi.fn(),
    };
    const eventsPort = {
      publish: vi.fn(),
      subscribe: vi.fn(),
    };
    const clockPort = {
      now: vi.fn().mockReturnValue(1000),
    };

    const tick = { provider: { name: "test" } };
    
    processTick(
      statePort as any,
      memoryPort as any,
      eventsPort as any,
      clockPort as any,
      tick
    );

    expect(statePort.getState).toHaveBeenCalled();
    expect(statePort.setState).toHaveBeenCalled();
    expect(memoryPort.setMemory).toHaveBeenCalled();
  });
});
