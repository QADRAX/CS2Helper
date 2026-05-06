import { describe, expect, it, vi } from "vitest";
import { subscribeEvents } from "../gsiProcessor/useCases/subscribeEventsUseCase";

describe("subscribeEvents use case", () => {
  it("delegates to eventsPort.subscribe", () => {
    const unsub = vi.fn();
    const eventsPort = {
      publish: vi.fn(),
      subscribe: vi.fn().mockReturnValue(unsub),
    };
    const listener = vi.fn();
    
    const result = subscribeEvents(eventsPort as any, listener);
    
    expect(eventsPort.subscribe).toHaveBeenCalledWith(listener);
    expect(result).toBe(unsub);
  });
});
