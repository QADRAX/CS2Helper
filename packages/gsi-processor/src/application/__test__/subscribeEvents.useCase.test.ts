import { describe, expect, it, vi } from "vitest";
import { createSubscribeEventsUseCase } from "../gsiProcessor/useCases/subscribeEventsUseCase";
import { createMockProcessorContext } from "./mockProcessorContext";

describe("createSubscribeEventsUseCase", () => {
  it("delegates to events subscribe port", () => {
    const context = createMockProcessorContext();
    const useCase = createSubscribeEventsUseCase(context);
    const listener = vi.fn();

    const unsubscribe = useCase.execute(listener);

    expect(context.events.subscribe).toHaveBeenCalledTimes(1);
    expect(context.events.subscribe).toHaveBeenCalledWith(listener);
    expect(typeof unsubscribe).toBe("function");
  });

  it("returns the unsubscribe handle from the events port", () => {
    const context = createMockProcessorContext();
    const teardown = vi.fn();
    vi.mocked(context.events.subscribe).mockReturnValue(teardown);
    const useCase = createSubscribeEventsUseCase(context);

    const unsubscribe = useCase.execute(vi.fn());

    expect(unsubscribe).toBe(teardown);
  });
});
