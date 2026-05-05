import { describe, expect, it } from "vitest";
import { transitionStreamState } from "../stream/streamStateMachine";

describe("transitionStreamState", () => {
  it("invalid quality moves to degraded and rejects", () => {
    const out = transitionStreamState({
      current: "healthy",
      quality: "invalid",
      recoveryWindow: 1,
      consecutiveValidSnapshots: 2,
      consecutivePartialSnapshots: 0,
    });
    expect(out.next).toBe("degraded");
    expect(out.rejected).toBe(true);
    expect(out.startedGap).toBe(true);
  });

  it("stale quality treats like invalid", () => {
    const out = transitionStreamState({
      current: "gap",
      quality: "stale",
      recoveryWindow: 1,
      consecutiveValidSnapshots: 0,
      consecutivePartialSnapshots: 0,
    });
    expect(out.next).toBe("degraded");
    expect(out.rejected).toBe(true);
    expect(out.startedGap).toBe(false);
  });

  it("partial from healthy starts gap", () => {
    const out = transitionStreamState({
      current: "healthy",
      quality: "partial",
      recoveryWindow: 2,
      consecutiveValidSnapshots: 0,
      consecutivePartialSnapshots: 1,
    });
    expect(out.next).toBe("gap");
    expect(out.startedGap).toBe(true);
  });

  it("partial with enough consecutive partials becomes degraded", () => {
    const out = transitionStreamState({
      current: "healthy",
      quality: "partial",
      recoveryWindow: 2,
      consecutiveValidSnapshots: 0,
      consecutivePartialSnapshots: 2,
    });
    expect(out.next).toBe("degraded");
  });

  it("cold_start + complete stays recovering until recovery window", () => {
    const recovering = transitionStreamState({
      current: "cold_start",
      quality: "complete",
      recoveryWindow: 2,
      consecutiveValidSnapshots: 1,
      consecutivePartialSnapshots: 0,
    });
    expect(recovering.next).toBe("recovering");
    expect(recovering.recovered).toBe(false);

    const healthy = transitionStreamState({
      current: "cold_start",
      quality: "complete",
      recoveryWindow: 2,
      consecutiveValidSnapshots: 2,
      consecutivePartialSnapshots: 0,
    });
    expect(healthy.next).toBe("healthy");
    expect(healthy.recovered).toBe(true);
  });

  it("gap + complete recovers to healthy when window satisfied", () => {
    const out = transitionStreamState({
      current: "gap",
      quality: "complete",
      recoveryWindow: 1,
      consecutiveValidSnapshots: 1,
      consecutivePartialSnapshots: 0,
    });
    expect(out.next).toBe("healthy");
    expect(out.endedGap).toBe(true);
    expect(out.recovered).toBe(true);
  });

  it("healthy + complete stays healthy", () => {
    const out = transitionStreamState({
      current: "healthy",
      quality: "complete",
      recoveryWindow: 1,
      consecutiveValidSnapshots: 5,
      consecutivePartialSnapshots: 0,
    });
    expect(out.next).toBe("healthy");
    expect(out.startedGap).toBe(false);
  });
});
