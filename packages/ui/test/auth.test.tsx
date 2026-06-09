import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AgentHubLoginPage, AgentHubProductHomepage } from "../src/index.js";

describe("AgentHubProductHomepage", () => {
  it("renders a public English product homepage with a PixelBlast background and sign-in paths", () => {
    const html = renderToStaticMarkup(
      <AgentHubProductHomepage locale="en-US" onOpenLogin={() => undefined} />,
    );

    expect(html).toContain("AgentHub");
    expect(html).toContain("Track runs, permissions, and artifacts from one place.");
    expect(html).toContain("Get Started");
    expect(html).toContain("GitHub");
    expect(html).toContain("https://github.com/yjzhang2003/bytesing-agenthub");
    expect(html).toContain("agenthub-home-github-icon");
    expect(html).toContain("agenthub-ascii-text");
    expect(html).toContain("agenthub-pixel-blast");
    expect(html.match(/Get Started/g)).toHaveLength(1);
    expect(html).not.toContain("Use GitHub identity.");
    expect(html).not.toContain("AgentHub coordinates in the cloud while execution stays local.");
    expect(html).not.toContain("Sign in");
    expect(html).not.toContain("Open login");
    expect(html).not.toContain("Local workspace");
    expect(html).not.toContain("Permission review");
    expect(html).not.toContain("Plan updated");
    expect(html).not.toContain("Diff ready");
    expect(html).not.toContain("View workflow");
    expect(html).not.toContain("cloud runtime execution");
    expect(html).not.toContain("GitHub pull request workflows");
  });

  it("renders Simplified Chinese centered brand chrome while preserving source values and hiding flow CTA", () => {
    const html = renderToStaticMarkup(
      <AgentHubProductHomepage locale="zh-CN" onOpenLogin={() => undefined} />,
    );

    expect(html).toContain("AgentHub");
    expect(html).toContain("统一查看运行、权限和产物。");
    expect(html).toContain("Get Started");
    expect(html).toContain("GitHub");
    expect(html).toContain("agenthub-home-github-icon");
    expect(html).toContain("agenthub-ascii-text");
    expect(html).toContain("agenthub-home-pixel-field");
    expect(html.match(/Get Started/g)).toHaveLength(1);
    expect(html).not.toContain("使用 GitHub 身份。");
    expect(html).not.toContain("AgentHub 负责协同，执行留在本地。");
    expect(html).not.toContain("让智能体围绕本地项目协作");
    expect(html).not.toContain("登录</button>");
    expect(html).not.toContain("本地工作区");
    expect(html).not.toContain("正在审阅权限");
    expect(html).not.toContain("计划已更新");
    expect(html).not.toContain("diff 待查看");
    expect(html).not.toContain("查看流程");
    expect(html).not.toContain("Permissions");
    expect(html).not.toContain("Artifacts");
  });

  it("includes restrained homepage motion styles with reduced-motion handling", () => {
    const html = renderToStaticMarkup(
      <AgentHubProductHomepage locale="zh-CN" onOpenLogin={() => undefined} />,
    );

    expect(html).toContain("agenthub-home-motion");
    expect(html).toContain("@keyframes agenthub-home-drift");
    expect(html).toContain("prefers-reduced-motion: reduce");
    expect(html).toContain(".agenthub-home-shell::before");
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
    expect(html).toContain("agenthub-border-glow-card");
    expect(html).toContain("agenthub-auth-pixel-field");
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
    expect(html).toContain("agenthub-auth-panel");
    expect(html).toContain("agenthub-auth-glow");
    expect(html).toContain("agenthub-auth-pixel-field");
    expect(html).not.toContain("agenthub-auth-preview");
    expect(html).not.toContain("本地工作区");
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
