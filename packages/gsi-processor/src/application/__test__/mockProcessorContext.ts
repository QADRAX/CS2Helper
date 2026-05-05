import { vi } from "vitest";
import {
  createInitialGsiProcessorMemory,
  createInitialGsiProcessorState,
  type GsiProcessorEvent,
  type GsiProcessorUseCaseContext,
  type GsiProcessorState,
} from "../../domain/gsiProcessor";

export function createMockProcessorContext(): GsiProcessorUseCaseContext {
  const stateValue = createInitialGsiProcessorState();
  const memoryValue = createInitialGsiProcessorMemory();

  const subscribeState = vi.fn((listener: (state: Readonly<GsiProcessorState>) => void) => {
    void listener;
    return () => undefined;
  });
  const subscribeEvents = vi.fn((listener: (event: GsiProcessorEvent) => void) => {
    void listener;
    return () => undefined;
  });

  return {
    state: {
      getState: vi.fn(() => stateValue),
      setState: vi.fn(),
      subscribeState,
    },
    memory: {
      getMemory: vi.fn(() => memoryValue),
      setMemory: vi.fn(),
    },
    events: {
      publish: vi.fn(),
      subscribe: subscribeEvents,
    },
    clock: {
      now: vi.fn(() => 123456),
    },
  };
}
