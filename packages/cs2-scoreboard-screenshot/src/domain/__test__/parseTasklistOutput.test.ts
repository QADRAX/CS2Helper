import { describe, expect, it } from "vitest";

import { parseTasklistCsvRow, parseTasklistOutput } from "../parseTasklistOutput";

describe("parseTasklistOutput", () => {
  it("parses a matching CSV row and pid", () => {
    expect(
      parseTasklistOutput(`"cs2.exe","12345","Console","1","1,234 K"`, "cs2.exe")
    ).toEqual({ running: true, pid: 12345 });
  });

  it("returns not running on INFO / empty", () => {
    expect(parseTasklistOutput("INFO: No tasks match.", "cs2.exe")).toEqual({ running: false });
    expect(parseTasklistOutput("", "cs2.exe")).toEqual({ running: false });
  });

  it("parseTasklistCsvRow splits quoted fields", () => {
    expect(parseTasklistCsvRow(`"a","b","c"`)).toEqual(["a", "b", "c"]);
  });
});
