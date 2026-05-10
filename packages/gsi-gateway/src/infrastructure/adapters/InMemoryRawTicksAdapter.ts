import type {
  RawTickDispatchPort,
  RawTicksSubscriptionPort,
} from "../../application/ports";

/**
 * In-memory pub/sub for raw GSI JSON strings. Implements both subscription (CLI/tests)
 * and dispatch (ingestion) sides of the gateway.
 */
export class InMemoryRawTicksAdapter implements RawTicksSubscriptionPort, RawTickDispatchPort {
  private readonly listeners = new Set<(raw: string) => void>();

  subscribe(listener: (raw: string) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  dispatchRawTick(raw: string): void {
    this.listeners.forEach((listener) => {
      listener(raw);
    });
  }
}
