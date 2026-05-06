import { describe, expect, it, vi } from "vitest";
import { ingestGsiTick } from "../gsiGateway";

describe("ingestGsiTick use case", () => {
  it("delegates to processor.processTick and notifies raw listeners", () => {
    const processTick = vi.fn();
    const processorMock = {
      processTick,
      getState: vi.fn(),
      subscribeState: vi.fn(),
      subscribeEvents: vi.fn(),
    };
    const rawListeners = new Set<(raw: string) => void>();
    const listener = vi.fn();
    rawListeners.add(listener);

    const payload = { provider: { name: "CS2" } } as any;
    const rawBody = JSON.stringify(payload);
    
    // Injected as an object { processor, rawTickListeners }
    ingestGsiTick({ processor: processorMock as any, rawTickListeners: rawListeners }, payload, rawBody);

    expect(processTick).toHaveBeenCalledTimes(1);
    expect(processTick).toHaveBeenCalledWith(payload);
    expect(listener).toHaveBeenCalledWith(rawBody);
  });
});
