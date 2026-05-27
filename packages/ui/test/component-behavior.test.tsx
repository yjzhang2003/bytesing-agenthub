// @vitest-environment happy-dom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AgentHubWorkbench,
  Button,
  Dialog,
  DropdownMenu,
  FormField,
  LoadingState,
  SearchInput,
  Select,
  Switch,
  Tabs,
  TextArea,
  ThemeRoot,
  Toast,
  Tooltip,
  agentHubMessage,
} from "../src/index.js";
import { snapshot } from "./test-fixtures.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mountedRoots: Root[] = [];
const mountedContainers: HTMLElement[] = [];

function nextFrame(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

async function settle(): Promise<void> {
  await nextFrame();
  await nextFrame();
  await nextFrame();
}

function snapshotWithParticipants(): ReturnType<typeof snapshot> {
  return {
    ...snapshot(),
    conversationParticipants: snapshot().agents.slice(0, 2).map((agent, index) => ({
      addedByUserId: "user_1",
      agentId: agent.id,
      archivedAt: null,
      conversationId: "conversation_1",
      conversationAgentSettings:
        agent.id === "agent_2"
          ? {
              displayNameOverride: "Implementer in chat",
              responsibilityOverride: "Own implementation inside this group chat.",
              scopedInstructions: "Keep answers scoped to this chat.",
            }
          : undefined,
      createdAt: "2026-05-21T00:00:00.000Z",
      id: `participant_${index + 1}`,
      ownerUserId: "user_1",
      updatedAt: "2026-05-21T00:00:00.000Z",
    })),
  };
}

async function render(ui: React.ReactElement): Promise<HTMLElement> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mountedRoots.push(root);
  mountedContainers.push(container);
  await act(async () => {
    root.render(ui);
    await nextFrame();
  });
  return container;
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

describe("AgentHub component behavior", () => {
  it("traps Dialog focus, wires labels, closes on Escape, and returns focus", async () => {
    function DialogHarness(): React.ReactElement {
      const [open, setOpen] = React.useState(false);
      const initialFocusRef = React.useRef<HTMLButtonElement | null>(null);
      return (
        <ThemeRoot mode="light">
          <button onClick={() => setOpen(true)} type="button">
            Open dialog
          </button>
          <Dialog
            cancelLabel="Cancel"
            closeLabel="Close dialog"
            confirmLabel="Confirm"
            description="Choose a worker"
            initialFocusRef={initialFocusRef}
            onOpenChange={setOpen}
            open={open}
            title="Add agent"
          >
            <button ref={initialFocusRef} type="button">
              First action
            </button>
            <button type="button">Last action</button>
          </Dialog>
        </ThemeRoot>
      );
    }

    await render(<DialogHarness />);
    const opener = document.querySelector("button") as HTMLButtonElement;
    opener.focus();
    await act(async () => {
      opener.click();
      await settle();
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    expect(document.activeElement?.textContent).toBe("First action");
    expect(mountedContainers[0]?.getAttribute("aria-hidden")).toBe("true");

    const confirmAction = Array.from(dialog.querySelectorAll("button")).find(
      (button) => button.textContent === "Confirm",
    ) as HTMLButtonElement;
    confirmAction.focus();
    await act(async () => {
      confirmAction.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Tab" }));
    });
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Close dialog");

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
      await nextFrame();
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("keeps form controls accessible with localized Chinese labels and state text", async () => {
    const onSwitchChange = vi.fn();
    const onSelectChange = vi.fn();
    const onSearchValueChange = vi.fn();
    const onSubmitShortcut = vi.fn();
    const textAreaRef = React.createRef<HTMLTextAreaElement>();

    await render(
      <ThemeRoot mode="light">
        <FormField error="必须选择智能体" hint="选择一个默认智能体" label="默认智能体">
          <Select
            ariaLabel="选择智能体"
            invalid
            onValueChange={onSelectChange}
            options={[
              { label: "协调者", value: "orchestrator" },
              { label: "执行者", value: "implementer" },
            ]}
            value="orchestrator"
          />
        </FormField>
        <SearchInput
          ariaLabel="搜索智能体"
          clearLabel="清除搜索"
          defaultValue="协调"
          onValueChange={onSearchValueChange}
          placeholder="搜索"
        />
        <TextArea
          ariaLabel="补充指令"
          invalid
          onSubmitShortcut={onSubmitShortcut}
          placeholder="输入补充指令"
          ref={textAreaRef}
        />
        <Switch ariaLabel="启用通知" checked={false} label="通知" onCheckedChange={onSwitchChange} />
      </ThemeRoot>,
    );

    const select = document.querySelector('select[aria-label="选择智能体"]') as HTMLSelectElement;
    expect(select.getAttribute("aria-invalid")).toBe("true");
    expect(select.getAttribute("aria-describedby")).toBeTruthy();
    expect(document.body.textContent).toContain("必须选择智能体");
    expect(document.body.textContent).toContain("选择一个默认智能体");
    await act(async () => {
      select.value = "implementer";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      await settle();
    });
    expect(onSelectChange).toHaveBeenCalledWith("implementer");

    const search = document.querySelector('input[aria-label="搜索智能体"]') as HTMLInputElement;
    expect(search.placeholder).toBe("搜索");
    expect(document.querySelector('button[aria-label="清除搜索"]')).toBeTruthy();
    await act(async () => {
      (document.querySelector('button[aria-label="清除搜索"]') as HTMLButtonElement).click();
      await settle();
    });
    expect(onSearchValueChange).toHaveBeenCalledWith("");

    const textArea = document.querySelector('textarea[aria-label="补充指令"]') as HTMLTextAreaElement;
    expect(textArea).toBe(textAreaRef.current);
    expect(textArea.getAttribute("aria-invalid")).toBe("true");
    await act(async () => {
      textArea.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Enter", metaKey: true }),
      );
      await settle();
    });
    expect(onSubmitShortcut).toHaveBeenCalledOnce();

    const switchControl = document.querySelector('button[role="switch"]') as HTMLButtonElement;
    expect(switchControl.getAttribute("aria-label")).toBe("启用通知");
    await act(async () => {
      switchControl.click();
      await settle();
    });
    expect(onSwitchChange).toHaveBeenCalledWith(true);
  });

  it("keeps feedback and loading behavior with localized Chinese live-region text", async () => {
    const onDismiss = vi.fn();
    await render(
      <ThemeRoot mode="light">
        <LoadingState label="正在加载工作台" variant="spinner" />
        <Toast
          dismissLabel="关闭通知"
          items={[{ content: "连接已恢复", duration: 0, id: "toast_1", tone: "success" }]}
          onDismiss={onDismiss}
        />
      </ThemeRoot>,
    );

    const loading = document.querySelector('[role="status"][aria-label="正在加载工作台"]');
    expect(loading?.textContent).toBe("正在加载工作台");
    expect(document.querySelector(".agenthub-toast-region")?.getAttribute("aria-live")).toBe(
      "polite",
    );
    expect(document.body.textContent).toContain("连接已恢复");
    await act(async () => {
      (document.querySelector('button[aria-label="关闭通知"]') as HTMLButtonElement).click();
      await settle();
    });
    expect(onDismiss).toHaveBeenCalledWith("toast_1");
    expect(document.body.textContent).not.toContain("连接已恢复");
  });

  it("keeps overlay keyboard behavior with localized Chinese labels", async () => {
    const onSelect = vi.fn();

    function OverlayHarness(): React.ReactElement {
      const [dialogOpen, setDialogOpen] = React.useState(false);
      return (
        <ThemeRoot mode="light">
          <button onClick={() => setDialogOpen(true)} type="button">
            打开对话框
          </button>
          <Dialog
            cancelLabel="取消"
            closeLabel="关闭对话框"
            confirmLabel="确认"
            description="选择下一步操作"
            onOpenChange={setDialogOpen}
            open={dialogOpen}
            title="添加智能体"
          >
            <DropdownMenu
              items={[
                { id: "edit", label: "编辑" },
                { disabled: true, id: "delete", label: "删除" },
              ]}
              onSelect={onSelect}
              trigger={<button type="button">更多操作</button>}
            />
            <Tooltip content="刷新状态">
              <button type="button">刷新</button>
            </Tooltip>
          </Dialog>
        </ThemeRoot>
      );
    }

    await render(<OverlayHarness />);
    const opener = document.querySelector("button") as HTMLButtonElement;
    opener.focus();
    await act(async () => {
      opener.click();
      await settle();
    });

    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.textContent).toContain("添加智能体");
    expect(dialog.textContent).toContain("选择下一步操作");
    expect(dialog.querySelector('button[aria-label="关闭对话框"]')).toBeTruthy();

    const trigger = Array.from(dialog.querySelectorAll("button")).find(
      (button) => button.textContent === "更多操作",
    ) as HTMLButtonElement;
    await act(async () => {
      trigger.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }));
      await settle();
    });
    expect(document.querySelector('[role="menu"]')?.textContent).toContain("编辑");
    expect(document.querySelector('[role="menu"]')?.textContent).toContain("删除");

    await act(async () => {
      (document.querySelector('[role="menuitem"]') as HTMLButtonElement).click();
      await settle();
    });
    expect(onSelect).toHaveBeenCalledWith("edit");
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);

    const refresh = Array.from(dialog.querySelectorAll("button")).find(
      (button) => button.textContent === "刷新",
    ) as HTMLButtonElement;
    expect(refresh.getAttribute("aria-describedby")).toBeTruthy();
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe("刷新状态");

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
      await settle();
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("supports searching and multi-selecting agents in the Chat Info add-agent dialog", async () => {
    const onAddAgentToChat = vi.fn();
    const chatSnapshot = {
      ...snapshot(),
      agents: [
        ...snapshot().agents,
        {
          capabilityTags: ["quality"],
          createdAt: "2026-05-21T00:00:00.000Z",
          displayName: "Reviewer",
          id: "agent_reviewer",
          ownerUserId: "user_1",
          policy: {},
          providerId: "provider_1",
          role: "worker" as const,
          systemPrompt: "Review work.",
          updatedAt: "2026-05-21T00:00:00.000Z",
          workspaceId: "workspace_1",
        },
      ],
      conversationParticipants: [
        {
          addedByUserId: "user_1",
          agentId: "agent_1",
          archivedAt: null,
          conversationId: "conversation_1",
          createdAt: "2026-05-21T00:00:00.000Z",
          id: "participant_1",
          ownerUserId: "user_1",
          updatedAt: "2026-05-21T00:00:00.000Z",
        },
        {
          addedByUserId: "user_1",
          agentId: "agent_2",
          archivedAt: null,
          conversationId: "conversation_1",
          createdAt: "2026-05-21T00:00:00.000Z",
          id: "participant_2",
          ownerUserId: "user_1",
          updatedAt: "2026-05-21T00:00:00.000Z",
        },
      ],
    };
    await render(
      <AgentHubWorkbench
        initialInspectorSelection={{ id: "conversation_1", mode: "chat-info" }}
        onAddAgentToChat={onAddAgentToChat}
        snapshot={chatSnapshot}
      />,
    );

    const titleButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.getAttribute("aria-label") === "Open chat information for MVP workbench",
    ) as HTMLButtonElement;
    await act(async () => {
      titleButton.click();
      await settle();
    });
    const addButton = document.querySelector('button[aria-label="Add agent"]') as HTMLButtonElement;
    expect(addButton).toBeTruthy();
    await act(async () => {
      addButton.click();
      await settle();
    });

    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("Add agent");
    const search = document.querySelector(
      'input[aria-label="Search agents to add"]',
    ) as HTMLInputElement;
    expect(search).toBeTruthy();
    expect(document.querySelector('[role="dialog"] select')).toBeNull();
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("Researcher");
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("Reviewer");

    await act(async () => {
      search.value = "review";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      await settle();
    });
    expect(document.querySelector('[role="dialog"]')?.textContent).not.toContain("Researcher");
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("Reviewer");

    const reviewerOption = document.querySelector(
      'button[aria-label="Select Reviewer"]',
    ) as HTMLButtonElement;
    await act(async () => {
      reviewerOption.click();
      await settle();
    });
    expect(reviewerOption.getAttribute("aria-pressed")).toBe("true");

    await act(async () => {
      search.value = "";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      await settle();
    });
    const researcherOption = document.querySelector(
      'button[aria-label="Select Researcher"]',
    ) as HTMLButtonElement;
    await act(async () => {
      researcherOption.click();
      await settle();
    });

    const confirm = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent === "Add 2",
    ) as HTMLButtonElement;
    await act(async () => {
      confirm.click();
      await nextFrame();
    });

    expect(onAddAgentToChat).toHaveBeenCalledWith("conversation_1", "agent_researcher");
    expect(onAddAgentToChat).toHaveBeenCalledWith("conversation_1", "agent_reviewer");
    expect(onAddAgentToChat).toHaveBeenCalledTimes(2);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("opens the Chat new-conversation flow without changing the active chat", async () => {
    const onCreateConversation = vi.fn();
    await render(
      <AgentHubWorkbench
        onCreateConversation={onCreateConversation}
        snapshot={snapshotWithParticipants()}
      />,
    );

    const newConversation = document.querySelector(
      'button[aria-label="New conversation"]',
    ) as HTMLButtonElement;
    expect(newConversation).toBeTruthy();
    expect(document.body.textContent).toContain("MVP workbench");

    await act(async () => {
      newConversation.click();
      await settle();
    });
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("New conversation");
    expect(document.querySelector(".agenthub-new-conversation-modal .agenthub-dialog-close")).toBeNull();
    expect(document.body.textContent).toContain("MVP workbench");

    const implementerOption = document.querySelector(
      'button[aria-label="Select Implementer"]',
    ) as HTMLButtonElement;
    await act(async () => {
      implementerOption.click();
      await settle();
    });
    const next = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent === "Next",
    ) as HTMLButtonElement;
    await act(async () => {
      next.click();
      await settle();
    });

    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("AgentHub");
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain(
      "~/IdeaProjects/agenthub",
    );
    const create = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent === "Create",
    ) as HTMLButtonElement;
    await act(async () => {
      create.click();
      await settle();
    });

    expect(onCreateConversation).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      projectId: "project_1",
      agentIds: ["agent_2"],
    });
  });

  it("creates group conversations and keeps Desktop-only project actions optional", async () => {
    const onCreateConversation = vi.fn();
    const onChooseProjectDirectory = vi.fn();
    const onCreateDefaultProject = vi.fn();
    await render(
      <AgentHubWorkbench
        onChooseProjectDirectory={onChooseProjectDirectory}
        onCreateConversation={onCreateConversation}
        onCreateDefaultProject={onCreateDefaultProject}
        snapshot={snapshot()}
      />,
    );

    await act(async () => {
      (document.querySelector('button[aria-label="New conversation"]') as HTMLButtonElement).click();
      await settle();
    });
    for (const label of ["Select Orchestrator", "Select Implementer"]) {
      await act(async () => {
        (document.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement).click();
        await settle();
      });
    }
    await act(async () => {
      (
        Array.from(document.querySelectorAll("button")).find(
          (button) => button.textContent === "Next",
        ) as HTMLButtonElement
      ).click();
      await settle();
    });

    const chooseFolder = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("New from folder"),
    ) as HTMLButtonElement;
    const useDefault = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("New default project"),
    ) as HTMLButtonElement;
    expect(chooseFolder.disabled).toBe(false);
    expect(useDefault.disabled).toBe(true);
    await act(async () => {
      chooseFolder.click();
      await settle();
    });
    const nameInput = document.querySelector(
      'input[aria-label="Project name"]',
    ) as HTMLInputElement;
    await act(async () => {
      nameInput.value = "Group project";
      nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      await settle();
    });
    expect(useDefault.disabled).toBe(false);
    await act(async () => {
      useDefault.click();
      await settle();
    });
    expect(onChooseProjectDirectory).toHaveBeenCalledOnce();
    expect(onCreateDefaultProject).toHaveBeenCalledWith("Group project");

    await act(async () => {
      (
        Array.from(document.querySelectorAll("button")).find(
          (button) => button.textContent === "Create",
        ) as HTMLButtonElement
      ).click();
      await settle();
    });
    expect(onCreateConversation).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      projectId: "project_1",
      agentIds: ["agent_1", "agent_2"],
    });
  });

  it("keeps remote clients on existing projects and surfaces creation failures", async () => {
    const onCreateConversation = vi.fn().mockRejectedValue(new Error("Project is offline"));
    await render(
      <AgentHubWorkbench onCreateConversation={onCreateConversation} snapshot={snapshot()} />,
    );

    await act(async () => {
      (document.querySelector('button[aria-label="New conversation"]') as HTMLButtonElement).click();
      await settle();
    });
    await act(async () => {
      (
        document.querySelector('button[aria-label="Select Implementer"]') as HTMLButtonElement
      ).click();
      await settle();
    });
    await act(async () => {
      (
        Array.from(document.querySelectorAll("button")).find(
          (button) => button.textContent === "Next",
        ) as HTMLButtonElement
      ).click();
      await settle();
    });

    const chooseFolder = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("New from folder"),
    );
    expect(chooseFolder).toBeUndefined();
    expect(document.querySelector('[role="dialog"]')?.textContent).not.toContain(
      "Open Desktop to add a local project.",
    );

    await act(async () => {
      (
        Array.from(document.querySelectorAll("button")).find(
          (button) => button.textContent === "Create",
        ) as HTMLButtonElement
      ).click();
      await settle();
    });
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("Project is offline");
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it("shows a concise degraded state when Desktop project capabilities are unavailable", async () => {
    await render(<AgentHubWorkbench desktopProjectActionsUnavailable snapshot={snapshot()} />);

    await act(async () => {
      (document.querySelector('button[aria-label="New conversation"]') as HTMLButtonElement).click();
      await settle();
    });
    await act(async () => {
      (
        document.querySelector('button[aria-label="Select Implementer"]') as HTMLButtonElement
      ).click();
      await settle();
    });
    await act(async () => {
      (
        Array.from(document.querySelectorAll("button")).find(
          (button) => button.textContent === "Next",
        ) as HTMLButtonElement
      ).click();
      await settle();
    });

    expect(document.querySelector('[role="dialog"]')?.textContent).toContain(
      "Desktop project actions are unavailable.",
    );
    expect(
      Array.from(document.querySelectorAll("button")).find((button) =>
        button.textContent?.includes("New from folder"),
      ),
    ).toBeUndefined();
  });

  it("lets users name Desktop-selected folder projects before creating conversations", async () => {
    const onCreateConversation = vi.fn();
    const onChooseProjectDirectory = vi.fn().mockResolvedValue({
      projectId: "project_desktop_selected",
      desktopProjectRegistration: {
        source: "desktop-directory",
        runtimeDeviceId: "runtime_local_demo",
        displayName: "selected-project",
        localPath: "/tmp/selected-project",
        localPathLabel: "/tmp/selected-project",
        gitBranch: "main",
        dirty: false,
      },
    });
    await render(
      <AgentHubWorkbench
        onChooseProjectDirectory={onChooseProjectDirectory}
        onCreateConversation={onCreateConversation}
        snapshot={snapshot()}
      />,
    );

    await act(async () => {
      (document.querySelector('button[aria-label="New conversation"]') as HTMLButtonElement).click();
      await settle();
    });
    await act(async () => {
      (
        document.querySelector('button[aria-label="Select Implementer"]') as HTMLButtonElement
      ).click();
      await settle();
    });
    await act(async () => {
      (
        Array.from(document.querySelectorAll("button")).find(
          (button) => button.textContent === "Next",
        ) as HTMLButtonElement
      ).click();
      await settle();
    });
    await act(async () => {
      (
        Array.from(document.querySelectorAll("button")).find((button) =>
          button.textContent?.includes("New from folder"),
        ) as HTMLButtonElement
      ).click();
      await settle();
    });

    const nameInput = document.querySelector(
      'input[aria-label="Project name"]',
    ) as HTMLInputElement;
    expect(nameInput.value).toBe("selected-project");
    await act(async () => {
      nameInput.value = "Renamed project";
      nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      await settle();
    });
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("Renamed project");
    await act(async () => {
      (
        Array.from(document.querySelectorAll("button")).find(
          (button) => button.textContent === "Create",
        ) as HTMLButtonElement
      ).click();
      await settle();
    });
    expect(onCreateConversation).toHaveBeenCalledWith({
      workspaceId: "workspace_1",
      projectId: "project_desktop_selected",
      agentIds: ["agent_2"],
      desktopProjectRegistration: {
        source: "desktop-directory",
        runtimeDeviceId: "runtime_local_demo",
        displayName: "Renamed project",
        localPath: "/tmp/selected-project",
        localPathLabel: "/tmp/selected-project",
        gitBranch: "main",
        dirty: false,
      },
    });
  });

  it("requires a name for default Desktop projects and sends it to the bridge", async () => {
    const onCreateConversation = vi.fn();
    const onCreateDefaultProject = vi.fn().mockResolvedValue({
      projectId: "project_desktop_named_default",
      desktopProjectRegistration: {
        source: "desktop-default",
        runtimeDeviceId: "runtime_local_demo",
        displayName: "API Client",
        localPath: "/Users/example/AgentHub/API Client",
        localPathLabel: "/Users/example/AgentHub/API Client",
        gitBranch: null,
        dirty: false,
      },
    });
    await render(
      <AgentHubWorkbench
        onCreateConversation={onCreateConversation}
        onCreateDefaultProject={onCreateDefaultProject}
        snapshot={snapshot()}
      />,
    );

    await act(async () => {
      (document.querySelector('button[aria-label="New conversation"]') as HTMLButtonElement).click();
      await settle();
    });
    await act(async () => {
      (
        document.querySelector('button[aria-label="Select Implementer"]') as HTMLButtonElement
      ).click();
      await settle();
    });
    await act(async () => {
      (
        Array.from(document.querySelectorAll("button")).find(
          (button) => button.textContent === "Next",
        ) as HTMLButtonElement
      ).click();
      await settle();
    });

    const nameInput = document.querySelector(
      'input[aria-label="Project name"]',
    ) as HTMLInputElement;
    const createDefault = Array.from(document.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("New default project"),
    ) as HTMLButtonElement;
    expect(createDefault.disabled).toBe(true);
    await act(async () => {
      nameInput.value = "API Client";
      nameInput.dispatchEvent(new Event("input", { bubbles: true }));
      await settle();
    });
    expect(createDefault.disabled).toBe(false);
    await act(async () => {
      createDefault.click();
      await settle();
    });

    expect(onCreateDefaultProject).toHaveBeenCalledWith("API Client");
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("API Client");
  });

  it("updates conversation settings from the Chat Info panel", async () => {
    const onUpdateConversation = vi.fn();
    const onDeleteConversation = vi.fn();
    await render(
      <AgentHubWorkbench
        initialInspectorSelection={{ id: "conversation_1", mode: "chat-info" }}
        layoutMode="wide"
        onDeleteConversation={onDeleteConversation}
        onUpdateConversation={onUpdateConversation}
        snapshot={snapshot()}
      />,
    );
    await settle();

    const titleInput = document.querySelector(".agenthub-chat-title-input") as HTMLInputElement;
    expect(titleInput).toBeTruthy();
    await act(async () => {
      titleInput.focus();
      titleInput.value = "Renamed chat";
      titleInput.dispatchEvent(new Event("input", { bubbles: true }));
      titleInput.dispatchEvent(new Event("change", { bubbles: true }));
      titleInput.blur();
      await settle();
    });
    expect(onUpdateConversation).toHaveBeenCalledWith("conversation_1", {
      title: "Renamed chat",
    });

    const pinSwitch = document.querySelector(
      'button[aria-label="Pin conversation"]',
    ) as HTMLButtonElement;
    const notificationsSwitch = document.querySelector(
      'button[aria-label="Notifications"]',
    ) as HTMLButtonElement;
    await act(async () => {
      pinSwitch.click();
      notificationsSwitch.click();
      await settle();
    });
    expect(onUpdateConversation).toHaveBeenCalledWith("conversation_1", { pinned: true });
    expect(onUpdateConversation).toHaveBeenCalledWith("conversation_1", {
      notificationsMuted: true,
    });

    const deleteButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent === "Delete conversation",
    ) as HTMLButtonElement;
    await act(async () => {
      deleteButton.click();
      await settle();
    });
    expect(onDeleteConversation).toHaveBeenCalledWith("conversation_1");
  });

  it("switches Settings categories and filters the Settings directory", async () => {
    await render(<AgentHubWorkbench initialCenterView="settings" snapshot={snapshot()} />);

    expect(document.querySelector('input[aria-label="Search settings"]')).toBeTruthy();
    expect(document.querySelector(".agenthub-settings-detail")?.textContent).toContain("Language");
    expect(document.querySelector(".agenthub-settings-detail")?.textContent).toContain(
      "Appearance",
    );

    const shortcuts = Array.from(document.querySelectorAll(".agenthub-settings-category-row")).find(
      (button) => button.textContent?.includes("Shortcuts"),
    ) as HTMLButtonElement;
    await act(async () => {
      shortcuts.click();
      await settle();
    });

    expect(shortcuts.getAttribute("aria-pressed")).toBe("true");
    expect(document.querySelector(".agenthub-settings-detail")?.textContent).toContain("Keyboard");
    expect(document.querySelector(".agenthub-settings-detail")?.textContent).not.toContain(
      "Language",
    );

    const search = document.querySelector(
      'input[aria-label="Search settings"]',
    ) as HTMLInputElement;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(
        search,
        "permission",
      );
      search.dispatchEvent(new InputEvent("input", { bubbles: true }));
      await settle();
    });

    const directoryText = document.querySelector(".agenthub-settings-directory")?.textContent ?? "";
    expect(directoryText).toContain("Notifications");
    expect(directoryText).not.toContain("Shortcuts");
  });

  it("requests connection checks and shows pending state", async () => {
    let resolveCheck: (() => void) | null = null;
    const onCheckConnections = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveCheck = resolve;
        }),
    );
    await render(
      <AgentHubWorkbench
        initialCenterView="connections"
        onCheckConnections={onCheckConnections}
        snapshot={snapshot()}
      />,
    );

    const claudeCode = Array.from(document.querySelectorAll("button")).find((button) =>
      button.textContent?.includes("Claude Code"),
    ) as HTMLButtonElement;
    await act(async () => {
      claudeCode.click();
      await settle();
    });

    const checkConnection = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Check connection",
    ) as HTMLButtonElement;
    await act(async () => {
      checkConnection.click();
      await settle();
    });

    expect(onCheckConnections).toHaveBeenCalledWith(["provider"]);
    expect(document.querySelector(".agenthub-connection-detail")?.textContent).toContain(
      "Checking",
    );

    await act(async () => {
      resolveCheck?.();
      await settle();
    });

    const checkAll = document.querySelector('button[aria-label="Check all"]') as HTMLButtonElement;
    await act(async () => {
      checkAll.click();
      await settle();
    });

    expect(onCheckConnections).toHaveBeenLastCalledWith(["provider", "claude-code"]);
  });

  it("shows add-agent empty and no-results states", async () => {
    const onAddAgentToChat = vi.fn();
    const chatSnapshot = {
      ...snapshot(),
      conversationParticipants: snapshot().agents.map((agent, index) => ({
        addedByUserId: "user_1",
        agentId: agent.id,
        archivedAt: null,
        conversationId: "conversation_1",
        createdAt: "2026-05-21T00:00:00.000Z",
        id: `participant_${index}`,
        ownerUserId: "user_1",
        updatedAt: "2026-05-21T00:00:00.000Z",
      })),
    };
    await render(
      <AgentHubWorkbench
        initialInspectorSelection={{ id: "conversation_1", mode: "chat-info" }}
        onAddAgentToChat={onAddAgentToChat}
        snapshot={chatSnapshot}
      />,
    );

    const titleButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.getAttribute("aria-label") === "Open chat information for MVP workbench",
    ) as HTMLButtonElement;
    await act(async () => {
      titleButton.click();
      await settle();
    });
    const addButton = document.querySelector('button[aria-label="Add agent"]') as HTMLButtonElement;
    expect(addButton.disabled).toBe(false);

    await act(async () => {
      addButton.click();
      await settle();
    });
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain(
      "No agents available to add",
    );
    expect(
      Array.from(document.querySelectorAll("button"))
        .find((button) => button.textContent === "Add")
        ?.getAttribute("disabled"),
    ).not.toBeNull();

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }));
      await nextFrame();
    });

    const searchableSnapshot = {
      ...snapshot(),
      conversationParticipants: [
        {
          addedByUserId: "user_1",
          agentId: "agent_1",
          archivedAt: null,
          conversationId: "conversation_1",
          createdAt: "2026-05-21T00:00:00.000Z",
          id: "participant_1",
          ownerUserId: "user_1",
          updatedAt: "2026-05-21T00:00:00.000Z",
        },
      ],
    };
    await act(async () => {
      for (const root of mountedRoots.splice(0)) {
        root.unmount();
      }
      for (const container of mountedContainers.splice(0)) {
        container.remove();
      }
    });
    await render(
      <AgentHubWorkbench
        initialInspectorSelection={{ id: "conversation_1", mode: "chat-info" }}
        onAddAgentToChat={onAddAgentToChat}
        snapshot={searchableSnapshot}
      />,
    );

    const secondTitleButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.getAttribute("aria-label") === "Open chat information for MVP workbench",
    ) as HTMLButtonElement;
    await act(async () => {
      secondTitleButton.click();
      await settle();
    });
    const searchableAddButton = document.querySelector(
      'button[aria-label="Add agent"]',
    ) as HTMLButtonElement;
    await act(async () => {
      searchableAddButton.click();
      await settle();
    });
    const search = document.querySelector(
      'input[aria-label="Search agents to add"]',
    ) as HTMLInputElement;
    await act(async () => {
      search.value = "missing";
      search.dispatchEvent(new Event("input", { bubbles: true }));
      await settle();
    });
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("No matching agents");
  });

  it("covers form controls, tabs, menus, tooltip, toast, and loading labels", async () => {
    const onSearch = vi.fn();
    const onSelect = vi.fn();
    const onSwitch = vi.fn();
    const onTabs = vi.fn();
    const onMenu = vi.fn();
    const textAreaRef = React.createRef<HTMLTextAreaElement>();

    await render(
      <ThemeRoot mode="dark">
        <Switch ariaLabel="Toggle theme" checked={false} onCheckedChange={onSwitch} />
        <SearchInput
          ariaLabel="Search conversations"
          clearLabel="Clear conversations"
          onValueChange={onSearch}
          value="query"
        />
        <Select
          ariaLabel="Role"
          onValueChange={onSelect}
          options={[{ label: "Worker", value: "worker" }]}
          value="worker"
        />
        <TextArea ariaLabel="Prompt" ref={textAreaRef} />
        <Tabs
          onValueChange={onTabs}
          value="one"
          items={[
            { children: "One panel", key: "one", label: "One" },
            { children: "Two panel", key: "two", label: "Two" },
          ]}
        />
        <DropdownMenu
          items={[
            { id: "open", label: "Open" },
            { disabled: true, id: "disabled", label: "Disabled" },
            { id: "delete", label: "Delete", tone: "danger" },
          ]}
          onSelect={onMenu}
          trigger={<Button>Menu</Button>}
        />
        <FormField error="Required" hint="Use a short name" label="Name">
          <input aria-describedby="existing-help" aria-label="Name" />
        </FormField>
        <Tooltip content="Refresh data">
          <button aria-describedby="existing-tip" type="button">
            Refresh
          </button>
        </Tooltip>
        <Toast duration={0} />
        <LoadingState label="加载中" variant="spinner" />
      </ThemeRoot>,
    );

    await act(async () => {
      (document.querySelector('[role="switch"]') as HTMLButtonElement).click();
    });
    expect(onSwitch).toHaveBeenCalledWith(true);

    await act(async () => {
      (document.querySelector(".agenthub-search-clear") as HTMLButtonElement).click();
    });
    expect(onSearch).toHaveBeenCalledWith("");

    const select = document.querySelector("select") as HTMLSelectElement;
    select.value = "worker";
    await act(async () => {
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(onSelect).toHaveBeenCalledWith("worker");
    expect(textAreaRef.current?.tagName).toBe("TEXTAREA");

    const firstTab = document.querySelector('[role="tab"]') as HTMLButtonElement;
    await act(async () => {
      firstTab.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }));
    });
    expect(onTabs).toHaveBeenCalledWith("two");
    expect(document.querySelector('[role="tabpanel"]')?.textContent).toBe("One panel");

    const focusedBeforeMenu = document.querySelector("input") as HTMLInputElement;
    focusedBeforeMenu.focus();
    await act(async () => {
      await nextFrame();
    });
    expect(document.activeElement).toBe(focusedBeforeMenu);

    const menuTrigger = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent === "Menu",
    ) as HTMLButtonElement;
    await act(async () => {
      menuTrigger.click();
      await nextFrame();
    });
    const menuItems = document.querySelectorAll('[role="menuitem"]');
    expect(menuItems.length).toBe(3);
    expect(document.activeElement).toBe(menuItems[0]);
    expect(menuItems[1]?.hasAttribute("disabled")).toBe(true);
    await act(async () => {
      (menuItems[0] as HTMLButtonElement).dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "ArrowDown" }),
      );
    });
    expect(document.activeElement).toBe(menuItems[2]);
    await act(async () => {
      (menuItems[2] as HTMLButtonElement).dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
      );
      await nextFrame();
    });
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(menuTrigger);

    await act(async () => {
      menuTrigger.click();
      await nextFrame();
    });
    const reopenedMenuItems = document.querySelectorAll('[role="menuitem"]');
    await act(async () => {
      (reopenedMenuItems[2] as HTMLButtonElement).click();
    });
    expect(onMenu).toHaveBeenCalledWith("delete");

    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe("Refresh data");
    const refreshButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.textContent === "Refresh",
    ) as HTMLButtonElement;
    expect(refreshButton.getAttribute("aria-describedby")).toContain("existing-tip");
    expect(refreshButton.getAttribute("aria-describedby")).toContain(
      document.querySelector('[role="tooltip"]')?.id,
    );
    const namedInput = document.querySelector('input[aria-label="Name"]') as HTMLInputElement;
    const formError = document.querySelector(".agenthub-form-error") as HTMLElement;
    const formHint = document.querySelector(
      ".agenthub-form-field small:not(.agenthub-form-error)",
    ) as HTMLElement;
    expect(namedInput.getAttribute("aria-describedby")).toContain("existing-help");
    expect(namedInput.getAttribute("aria-describedby")).toContain(formError.id);
    expect(namedInput.getAttribute("aria-describedby")).toContain(formHint.id);
    expect(document.querySelector(".agenthub-loading-spinner")?.getAttribute("aria-label")).toBe(
      "加载中",
    );

    await act(async () => {
      agentHubMessage.success("Saved");
      await nextFrame();
    });
    expect(document.querySelector(".agenthub-toast")?.textContent).toContain("Saved");
  });

  it("keeps tab ids unique across tabsets and dismisses static toasts", async () => {
    const onDismiss = vi.fn();
    await render(
      <ThemeRoot mode="light">
        <Tabs items={[{ children: "First panel", key: "same", label: "Same" }]} value="same" />
        <Tabs items={[{ children: "Second panel", key: "same", label: "Same" }]} value="same" />
        <Toast content="Saved" duration={0} onDismiss={onDismiss} />
      </ThemeRoot>,
    );

    const tabIds = Array.from(document.querySelectorAll('[role="tab"]')).map((tab) => tab.id);
    expect(new Set(tabIds).size).toBe(tabIds.length);
    const panelIds = Array.from(document.querySelectorAll('[role="tabpanel"]')).map(
      (panel) => panel.id,
    );
    expect(new Set(panelIds).size).toBe(panelIds.length);

    const dismissButton = document.querySelector(".agenthub-toast button") as HTMLButtonElement;
    await act(async () => {
      dismissButton.click();
      await nextFrame();
    });
    expect(document.querySelector(".agenthub-toast")).toBeNull();
    expect(onDismiss).toHaveBeenCalledWith("static");
  });

  it("renders component CSS and variables under isolated ThemeRoot", async () => {
    const container = await render(
      <ThemeRoot mode="light">
        <Button>Save</Button>
        <Select
          ariaLabel="Role"
          onValueChange={() => undefined}
          options={[{ label: "Worker", value: "worker" }]}
          value="worker"
        />
        <Dialog open title="Dialog">
          Body
        </Dialog>
        <Switch ariaLabel="Switch" checked onCheckedChange={() => undefined} />
        <SearchInput ariaLabel="Search" onValueChange={() => undefined} value="abc" />
        <Tabs items={[{ children: "Panel", key: "panel", label: "Panel" }]} value="panel" />
        <LoadingState label="Loading data" />
        <Toast content="Hello" duration={0} />
      </ThemeRoot>,
    );

    const styleText = container.querySelector("style")?.textContent ?? "";
    const root = container.querySelector(".agenthub-theme-root") as HTMLElement;
    expect(root.getAttribute("style")).toContain("--agenthub-bg");
    expect(styleText).toContain(".agenthub-button");
    expect(styleText).toContain(".agenthub-dialog");
    expect(styleText).toContain(".agenthub-toast");
  });

  it("opens run detail from the header detail action", async () => {
    const container = await render(<AgentHubWorkbench snapshot={snapshot()} />);
    const runButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.getAttribute("aria-label") === "Open run details",
    ) as HTMLButtonElement;

    await act(async () => {
      runButton.click();
      await settle();
    });

    expect(container.textContent).toContain("Run running");
    expect(container.textContent).toContain("Implementer");
  });

  it("opens conversation detail from the active chat title without a header info action", async () => {
    const container = await render(
      <AgentHubWorkbench
        initialInspectorSelection={{ id: "run_1", mode: "run" }}
        snapshot={snapshotWithParticipants()}
      />,
    );

    expect(
      Array.from(container.querySelectorAll("button")).some(
        (button) => button.getAttribute("aria-label") === "Open conversation info",
      ),
    ).toBe(false);
    expect(container.textContent).toContain("Run running");
    const titleButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.getAttribute("aria-label") === "Open chat information for MVP workbench",
    ) as HTMLButtonElement;
    expect(titleButton.tagName).toBe("BUTTON");

    await act(async () => {
      titleButton.click();
      await settle();
    });

    expect(container.textContent).toContain("Conversation settings");
    expect(container.textContent).toContain("Participants");
  });

  it("opens agent-in-chat settings from timeline author identity and participant tiles", async () => {
    const container = await render(<AgentHubWorkbench snapshot={snapshotWithParticipants()} />);

    const authorButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.getAttribute("aria-label") === "Open Implementer in chat agent",
    ) as HTMLButtonElement;
    await act(async () => {
      authorButton.click();
      await settle();
    });

    expect(container.textContent).toContain("Agent in this chat");
    expect(container.textContent).toContain("Own implementation inside this group chat.");
    expect(container.textContent).toContain("Open global agent settings");

    const titleButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.getAttribute("aria-label") === "Open chat information for MVP workbench",
    ) as HTMLButtonElement;
    await act(async () => {
      titleButton.click();
      await settle();
    });
    const participantButton = Array.from(container.querySelectorAll("button")).find(
      (button) =>
        button.getAttribute("aria-label") ===
        "Open Implementer in chat settings in this conversation",
    ) as HTMLButtonElement;

    await act(async () => {
      participantButton.click();
      await settle();
    });

    expect(container.textContent).toContain("Agent in this chat");
    expect(container.textContent).toContain("Scoped instructions");
    expect(container.textContent).toContain("Keep answers scoped to this chat.");
  });

  it("submits scoped agent-in-chat setting edits without leaving the conversation", async () => {
    const onUpdateConversationAgentSettings = vi.fn();
    const container = await render(
      <AgentHubWorkbench
        onUpdateConversationAgentSettings={onUpdateConversationAgentSettings}
        snapshot={snapshotWithParticipants()}
      />,
    );
    const authorButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.getAttribute("aria-label") === "Open Implementer in chat agent",
    ) as HTMLButtonElement;
    await act(async () => {
      authorButton.click();
      await settle();
    });

    const displayNameInput = container.querySelector(
      'input[aria-label="Display name"]',
    ) as HTMLInputElement;
    await act(async () => {
      displayNameInput.value = "Builder in chat";
      displayNameInput.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
      await settle();
    });
    const quietModeSwitch = container.querySelector(
      'button[aria-label="Quiet mode"]',
    ) as HTMLButtonElement;
    await act(async () => {
      quietModeSwitch.click();
      await settle();
    });

    expect(onUpdateConversationAgentSettings).toHaveBeenCalledWith(
      "conversation_1",
      "agent_2",
      { displayNameOverride: "Builder in chat" },
    );
    expect(onUpdateConversationAgentSettings).toHaveBeenCalledWith(
      "conversation_1",
      "agent_2",
      { quietMode: true },
    );
    expect(container.querySelector(".agenthub-center")?.getAttribute("data-view")).toBe(
      "conversation",
    );
  });

  it("removes an agent from the active chat from the agent-in-chat settings", async () => {
    const onRemoveAgentFromChat = vi.fn();
    const container = await render(
      <AgentHubWorkbench
        onRemoveAgentFromChat={onRemoveAgentFromChat}
        snapshot={snapshotWithParticipants()}
      />,
    );
    const authorButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.getAttribute("aria-label") === "Open Implementer in chat agent",
    ) as HTMLButtonElement;

    await act(async () => {
      authorButton.click();
      await settle();
    });

    const removeButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Remove agent from this chat",
    ) as HTMLButtonElement;
    await act(async () => {
      removeButton.click();
      await settle();
    });

    expect(onRemoveAgentFromChat).toHaveBeenCalledWith("conversation_1", "agent_2");
  });

  it("disables agent-in-chat removal when membership removal is unavailable", async () => {
    const container = await render(<AgentHubWorkbench snapshot={snapshotWithParticipants()} />);
    const authorButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.getAttribute("aria-label") === "Open Implementer in chat agent",
    ) as HTMLButtonElement;

    await act(async () => {
      authorButton.click();
      await settle();
    });

    const removeButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Remove agent from this chat",
    ) as HTMLButtonElement;

    expect(removeButton.disabled).toBe(true);
  });

  it("opens agent-in-chat settings as an overlay in narrow layouts", async () => {
    const container = await render(
      <AgentHubWorkbench layoutMode="narrow" snapshot={snapshotWithParticipants()} />,
    );
    const authorButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.getAttribute("aria-label") === "Open Implementer in chat agent",
    ) as HTMLButtonElement;

    await act(async () => {
      authorButton.click();
      await settle();
    });

    expect(
      container.querySelector(".agenthub-workbench")?.getAttribute("data-mobile-right-open"),
    ).toBe("true");
    expect(container.textContent).toContain("Agent in this chat");
    expect(container.textContent).toContain("Global defaults");
  });

  it("dismisses overlay detail surfaces by clicking outside the panel", async () => {
    const container = await render(
      <AgentHubWorkbench layoutMode="narrow" snapshot={snapshot()} />,
    );
    const titleButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.getAttribute("aria-label") === "Open chat information for MVP workbench",
    ) as HTMLButtonElement;

    await act(async () => {
      titleButton.click();
      await settle();
    });
    expect(container.textContent).toContain("Conversation settings");

    const backdrop = container.querySelector(".agenthub-detail-backdrop") as HTMLButtonElement;
    await act(async () => {
      backdrop.click();
      await settle();
    });

    expect(
      container.querySelector(".agenthub-workbench")?.getAttribute("data-mobile-right-open"),
    ).toBe("false");
    expect(container.textContent).toContain("Implemented the shell");
  });
});
