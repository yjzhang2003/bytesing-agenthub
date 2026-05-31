import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AgentHubLoginPage } from "../src/index.js";

describe("AgentHubLoginPage", () => {
  it("renders English GitHub login chrome without private workbench data", () => {
    const html = renderToStaticMarkup(
      <AgentHubLoginPage
        authState={{ status: "unauthenticated" }}
        locale="en-US"
        onSignInWithGitHub={() => undefined}
      />,
    );

    expect(html).toContain("Sign in to AgentHub");
    expect(html).toContain("Continue with GitHub");
    expect(html).toContain("GitHub");
    expect(html).not.toContain("Conversation navigation");
    expect(html).not.toContain("MVP workbench");
  });

  it("renders Simplified Chinese login chrome while preserving GitHub provider name", () => {
    const html = renderToStaticMarkup(
      <AgentHubLoginPage
        authState={{ status: "error", message: "redirect_uri_mismatch" }}
        locale="zh-CN"
        onRetry={() => undefined}
        onSignInWithGitHub={() => undefined}
      />,
    );

    expect(html).toContain("登录 AgentHub");
    expect(html).toContain("使用 GitHub 继续");
    expect(html).toContain("GitHub");
    expect(html).toContain("redirect_uri_mismatch");
    expect(html).toContain("重试");
  });

  it("disables GitHub sign-in while authenticating", () => {
    const html = renderToStaticMarkup(
      <AgentHubLoginPage
        authState={{ status: "authenticating" }}
        locale="en-US"
        onSignInWithGitHub={() => undefined}
      />,
    );

    expect(html).toContain("Signing in");
    expect(html).toContain("disabled");
  });
});
