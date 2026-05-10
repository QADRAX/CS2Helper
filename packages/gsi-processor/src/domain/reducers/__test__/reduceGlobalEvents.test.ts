import { describe, expect, it } from "vitest";
import { reduceGlobalEvents } from "../reduceGlobalEvents";
import type { ReducerContext } from "../reducerTypes";

describe("reduceGlobalEvents", () => {
  it("is a no-op placeholder", () => {
    const ctx = { events: [] } as unknown as ReducerContext;
    expect(() => reduceGlobalEvents(ctx)).not.toThrow();
  });
});
