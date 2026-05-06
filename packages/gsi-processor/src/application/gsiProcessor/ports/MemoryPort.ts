import type { GsiProcessorMemory } from "../../../domain/gsiProcessor/gsiProcessorTypes";

/** Memory persistence port used for rolling delta context. */
export interface MemoryPort {
  getMemory: () => Readonly<GsiProcessorMemory>;
  setMemory: (memory: GsiProcessorMemory) => void;
}
