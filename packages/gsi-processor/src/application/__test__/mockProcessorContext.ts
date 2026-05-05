import { vi } from "vitest";
import {
  createInitialCoreEngineMemory,
  createInitialCoreEngineState,
  type CoreEngineEvent,
  type CoreEngineUseCaseContext,
  type CoreEngineState,
} from "../../domain/gsiProcessor";

export function createMockProcessorContext(): CoreEngineUseCaseContext {
  const stateValue = createInitialCoreEngineState();
  const memoryValue = createInitialCoreEngineMemory();

  const subscribeState = vi.fn((listener: (state: Readonly<CoreEngineState>) => void) => {
    void listener;
    return () => undefined;
  });
  const subscribeEvents = vi.fn((listener: (event: CoreEngineEvent) => void) => {
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
