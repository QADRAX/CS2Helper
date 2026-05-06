import type { MemoryPort } from "../../../application/gsiProcessor/ports/MemoryPort";
import type { GsiProcessorMemory } from "../../../domain/gsiProcessor/gsiProcessorTypes";

/**
 * In-memory persistence for rolling delta context.
 */
export class InMemoryMemoryAdapter implements MemoryPort {
  constructor(private memory: GsiProcessorMemory) {}

  getMemory(): Readonly<GsiProcessorMemory> {
    return this.memory;
  }

  setMemory(memory: GsiProcessorMemory): void {
    this.memory = memory;
  }
}
