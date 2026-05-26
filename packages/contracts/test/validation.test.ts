import { describe, expect, it } from "vitest";
import {
  agentHubApiPaths,
  isDiffMetadataStale,
  validateAddConversationAgentRequest,
  validateCreateConnectionCheckRequest,
  validateConversationAgentClaudeSession,
  validateCreateAgentConversationRequest,
  validateCreateLocalRunRequest,
  validateDesktopCapabilityBridgeInfo,
  validateDesktopProjectActionResult,
  validateDesktopProjectSelection,
  validateDesktopProjectRegistration,
  validateCreateAgentRequest,
  validateRuntimeConnectionCheckResult,
  validateRuntimeRegistrationPayload,
  validateServiceHealth,
  validateWorkbenchSnapshot,
  validateWorkspaceMetadata,
  validateDiffMetadata,
  validateMemoryHealth,
  validateOrchestratorDispatchPlan,
  validateProviderHealth,
  validateProviderRuntimeEvent,
  validateProjectMetadata,
  validateRuntimeCommand,
  validateUpdateAgentRequest,
} from "../src/index.js";
import {
  claudeCodeRunStartCommandFixture,
  runCancelCommandFixture,
  smokeProviderOutputFixtures,
} from "./run-loop-fixtures.js";

describe("contract validation", () => {
  it("rejects invalid orchestrator output without steps", () => {
    const result = validateOrchestratorDispatchPlan({
      id: "plan_1",
      conversationId: "conv_1",
      workspaceId: "workspace_1",
      goal: "Implement feature",
      status: "draft",
      steps: [],
    });

    expect(result.ok).toBe(false);
    expect(result.issues?.join("\n")).toContain("Too small");
  });

  it("rejects invalid provider runtime event type", () => {
    const result = validateProviderRuntimeEvent({
      type: "unknown.event",
      runId: "run_1",
      agentId: "agent_1",
    });

    expect(result.ok).toBe(false);
  });

  it("accepts run loop command and provider event contracts", () => {
    expect(
      validateCreateLocalRunRequest({
        workspaceId: "workspace_1",
        projectId: "project_1",
        conversationId: "conversation_1",
        agentId: "agent_1",
        prompt: "Implement the feature",
        planId: null,
      }).ok,
    ).toBe(true);

    expect(validateRuntimeCommand(claudeCodeRunStartCommandFixture).ok).toBe(true);

    expect(validateRuntimeCommand(runCancelCommandFixture).ok).toBe(true);

    expect(
      validateRuntimeCommand({
        id: "command_check_1",
        type: "connection.check",
        runtimeDeviceId: "runtime_local_demo",
        createdAt: "2026-05-24T00:00:00.000Z",
        payload: {
          workspaceId: "workspace_local_demo",
          targets: ["provider", "memory", "claude-code"],
        },
      }).ok,
    ).toBe(true);

    for (const event of smokeProviderOutputFixtures) {
      expect(validateProviderRuntimeEvent(event).ok).toBe(true);
    }

    expect(
      validateProviderRuntimeEvent({
        type: "provider.session",
        runId: "run_1",
        agentId: "agent_1",
        providerMode: "claude-code",
        sessionId: "session_1",
      }).ok,
    ).toBe(true);
  });

  it("accepts Desktop capability bridge and project action contracts", () => {
    const selection = {
      projectId: "project_desktop_1",
      desktopProjectRegistration: {
        source: "desktop-directory",
        runtimeDeviceId: "runtime_local_demo",
        displayName: "agenthub",
        localPath: "/tmp/agenthub",
        localPathLabel: "/tmp/agenthub",
        gitBranch: "main",
        gitBaseCommit: "abc123",
        dirty: false,
      },
    };

    expect(
      validateDesktopCapabilityBridgeInfo({
        version: "1.0.0",
        capabilities: ["project.choose-directory", "project.create-default"],
      }).ok,
    ).toBe(true);
    expect(validateDesktopProjectSelection(selection).ok).toBe(true);
    expect(
      validateDesktopProjectActionResult({
        status: "selected",
        selection,
      }).ok,
    ).toBe(true);
    expect(validateDesktopProjectActionResult({ status: "cancelled" }).ok).toBe(true);
    expect(
      validateDesktopProjectActionResult({
        status: "error",
        message: "Project path must be a directory",
      }).ok,
    ).toBe(true);
  });

  it("rejects invalid Desktop bridge payloads", () => {
    expect(
      validateDesktopCapabilityBridgeInfo({
        version: "2.0.0",
        capabilities: ["project.choose-directory"],
      }).ok,
    ).toBe(false);
    expect(
      validateDesktopProjectActionResult({
        status: "selected",
        selection: {
          projectId: "",
          desktopProjectRegistration: {},
        },
      }).ok,
    ).toBe(false);
  });

  it("accepts and preserves Claude Code run options on runtime commands", () => {
    const result = validateRuntimeCommand({
      id: "command_1",
      type: "run.start",
      runtimeDeviceId: "runtime_local_demo",
      createdAt: "2026-05-24T00:00:00.000Z",
      payload: {
        runId: "run_1",
        workspaceId: "workspace_1",
        projectId: "project_1",
        conversationId: "conversation_1",
        agentId: "agent_1",
        workspacePath: "/tmp/project",
        prompt: "Implement the feature",
        systemPrompt: "You are a worker",
        providerMode: "claude-code",
        claudeCode: {
          permissionPreset: "auto-edits",
          settingsSource: "managed",
          runtimeProfileId: "profile_engineering",
          mcpProfileId: "mcp_project",
          hooksPolicy: "disabled",
          allowedTools: ["Read", "Edit"],
          disallowedTools: ["Bash(git push *)"],
          effort: "high",
          session: { behavior: "new" },
        },
      },
    });

    expect(result.ok).toBe(true);
    expect((result.data as { payload: { claudeCode?: unknown } } | undefined)?.payload.claudeCode).toMatchObject({
      permissionPreset: "auto-edits",
      settingsSource: "managed",
      effort: "high",
    });
  });

  it("accepts hidden conversation-agent Claude session binding contracts", () => {
    const now = "2026-05-24T00:00:00.000Z";
    const result = validateConversationAgentClaudeSession({
      id: "binding_1",
      ownerUserId: "user_1",
      workspaceId: "workspace_1",
      conversationId: "conversation_1",
      agentId: "agent_1",
      providerMode: "claude-code",
      sessionId: null,
      lastRunId: null,
      claudeCode: {
        permissionPreset: "ask-first",
        settingsSource: "inherit",
        runtimeProfileId: "default",
        mcpProfileId: "none",
        pluginProfileId: "default",
        hooksPolicy: "disabled",
        allowedTools: [],
        disallowedTools: [],
      },
      createdAt: now,
      updatedAt: now,
    });

    expect(result.ok).toBe(true);
  });

  it("detects stale diff metadata fingerprints", () => {
    expect(isDiffMetadataStale("base:abc|dirty:1", "base:def|dirty:1")).toBe(true);
    expect(isDiffMetadataStale("base:abc|dirty:1", "base:abc|dirty:1")).toBe(false);
  });

  it("accepts valid diff metadata", () => {
    const result = validateDiffMetadata({
      workspaceId: "workspace_1",
      runId: "run_1",
      baseCommit: "abc123",
      workingTreeFingerprint: "base:abc123|dirty:1",
      cacheExpiresAt: null,
      changedFiles: [
        {
          path: "src/index.ts",
          status: "modified",
          insertions: 12,
          deletions: 3,
        },
      ],
    });

    expect(result.ok).toBe(true);
  });

  it("accepts local runnable health and runtime payloads", () => {
    const now = "2026-05-21T00:00:00.000Z";
    expect(
      validateServiceHealth({
        ok: true,
        service: "@agenthub/control-plane",
        version: "0.1.0",
        mode: "local-demo",
        timestamp: now,
        runtime: {
          online: true,
          deviceId: "runtime_local_demo",
          lastHeartbeatAt: now,
          capabilities: ["provider:smoke"],
        },
      }).ok,
    ).toBe(true);

    const workspace = {
      workspaceId: "workspace_local_demo",
      displayName: "AgentHub",
      localPathLabel: "/Users/example/agenthub",
      gitBranch: "main",
      gitBaseCommit: "abc123",
      dirty: false,
      providerCapabilities: ["provider:smoke"],
    };
    expect(validateWorkspaceMetadata(workspace).ok).toBe(true);
    expect(
      validateProjectMetadata({
        projectId: "project_local_demo",
        workspaceId: "workspace_local_demo",
        displayName: "AgentHub",
        runtimeDeviceId: "runtime_local_demo",
        localPathLabel: "/Users/example/agenthub",
        gitBranch: "main",
        gitBaseCommit: "abc123",
        dirty: false,
        isDefault: false,
        lastUsedAt: now,
      }).ok,
    ).toBe(true);
    expect(
      validateRuntimeRegistrationPayload({
        deviceId: "runtime_local_demo",
        displayName: "AgentHub Desktop Runtime",
        platform: "macos",
        appVersion: "0.1.0",
        capabilities: ["provider:smoke"],
        workspace,
      }).ok,
    ).toBe(true);
  });

  it("accepts provider and memory health contracts", () => {
    const now = "2026-05-22T00:00:00.000Z";

    expect(
      validateProviderHealth({
        providerMode: "claude-code",
        status: "connected",
        binaryPathLabel: "/usr/local/bin/claude",
        checkedAt: now,
        failureReason: null,
      }).ok,
    ).toBe(true);

    expect(
      validateMemoryHealth({
        enabled: true,
        status: "connected",
        url: "http://127.0.0.1:3111",
        viewerUrl: "http://127.0.0.1:3113",
        checkedAt: now,
        failureReason: null,
      }).ok,
    ).toBe(true);

    expect(
      validateCreateConnectionCheckRequest({
        workspaceId: "workspace_local_demo",
        targets: ["runtime", "provider", "memory"],
      }).ok,
    ).toBe(true);

    expect(
      validateCreateConnectionCheckRequest({
        workspaceId: "workspace_local_demo",
        targets: ["claude-code"],
      }).ok,
    ).toBe(true);

    expect(
      validateRuntimeConnectionCheckResult({
        runtimeDeviceId: "runtime_local_demo",
        providerHealth: {
          providerMode: "claude-code",
          status: "connected",
          binaryPathLabel: "/usr/local/bin/claude",
          checkedAt: now,
          failureReason: null,
        },
        memoryHealth: {
          enabled: true,
          status: "connected",
          url: "http://127.0.0.1:3111",
          viewerUrl: "http://127.0.0.1:3113",
          checkedAt: now,
          failureReason: null,
        },
        claudeCodeDiscovery: {
          binaryPathLabel: "claude",
          checkedAt: now,
          profileRootLabel: "/Users/example/.agenthub/claude-code",
          plugins: [{ name: "superpowers", version: "5.1.0", pathLabel: "superpowers" }],
          skills: [
            {
              name: "test-driven-development",
              description: "Use when implementing features",
              pluginName: "superpowers",
              pathLabel: "superpowers/skills/test-driven-development/SKILL.md",
            },
          ],
          mcpServers: [{ name: "github", transport: "stdio" }],
          workspaceClaudeFiles: {
            claudeDir: true,
            settingsJson: false,
            settingsLocalJson: false,
            mcpJson: true,
            claudeMd: false,
          },
        },
      }).ok,
    ).toBe(true);
  });

  it("accepts create and update agent role contracts", () => {
    expect(
      validateCreateAgentRequest({
        workspaceId: "workspace_local_demo",
        displayName: "Researcher",
        role: "worker",
        systemPrompt: "You are a careful research assistant.",
        capabilityTags: ["research", "analysis"],
        policy: { network: "allowed" },
      }).ok,
    ).toBe(true);

    expect(
      validateUpdateAgentRequest({
        displayName: "Senior Researcher",
        systemPrompt: "You are a senior research assistant.",
        capabilityTags: ["research"],
      }).ok,
    ).toBe(true);
  });

  it("accepts conversation membership contracts", () => {
    expect(validateAddConversationAgentRequest({ agentId: "agent_1" }).ok).toBe(true);
    expect(validateAddConversationAgentRequest({}).ok).toBe(false);
    expect(
      validateCreateAgentConversationRequest({
        workspaceId: "workspace_1",
        projectId: "project_1",
        agentIds: ["agent_1"],
      }).ok,
    ).toBe(true);
    expect(
      validateCreateAgentConversationRequest({
        workspaceId: "workspace_1",
        projectId: "project_1",
        agentIds: ["agent_1", "agent_2"],
      }).ok,
    ).toBe(true);
    expect(
      validateCreateAgentConversationRequest({
        workspaceId: "workspace_1",
        projectId: "project_1",
        agentIds: [],
      }).ok,
    ).toBe(false);
    expect(validateCreateAgentConversationRequest({ workspaceId: "workspace_1" }).ok).toBe(false);
    expect(
      validateDesktopProjectRegistration({
        source: "desktop-directory",
        runtimeDeviceId: "runtime_local_demo",
        displayName: "AgentHub",
        localPath: "/Users/example/agenthub",
        localPathLabel: "/Users/example/agenthub",
        gitBranch: "main",
        gitBaseCommit: null,
        dirty: false,
      }).ok,
    ).toBe(true);
  });

  it("exposes local agent, provider status, and memory status API paths", () => {
    expect(agentHubApiPaths.agents).toBe("/agents");
    expect(agentHubApiPaths.conversations).toBe("/conversations");
    expect(agentHubApiPaths.agentConversations("agent_1")).toBe("/agents/agent_1/conversations");
    expect(agentHubApiPaths.runtimeProviderStatus).toBe("/runtime/provider-status");
    expect(agentHubApiPaths.memoryStatus).toBe("/memory/status");
    expect(agentHubApiPaths.connectionChecks).toBe("/connections/checks");
    expect(agentHubApiPaths.runtimeConnectionCheckResults).toBe(
      "/runtime/connection-check-results",
    );
  });

  it("accepts a control-plane backed workbench snapshot", () => {
    const now = "2026-05-21T00:00:00.000Z";
    const result = validateWorkbenchSnapshot({
      authenticated: true,
      userId: "user_local_demo",
      activeWorkspaceId: "workspace_local_demo",
      activeConversationId: "conversation_local_demo",
      workspaces: [
        {
          id: "workspace_local_demo",
          ownerUserId: "user_local_demo",
          name: "AgentHub",
          runtimeKind: "local",
          runtimeDeviceId: "runtime_local_demo",
          localPath: null,
          repoUrl: null,
          defaultBranch: "main",
          createdAt: now,
          updatedAt: now,
        },
      ],
      runtimeDevices: [
        {
          id: "runtime_local_demo",
          ownerUserId: "user_local_demo",
          displayName: "AgentHub Desktop Runtime",
          platform: "macos",
          appVersion: "0.1.0",
          status: "online",
          capabilities: ["provider:smoke"],
          lastHeartbeatAt: now,
          createdAt: now,
          updatedAt: now,
        },
      ],
      projects: [
        {
          id: "project_local_demo",
          ownerUserId: "user_local_demo",
          workspaceId: "workspace_local_demo",
          name: "AgentHub",
          runtimeDeviceId: "runtime_local_demo",
          localPath: "/Users/example/agenthub",
          localPathLabel: "/Users/example/agenthub",
          repoUrl: null,
          gitBranch: "main",
          gitBaseCommit: null,
          dirty: false,
          isDefault: false,
          lastUsedAt: now,
          archivedAt: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
      workspaceMetadata: null,
      providerHealth: {
        providerMode: "claude-code",
        status: "missing",
        binaryPathLabel: "claude",
        checkedAt: now,
        failureReason: "Claude Code binary was not found",
      },
      memoryHealth: {
        enabled: false,
        status: "disabled",
        url: "http://127.0.0.1:3111",
        viewerUrl: "http://127.0.0.1:3113",
        checkedAt: now,
        failureReason: null,
      },
      conversations: [
        {
          id: "conversation_local_demo",
          ownerUserId: "user_local_demo",
          workspaceId: "workspace_local_demo",
          projectId: "project_local_demo",
          kind: "group",
          title: "AgentHub local demo",
          pinnedAt: null,
          notificationsMuted: false,
          archivedAt: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
      conversationParticipants: [
        {
          id: "participant_1",
          ownerUserId: "user_local_demo",
          conversationId: "conversation_local_demo",
          agentId: "agent_1",
          addedByUserId: "user_local_demo",
          archivedAt: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
      agents: [],
      runs: [],
      messages: [],
      availableActions: ["run.start"],
    });

    expect(result.ok).toBe(true);
  });
});
