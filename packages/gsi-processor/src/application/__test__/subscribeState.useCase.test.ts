import { describe, expect, it, vi } from "vitest";
import { createSubscribeStateUseCase } from "../gsiProcessor/useCases/subscribeStateUseCase";
import { createMockProcessorContext } from "./mockProcessorContext";

describe("createSubscribeStateUseCase", () => {
  it("delegates to state subscribe port", () => {
    const context = createMockProcessorContext();
    const useCase = createSubscribeStateUseCase(context);
    const listener = vi.fn();

    const unsubscribe = useCase.execute(listener);

    expect(context.state.subscribeState).toHaveBeenCalledTimes(1);
    expect(context.state.subscribeState).toHaveBeenCalledWith(listener);
    expect(typeof unsubscribe).toBe("function");
  });

  it("returns the unsubscribe handle from the state port", () => {
    const context = createMockProcessorContext();
    const teardown = vi.fn();
    vi.mocked(context.state.subscribeState).mockReturnValue(teardown);
    const useCase = createSubscribeStateUseCase(context);

    const unsubscribe = useCase.execute(vi.fn());

    expect(unsubscribe).toBe(teardown);
  });
});
