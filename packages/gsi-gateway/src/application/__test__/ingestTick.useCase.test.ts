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
    });

    const payload = { provider: { name: "CS2" } } as never;
    useCase.execute(payload);

    expect(processTick).toHaveBeenCalledTimes(1);
    expect(processTick).toHaveBeenCalledWith(payload);
  });
});
