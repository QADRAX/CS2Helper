import type { CoreEngineMemoryPort, CoreEngineMemory } from "../../../domain/gsiProcessor";

/**
 * Creates an in-memory store for rolling processor memory.
 *
 * This memory is not exposed directly to package consumers; it exists to keep
 * delta context between ticks for reducers such as kill/flash/economy inference.
 */
export function createInMemoryGsiProcessorMemoryStore(
  initialMemory: CoreEngineMemory
): CoreEngineMemoryPort {
  let memory: Readonly<CoreEngineMemory> = Object.freeze(initialMemory);

  return {
    getMemory() {
      return memory;
    },
    setMemory(nextMemory) {
      memory = Object.freeze(nextMemory);
    },
  };
}
