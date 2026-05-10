import { describe, expect, it, vi } from "vitest";
import { ingestGsiTick } from "../useCases/ingestGsiTick";

describe("ingestGsiTick use case", () => {
  it("delegates to processor.processTick and notifies raw listeners", () => {
    const processTick = vi.fn();
    const processorMock = {
      processTick,
      getState: vi.fn(),
      subscribeState: vi.fn(),
      subscribeEvents: vi.fn(),
    };
    const rawTickHub = {
      dispatchRawTick: vi.fn(),
    };

    const payload = { provider: { name: "CS2" } } as any;
    const rawBody = JSON.stringify(payload);

    ingestGsiTick([processorMock as any, rawTickHub], payload, rawBody);

    expect(processTick).toHaveBeenCalledTimes(1);
    expect(processTick).toHaveBeenCalledWith(payload);
    expect(rawTickHub.dispatchRawTick).toHaveBeenCalledWith(rawBody);
  });
});
