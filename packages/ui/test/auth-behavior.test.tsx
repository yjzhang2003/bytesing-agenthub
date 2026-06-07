// @vitest-environment happy-dom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentHubLoginPage } from "../src/index.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mountedRoots: Root[] = [];
const mountedContainers: HTMLElement[] = [];

function nextFrame(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

async function settle(): Promise<void> {
  await nextFrame();
  await nextFrame();
}

async function render(ui: React.ReactElement): Promise<HTMLElement> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mountedRoots.push(root);
  mountedContainers.push(container);
  await act(async () => {
    root.render(ui);
    await settle();
  });
  return container;
}

function inputByLabel(label: string): HTMLInputElement {
  const labels = Array.from(document.querySelectorAll("label"));
  const match = labels.find((candidate) => candidate.textContent?.includes(label));
  const input = match?.querySelector("input");
  if (!input) {
    throw new Error(`Missing input for ${label}`);
  }
  return input;
}

async function setInputValue(input: HTMLInputElement, value: string): Promise<void> {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await settle();
  });
}

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) {
      root.unmount();
    }
    for (const container of mountedContainers.splice(0)) {
      container.remove();
    }
    document.body.innerHTML = "";
  });
});

describe("AgentHubLoginPage behavior", () => {
  it("validates email sign-in before calling Supabase handlers", async () => {
    const onSignInWithEmail = vi.fn();
    await render(
      <AgentHubLoginPage
        authState={{ status: "unauthenticated" }}
        locale="en-US"
        onSignInWithEmail={onSignInWithEmail}
        onSignInWithGitHub={() => undefined}
      />,
    );

    await act(async () => {
      document.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true }));
      await settle();
    });

    expect(onSignInWithEmail).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("Email is required.");
  });

  it("switches modes, clears transient errors, and reports confirmation-required signup", async () => {
    const onSignUpWithEmail = vi.fn(async () => ({
      email: "new@example.com",
      status: "confirmation-required" as const,
    }));
    await render(
      <AgentHubLoginPage
        authState={{ status: "unauthenticated" }}
        locale="en-US"
        onSignInWithGitHub={() => undefined}
        onSignUpWithEmail={onSignUpWithEmail}
      />,
    );

    await act(async () => {
      (Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent === "Create an account",
      ) as HTMLButtonElement).click();
      await settle();
    });
    expect(document.body.textContent).toContain("Create your AgentHub account");
    expect(document.body.textContent).not.toContain("Email is required.");

    await setInputValue(inputByLabel("Email"), "new@example.com");
    await setInputValue(inputByLabel("Password"), "correct-horse");
    await act(async () => {
      document.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true }));
      await settle();
    });

    expect(onSignUpWithEmail).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "correct-horse",
    });
    expect(document.body.textContent).toContain("Check new@example.com");
  });

  it("keeps password reset request copy generic and disables duplicate submissions", async () => {
    let resolveReset: (() => void) | undefined;
    const onRequestPasswordReset = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveReset = resolve;
        }),
    );
    await render(
      <AgentHubLoginPage
        authState={{ status: "unauthenticated" }}
        locale="en-US"
        onRequestPasswordReset={onRequestPasswordReset}
        onSignInWithGitHub={() => undefined}
      />,
    );

    await act(async () => {
      (Array.from(document.querySelectorAll("button")).find(
        (button) => button.textContent === "Forgot password?",
      ) as HTMLButtonElement).click();
      await settle();
    });
    await setInputValue(inputByLabel("Email"), "reset@example.com");

    await act(async () => {
      document.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true }));
      await settle();
    });
    expect(onRequestPasswordReset).toHaveBeenCalledOnce();
    expect((Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent === "Submitting",
    ) as HTMLButtonElement).disabled).toBe(true);

    await act(async () => {
      resolveReset?.();
      await settle();
    });
    expect(document.body.textContent).toContain(
      "If an account exists for that email, a password reset link has been sent.",
    );
    expect(document.body.textContent).not.toContain("reset@example.com exists");
  });

  it("submits localized reset-password mode", async () => {
    const onUpdatePassword = vi.fn(async () => undefined);
    await render(
      <AgentHubLoginPage
        authState={{ status: "unauthenticated" }}
        initialMode="reset-password"
        locale="zh-CN"
        onSignInWithGitHub={() => undefined}
        onUpdatePassword={onUpdatePassword}
      />,
    );

    expect(document.body.textContent).toContain("设置新密码");
    await setInputValue(inputByLabel("新密码"), "new-correct-horse");
    await act(async () => {
      document.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true }));
      await settle();
    });

    expect(onUpdatePassword).toHaveBeenCalledWith({ password: "new-correct-horse" });
    expect(document.body.textContent).toContain("密码已更新");
  });
});
