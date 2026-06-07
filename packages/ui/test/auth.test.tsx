import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AgentHubLoginPage, AgentHubProductHomepage } from "../src/index.js";

describe("AgentHubProductHomepage", () => {
  it("renders a public English product homepage with product evidence and sign-in paths", () => {
    const html = renderToStaticMarkup(
      <AgentHubProductHomepage locale="en-US" onOpenLogin={() => undefined} />,
    );

    expect(html).toContain("AgentHub");
    expect(html).toContain("Local-first AI agent workspace");
    expect(html).toContain("Coordinate AI agents around your real workspace");
    expect(html).toContain("Sign in");
    expect(html).toContain("Open login");
    expect(html).toContain("Runtime");
    expect(html).toContain("Permissions");
    expect(html).toContain("Artifacts");
    expect(html).not.toContain("cloud runtime execution");
    expect(html).not.toContain("GitHub pull request workflows");
  });

  it("renders Simplified Chinese homepage chrome while preserving source values", () => {
    const html = renderToStaticMarkup(
      <AgentHubProductHomepage locale="zh-CN" onOpenLogin={() => undefined} />,
    );

    expect(html).toContain("本地优先的 AI 智能体工作区");
    expect(html).toContain("围绕真实工作区协同 AI 智能体");
    expect(html).toContain("登录");
    expect(html).toContain("GitHub");
    expect(html).toContain("Runtime");
  });
});

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
    expect(html).toContain("Email");
    expect(html).toContain("Password");
    expect(html).toContain("Create an account");
    expect(html).toContain("Forgot password?");
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
    expect(html).toContain("邮箱");
    expect(html).toContain("密码");
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

  it("renders callback processing and configuration states distinctly", () => {
    const callback = renderToStaticMarkup(
      <AgentHubLoginPage
        authState={{ status: "callback" }}
        locale="en-US"
        onOpenHomepage={() => undefined}
        onSignInWithGitHub={() => undefined}
      />,
    );
    const misconfigured = renderToStaticMarkup(
      <AgentHubLoginPage
        authState={{ status: "configuration-error", message: "Missing VITE_SUPABASE_URL" }}
        locale="en-US"
        onOpenHomepage={() => undefined}
        onSignInWithGitHub={() => undefined}
      />,
    );

    expect(callback).toContain("Completing sign-in");
    expect(callback).not.toContain("Sign-in failed");
    expect(misconfigured).toContain("Authentication is not configured");
    expect(misconfigured).toContain("Missing VITE_SUPABASE_URL");
    expect(misconfigured).toContain("disabled");
    expect(misconfigured).toContain("Back to homepage");
  });

  it("renders reset-password mode from a hosted recovery route", () => {
    const html = renderToStaticMarkup(
      <AgentHubLoginPage
        authState={{ status: "unauthenticated" }}
        initialMode="reset-password"
        locale="en-US"
        onSignInWithGitHub={() => undefined}
        onUpdatePassword={() => undefined}
      />,
    );

    expect(html).toContain("Set a new password");
    expect(html).toContain("New password");
    expect(html).toContain("Update password");
    expect(html).not.toContain("Conversation navigation");
  });
});
