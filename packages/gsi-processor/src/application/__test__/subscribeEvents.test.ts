import { describe, expect, it, vi } from "vitest";
import { subscribeEvents } from "../gsiProcessor";

describe("subscribeEvents use case", () => {
  it("delegates to eventsPort.subscribe", () => {
    const unsub = vi.fn();
    const eventsPort = {
      publish: vi.fn(),
      subscribe: vi.fn().mockReturnValue(unsub),
    };
    const listener = vi.fn();
    
    // Injected as an object { events }
    const result = subscribeEvents({ events: eventsPort as any }, listener);
    
    expect(eventsPort.subscribe).toHaveBeenCalledWith(listener);
    expect(result).toBe(unsub);
  });
});
