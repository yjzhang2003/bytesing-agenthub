import { execFileSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("UI vendor boundary guardrail", () => {
  it("fails on forbidden imports, dependencies, lockfiles, selectors, and class strings", () => {
    const root = path.resolve(import.meta.dirname, "../../..");
    const output = execFileSync(
      "node",
      [
        "scripts/check-ui-vendor-boundaries.mjs",
        "--fixture-root",
        "scripts/fixtures/ui-boundaries",
        "--expect-failures",
      ],
      {
        cwd: root,
        encoding: "utf8",
      },
    );

    expect(output).toContain("forbidden import");
    expect(output).toContain("forbidden dependencies entry");
    expect(output).toContain("forbidden Ant Design package remains in lockfile");
    expect(output).toContain("forbidden vendor selector");
    expect(output).toContain("forbidden vendor class string");
  });
});
