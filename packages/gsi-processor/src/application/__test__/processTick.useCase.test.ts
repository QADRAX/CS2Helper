import { describe, expect, it, vi } from "vitest";
import { minimalClientTick } from "../../__test__/fixtures/minimalWatcherTick";
import { createProcessTickUseCase } from "../gsiProcessor/useCases/processTickUseCase";
import { createMockProcessorContext } from "./mockProcessorContext";

describe("createProcessTickUseCase", () => {
  it("updates state and memory", () => {
    const context = createMockProcessorContext();
    const useCase = createProcessTickUseCase(context);

    useCase.execute(null, 9999);

    expect(context.state.getState).toHaveBeenCalledTimes(1);
    expect(context.memory.getMemory).toHaveBeenCalledTimes(1);
    expect(context.state.setState).toHaveBeenCalledTimes(1);
    expect(context.memory.setMemory).toHaveBeenCalledTimes(1);
  });

  it("falls back to clock.now when timestamp is absent", () => {
    const context = createMockProcessorContext();
    const useCase = createProcessTickUseCase(context);

    useCase.execute(null);

    expect(context.clock.now).toHaveBeenCalledTimes(1);
    const nextState = vi.mocked(context.state.setState).mock.calls[0][0];
    expect(nextState.lastProcessedAt).toBe(123456);
  });

  it("publishes every domain event returned by processTickDomain", () => {
    const context = createMockProcessorContext();
    const useCase = createProcessTickUseCase(context);

    useCase.execute(minimalClientTick(), 7777);

    expect(context.events.publish).toHaveBeenCalled();
    const publishMock = vi.mocked(context.events.publish);
    const types = publishMock.mock.calls.map((c) => c[0].type);
    expect(types.length).toBeGreaterThanOrEqual(2);
    expect(types).toContain("stream_cold_started");
  });

  it("forwards explicit timestamp to domain without calling clock", () => {
    const context = createMockProcessorContext();
    const useCase = createProcessTickUseCase(context);

    useCase.execute(null, 9999);

    expect(context.clock.now).not.toHaveBeenCalled();
  });
});
