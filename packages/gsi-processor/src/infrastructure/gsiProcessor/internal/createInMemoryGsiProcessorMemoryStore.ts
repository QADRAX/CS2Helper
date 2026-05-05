import type { GsiProcessorMemoryPort, GsiProcessorMemory } from "../../../domain/gsiProcessor";

/**
 * Creates an in-memory store for rolling processor memory.
 *
 * This memory is not exposed directly to package consumers; it exists to keep
 * delta context between ticks for reducers such as kill/flash/economy inference.
 */
export function createInMemoryGsiProcessorMemoryStore(
  initialMemory: GsiProcessorMemory
): GsiProcessorMemoryPort {
  let memory: Readonly<GsiProcessorMemory> = Object.freeze(initialMemory);

  return {
    getMemory() {
      return memory;
    },
    setMemory(nextMemory) {
      memory = Object.freeze(nextMemory);
    },
  };
}
