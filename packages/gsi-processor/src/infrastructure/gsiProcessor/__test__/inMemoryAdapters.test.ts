import { describe, expect, it, vi } from "vitest";
import {
  createInitialGsiProcessorMemory,
  createInitialGsiProcessorState,
} from "../../../domain/gsiProcessor";
import { createInMemoryGsiProcessorEventsBus } from "../internal/createInMemoryGsiProcessorEventsBus";
import { createInMemoryGsiProcessorMemoryStore } from "../internal/createInMemoryGsiProcessorMemoryStore";
import { createInMemoryGsiProcessorStateStore } from "../internal/createInMemoryGsiProcessorStateStore";

describe("in-memory GSI processor adapters", () => {
  it("state store notifies subscribers until unsubscribed", () => {
    const store = createInMemoryGsiProcessorStateStore(createInitialGsiProcessorState());
    const listener = vi.fn();
    const off = store.subscribeState(listener);
    store.setState({ ...createInitialGsiProcessorState(), totalTicks: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
    off();
    store.setState({ ...createInitialGsiProcessorState(), totalTicks: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("events bus stops delivering after unsubscribe", () => {
    const bus = createInMemoryGsiProcessorEventsBus();
    const listener = vi.fn();
    const off = bus.subscribe(listener);
    bus.publish({ type: "gap_started", timestamp: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
    off();
    bus.publish({ type: "gap_started", timestamp: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("memory store holds latest value", () => {
    const store = createInMemoryGsiProcessorMemoryStore(createInitialGsiProcessorMemory());
    const next = { ...createInitialGsiProcessorMemory(), lastGameRound: 5 };
    store.setMemory(next);
    expect(store.getMemory().lastGameRound).toBe(5);
  });
});
