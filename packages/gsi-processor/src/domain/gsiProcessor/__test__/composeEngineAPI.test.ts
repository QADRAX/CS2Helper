import { describe, expect, it, vi } from "vitest";
import { composeEngineAPI } from "../api/composeEngineAPI";

describe("composeEngineAPI", () => {
  it("build exposes execute functions bound to their use cases", () => {
    const a = vi.fn(() => 1);
    const b = vi.fn(() => "ok");
    const api = composeEngineAPI()
      .add("alpha", { execute: a })
      .add("beta", { execute: b })
      .build();

    expect(api.alpha()).toBe(1);
    expect(api.beta()).toBe("ok");
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});
