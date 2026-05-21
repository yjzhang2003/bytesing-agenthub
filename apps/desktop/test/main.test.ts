import { describe, expect, it } from "vitest";
import { defaultDesktopShellConfig, getRuntimeStartupSummary } from "../src/shell-config.js";

describe("desktop shell config", () => {
  it("hosts the Web UI and starts runtime by default", () => {
    expect(defaultDesktopShellConfig.webUrl).toContain("127.0.0.1");
    expect(defaultDesktopShellConfig.startsRuntime).toBe(true);
    expect(getRuntimeStartupSummary()).toContain("heartbeat=");
  });
});
