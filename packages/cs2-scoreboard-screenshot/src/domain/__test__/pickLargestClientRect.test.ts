import { describe, expect, it } from "vitest";

import { pickLargestClientRectByArea } from "../pickLargestClientRect";

describe("pickLargestClientRectByArea", () => {
  it("picks largest positive area", () => {
    expect(
      pickLargestClientRectByArea([
        { hwnd: 1n, width: 800, height: 600 },
        { hwnd: 2n, width: 1920, height: 1080 },
        { hwnd: 3n, width: 0, height: 100 },
      ])
    ).toEqual({ hwnd: 2n, width: 1920, height: 1080 });
  });

  it("returns null for empty", () => {
    expect(pickLargestClientRectByArea([])).toBeNull();
  });
});
