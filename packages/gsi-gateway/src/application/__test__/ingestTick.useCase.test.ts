import { describe, expect, it, vi } from "vitest";
import { createIngestGsiTickUseCase } from "../gsiGateway/useCases/ingestGsiTickUseCase";

describe("createIngestGsiTickUseCase", () => {
  it("delegates to processor.processTick", () => {
    const processTick = vi.fn();
    const useCase = createIngestGsiTickUseCase({
      processor: {
        processTick,
        getState: vi.fn(),
        subscribeState: vi.fn(),
        subscribeEvents: vi.fn(),
      },
      rawTickListeners: new Set(),
    });

    const payload = { provider: { name: "CS2" } } as any;
    const rawBody = JSON.stringify(payload);
    useCase.execute(payload, rawBody);

    expect(processTick).toHaveBeenCalledTimes(1);
    expect(processTick).toHaveBeenCalledWith(payload);
  });
});
