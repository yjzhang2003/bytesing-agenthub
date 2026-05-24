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

    const openChatInfoButton = Array.from(document.querySelectorAll("button")).find((button) =>
      button.getAttribute("aria-label")?.includes("Open chat information"),
    ) as HTMLButtonElement | undefined;
    await act(async () => {
      openChatInfoButton?.click();
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
    expect(document.querySelector("select")).toBeNull();
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

    const openChatInfoButton = Array.from(document.querySelectorAll("button")).find((button) =>
      button.getAttribute("aria-label")?.includes("Open chat information"),
    ) as HTMLButtonElement | undefined;
    await act(async () => {
      openChatInfoButton?.click();
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

    const secondOpenChatInfoButton = Array.from(document.querySelectorAll("button")).find(
      (button) => button.getAttribute("aria-label")?.includes("Open chat information"),
    ) as HTMLButtonElement | undefined;
    await act(async () => {
      secondOpenChatInfoButton?.click();
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
});
