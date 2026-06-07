import { createHmac, generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it } from "vitest";
import { agentHubLocalDefaults } from "@agenthub/contracts";
import { verifySupabaseJwt } from "../src/auth.js";
import { createControlPlaneServer } from "../src/http.js";
import { ControlPlaneRegistry } from "../src/runtime-registry.js";

function signTestJwt(userId: string, secret = "test-secret"): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 60 }),
  ).toString("base64url");
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function signTestEs256Jwt(input: {
  readonly issuer: string;
  readonly keyId: string;
  readonly userId: string;
}): { readonly jwk: JsonWebKey; readonly token: string } {
  const { privateKey, publicKey } = generateKeyPairSync("ec", {
    namedCurve: "P-256",
  });
  const header = Buffer.from(
    JSON.stringify({ alg: "ES256", kid: input.keyId, typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      aud: "authenticated",
      exp: Math.floor(Date.now() / 1000) + 60,
      iss: input.issuer,
      sub: input.userId,
    }),
  ).toString("base64url");
  const signature = sign("sha256", Buffer.from(`${header}.${payload}`), {
    dsaEncoding: "ieee-p1363",
    key: privateKey,
  }).toString("base64url");
  return {
    jwk: publicKey.export({ format: "jwk" }),
    token: `${header}.${payload}.${signature}`,
  };
}

describe("control plane auth", () => {
  it("verifies a Supabase-style HS256 JWT", async () => {
    const auth = await verifySupabaseJwt(signTestJwt("user_1"), {
      jwtSecret: "test-secret",
    });
    expect(auth.userId).toBe("user_1");
  });

  it("verifies provider-agnostic Supabase ES256 JWTs from the project JWKS", async () => {
    const issuer = "https://project-ref.supabase.co/auth/v1";
    const signed = signTestEs256Jwt({
      issuer,
      keyId: "staging-key",
      userId: "email_user_1",
    });

    const auth = await verifySupabaseJwt(signed.token, {
      fetchJwks: async (url) => {
        expect(url).toBe(`${issuer}/.well-known/jwks.json`);
        return { keys: [{ ...signed.jwk, alg: "ES256", kid: "staging-key", use: "sig" }] };
      },
      jwtSecret: "unused-for-es256",
    });

    expect(auth.userId).toBe("email_user_1");
  });

  it("rejects invalid JWT signatures", async () => {
    await expect(
      verifySupabaseJwt(signTestJwt("user_1"), {
        jwtSecret: "wrong-secret",
      }),
    ).rejects.toThrow("Invalid JWT signature");
  });
});

describe("control plane registry", () => {
  function createRegisteredRunLoopRegistry() {
    const registry = new ControlPlaneRegistry();
    const device = registry.registerRuntimeDevice("user_1", {
      id: "runtime_1",
      displayName: "MacBook Pro",
      platform: "macos",
      appVersion: "0.1.0",
      capabilities: ["provider:smoke"],
      workspace: {
        workspaceId: "workspace_1",
        displayName: "Project",
        localPathLabel: "/tmp/project",
        gitBranch: "main",
        gitBaseCommit: "abc123",
        dirty: false,
        providerCapabilities: ["provider:smoke"],
      },
    });

    return { registry, device };
  }

  it("registers runtime devices and marks expired heartbeats offline", () => {
    let now = new Date("2026-05-21T00:00:00.000Z");
    const registry = new ControlPlaneRegistry({
      now: () => now,
      offlineTimeoutMs: 1_000,
    });

    const device = registry.registerRuntimeDevice("user_1", {
      displayName: "MacBook Pro",
      platform: "macos",
      appVersion: "0.1.0",
      capabilities: ["claude-code-local-process"],
    });

    expect(device.status).toBe("online");
    now = new Date("2026-05-21T00:00:02.000Z");
    const expired = registry.markExpiredDevicesOffline();
    expect(expired).toHaveLength(1);
    expect(expired[0]?.status).toBe("offline");
  });

  it("fails run creation when runtime is offline", () => {
    let now = new Date("2026-05-21T00:00:00.000Z");
    const registry = new ControlPlaneRegistry({
      now: () => now,
      offlineTimeoutMs: 1_000,
    });
    const device = registry.registerRuntimeDevice("user_1", {
      displayName: "MacBook Pro",
      platform: "macos",
      appVersion: "0.1.0",
      capabilities: ["claude-code-local-process"],
    });
    registry.bindWorkspace({
      workspaceId: "workspace_1",
      ownerUserId: "user_1",
      runtimeDeviceId: device.id,
      localPath: "/tmp/project",
    });

    now = new Date("2026-05-21T00:00:02.000Z");
    registry.markExpiredDevicesOffline();

    expect(() =>
      registry.createRun("user_1", {
        workspaceId: "workspace_1",
        conversationId: agentHubLocalDefaults.conversationId,
        agentId: "agent_1",
      }),
    ).toThrow("Workspace runtime is offline");
  });

  it("rejects unbound workspace runs without queueing runtime commands", () => {
    const registry = new ControlPlaneRegistry();
    const device = registry.registerRuntimeDevice("user_1", {
      id: "runtime_1",
      displayName: "MacBook Pro",
      platform: "macos",
      appVersion: "0.1.0",
      capabilities: ["provider:smoke"],
    });

    expect(() =>
      registry.createRun("user_1", {
        workspaceId: "workspace_missing",
        conversationId: agentHubLocalDefaults.conversationId,
        agentId: "agent_1",
        prompt: "hello",
      }),
    ).toThrow("Workspace is not bound to this user runtime");
    expect(registry.takeRuntimeCommands("user_1", device.id)).toHaveLength(0);
  });

  it("creates and cancels a routed run for an online workspace runtime", () => {
    const registry = new ControlPlaneRegistry();
    const device = registry.registerRuntimeDevice("user_1", {
      displayName: "MacBook Pro",
      platform: "macos",
      appVersion: "0.1.0",
      capabilities: ["claude-code-local-process"],
    });
    registry.bindWorkspace({
      workspaceId: "workspace_1",
      ownerUserId: "user_1",
      runtimeDeviceId: device.id,
      localPath: "/tmp/project",
    });

    const run = registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      agentId: agentHubLocalDefaults.implementerAgentId,
    });
    const cancelled = registry.cancelRun("user_1", run.id);

    expect(run.status).toBe("queued");
    expect(cancelled.status).toBe("cancelling");
  });

  it("includes agent Claude Code defaults in queued runtime commands", () => {
    const { registry, device } = createRegisteredRunLoopRegistry();
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Builder",
      role: "worker",
      systemPrompt: "Build carefully.",
      capabilityTags: ["code"],
      policy: {
        claudeCode: {
          permissionPreset: "plan-only",
          settingsSource: "managed",
          runtimeProfileId: "profile_engineering",
          mcpProfileId: "mcp_project",
          hooksPolicy: "disabled",
          effort: "high",
        },
      },
    });
    registry.addAgentToConversation("user_1", agentHubLocalDefaults.conversationId, agent.id);

    const run = registry.createRun(
      "user_1",
      {
        workspaceId: "workspace_1",
        conversationId: agentHubLocalDefaults.conversationId,
        agentId: agent.id,
        prompt: "hello",
      },
      "claude-code",
    );

    expect(registry.getRun("user_1", run.id).claudeCode).toMatchObject({
      permissionPreset: "plan-only",
      overrideSource: "agent-default",
      effectivePermissionPreset: "plan-only",
      effectiveSettingsSource: "managed",
    });
    expect(registry.takeRuntimeCommands("user_1", device.id).at(-1)).toMatchObject({
      type: "run.start",
      payload: {
        providerMode: "claude-code",
        claudeCode: {
          permissionPreset: "plan-only",
          settingsSource: "managed",
          runtimeProfileId: "profile_engineering",
          mcpProfileId: "mcp_project",
          hooksPolicy: "disabled",
          effort: "high",
        },
      },
    });
  });

  it("lets composer Claude Code run options override agent defaults without mutating the agent", () => {
    const { registry, device } = createRegisteredRunLoopRegistry();
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Builder",
      role: "worker",
      systemPrompt: "Build carefully.",
      capabilityTags: ["code"],
      policy: {
        claudeCode: {
          permissionPreset: "ask-first",
          settingsSource: "inherit",
          effort: "medium",
        },
      },
    });
    registry.addAgentToConversation("user_1", agentHubLocalDefaults.conversationId, agent.id);

    const run = registry.createRun(
      "user_1",
      {
        workspaceId: "workspace_1",
        conversationId: agentHubLocalDefaults.conversationId,
        agentId: agent.id,
        prompt: "hello",
        claudeCode: {
          permissionPreset: "full-access",
          settingsSource: "isolated",
          effort: "xhigh",
        },
      },
      "claude-code",
    );

    expect(registry.getRun("user_1", run.id).claudeCode).toMatchObject({
      permissionPreset: "full-access",
      overrideSource: "run-override",
      effectivePermissionPreset: "full-access",
      effectiveSettingsSource: "isolated",
    });
    expect(registry.takeRuntimeCommands("user_1", device.id).at(-1)).toMatchObject({
      type: "run.start",
      payload: {
        claudeCode: {
          permissionPreset: "full-access",
          settingsSource: "isolated",
          effort: "xhigh",
        },
      },
    });
    expect(
      registry
        .createWorkbenchSnapshot("user_1")
        .agents.find((candidate) => candidate.id === agent.id)?.policy,
    ).toMatchObject({
      claudeCode: {
        permissionPreset: "ask-first",
        settingsSource: "inherit",
        effort: "medium",
      },
    });
  });

  it("binds one hidden Claude Code session per conversation agent and resumes subsequent runs", () => {
    const { registry, device } = createRegisteredRunLoopRegistry();
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Builder",
      role: "worker",
      systemPrompt: "Build carefully.",
      capabilityTags: ["code"],
      policy: {
        claudeCode: {
          permissionPreset: "ask-first",
          settingsSource: "inherit",
          effort: "medium",
        },
      },
    });
    const { conversation } = registry.createAgentConversation("user_1", {
      workspaceId: "workspace_1",
      agentId: agent.id,
    });

    const firstRun = registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: conversation.id,
      agentId: agent.id,
      prompt: "first",
    });
    const firstCommand = registry.takeRuntimeCommands("user_1", device.id).at(-1);
    expect(firstCommand).toMatchObject({
      type: "run.start",
      payload: {
        runId: firstRun.id,
        claudeCode: {
          permissionPreset: "ask-first",
          settingsSource: "inherit",
          effort: "medium",
        },
      },
    });
    expect(
      firstCommand?.type === "run.start" ? firstCommand.payload.claudeCode?.session : null,
    ).toBeUndefined();

    registry.recordProviderRuntimeEvent("user_1", {
      type: "provider.session",
      runId: firstRun.id,
      agentId: agent.id,
      providerMode: "claude-code",
      sessionId: "session_builder_1",
    });

    const secondRun = registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: conversation.id,
      agentId: agent.id,
      prompt: "second",
      claudeCode: {
        permissionPreset: "full-access",
        settingsSource: "isolated",
        effort: "high",
      },
    });
    const secondCommand = registry.takeRuntimeCommands("user_1", device.id).at(-1);
    expect(secondRun.claudeCode).toMatchObject({
      permissionPreset: "ask-first",
      settingsSource: "inherit",
      effort: "high",
    });
    expect(secondCommand).toMatchObject({
      type: "run.start",
      payload: {
        claudeCode: {
          permissionPreset: "ask-first",
          settingsSource: "inherit",
          effort: "high",
          session: { behavior: "continue", sessionId: "session_builder_1" },
        },
      },
    });
  });

  it("keeps Claude Code sessions isolated by conversation and agent", () => {
    const { registry, device } = createRegisteredRunLoopRegistry();
    const firstAgent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Builder",
      role: "worker",
      systemPrompt: "Build carefully.",
      policy: { claudeCode: { settingsSource: "inherit" } },
    });
    const secondAgent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Reviewer",
      role: "worker",
      systemPrompt: "Review carefully.",
      policy: { claudeCode: { settingsSource: "inherit" } },
    });
    const firstConversation = registry.createAgentConversation("user_1", {
      workspaceId: "workspace_1",
      agentId: firstAgent.id,
    }).conversation;
    const secondConversation = registry.createAgentConversation("user_1", {
      workspaceId: "workspace_1",
      agentId: firstAgent.id,
    }).conversation;
    registry.addAgentToConversation("user_1", firstConversation.id, secondAgent.id);

    const firstRun = registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: firstConversation.id,
      agentId: firstAgent.id,
      prompt: "first",
    });
    registry.recordProviderRuntimeEvent("user_1", {
      type: "provider.session",
      runId: firstRun.id,
      agentId: firstAgent.id,
      providerMode: "claude-code",
      sessionId: "session_first_agent",
    });
    registry.takeRuntimeCommands("user_1", device.id);

    registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: firstConversation.id,
      agentId: secondAgent.id,
      prompt: "review",
    });
    registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: secondConversation.id,
      agentId: firstAgent.id,
      prompt: "other conversation",
    });
    const commands = registry.takeRuntimeCommands("user_1", device.id);
    expect(commands).toHaveLength(2);
    expect(
      commands.map((command) =>
        command.type === "run.start" ? command.payload.claudeCode?.session : null,
      ),
    ).toEqual([undefined, undefined]);
  });

  it("ignores provider session metadata for unknown runs", () => {
    const { registry } = createRegisteredRunLoopRegistry();

    expect(() => {
      registry.recordProviderRuntimeEvent("user_1", {
        type: "provider.session",
        runId: "missing_run",
        agentId: "agent_1",
        providerMode: "claude-code",
        sessionId: "session_1",
      });
    }).not.toThrow();
  });

  it("records provider output into the workbench snapshot", () => {
    const { registry, device } = createRegisteredRunLoopRegistry();
    const run = registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      agentId: agentHubLocalDefaults.implementerAgentId,
      prompt: "hello",
    });
    expect(registry.takeRuntimeCommands("user_1", device.id)).toHaveLength(1);

    registry.recordProviderRuntimeEvent("user_1", {
      type: "message.delta",
      runId: run.id,
      agentId: agentHubLocalDefaults.implementerAgentId,
      delta: "done",
    });
    registry.recordProviderRuntimeEvent("user_1", {
      type: "message.delta",
      runId: run.id,
      agentId: agentHubLocalDefaults.implementerAgentId,
      delta: " now",
    });

    const snapshot = registry.createWorkbenchSnapshot("user_1");
    expect(snapshot.messages[0]).toMatchObject({
      authorKind: "user",
      authorId: "user_1",
      parts: [{ type: "text", text: "hello" }],
    });
    expect(snapshot.messages[1]).toMatchObject({
      authorKind: "agent",
      authorId: agentHubLocalDefaults.implementerAgentId,
      parts: [{ type: "markdown", text: "done now", runId: run.id }],
    });
  });

  it("rejects runs for conversations outside the local workspace", () => {
    const { registry } = createRegisteredRunLoopRegistry();

    expect(() =>
      registry.createRun("user_1", {
        workspaceId: "workspace_1",
        conversationId: "conversation_other",
        agentId: agentHubLocalDefaults.implementerAgentId,
        prompt: "hello",
      }),
    ).toThrow("Conversation is not available");
  });

  it("normalizes provider terminal statuses into AgentHub terminal events", () => {
    const { registry } = createRegisteredRunLoopRegistry();
    const run = registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      agentId: agentHubLocalDefaults.implementerAgentId,
      prompt: "hello",
    });

    registry.recordProviderRuntimeEvent("user_1", {
      type: "run.status",
      runId: run.id,
      agentId: agentHubLocalDefaults.implementerAgentId,
      status: "completed",
      message: "done",
    });

    expect(registry.getRun("user_1", run.id)).toMatchObject({
      completedAt: expect.any(String),
      failureReason: null,
      status: "completed",
    });
    expect(registry.events.snapshot().at(-1)).toMatchObject({
      type: "agent.run.completed",
      runId: run.id,
      payload: {
        status: "completed",
      },
    });
  });

  it("records cancellation terminal status after runtime cancellation", () => {
    const { registry, device } = createRegisteredRunLoopRegistry();
    const run = registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      agentId: agentHubLocalDefaults.implementerAgentId,
      prompt: "hello",
    });
    registry.cancelRun("user_1", run.id);

    expect(registry.takeRuntimeCommands("user_1", device.id).at(-1)).toMatchObject({
      type: "run.cancel",
      payload: { runId: run.id },
    });

    registry.recordProviderRuntimeEvent("user_1", {
      type: "run.status",
      runId: run.id,
      agentId: agentHubLocalDefaults.implementerAgentId,
      status: "cancelled",
      message: "cancelled",
    });

    expect(registry.getRun("user_1", run.id)).toMatchObject({
      status: "cancelled",
      failureReason: "cancelled",
    });
  });

  it("creates user agent roles and includes them in snapshots", () => {
    const { registry } = createRegisteredRunLoopRegistry();

    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Researcher",
      role: "worker",
      systemPrompt: "You are a research-focused coding agent.",
      capabilityTags: ["research"],
      policy: { network: "ask" },
    });

    const snapshot = registry.createWorkbenchSnapshot("user_1");
    expect(snapshot.agents.map((candidate) => candidate.displayName)).toContain("Researcher");
    expect(snapshot.agents.find((candidate) => candidate.id === agent.id)).toMatchObject({
      systemPrompt: "You are a research-focused coding agent.",
      capabilityTags: ["research"],
    });
    expect(
      snapshot.conversationParticipants?.map((participant) => participant.agentId),
    ).not.toContain(agent.id);
  });

  it("does not route Codex-backed agents through Claude Code before Codex runtime exists", () => {
    const { registry } = createRegisteredRunLoopRegistry();
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Codex worker",
      role: "worker",
      systemPrompt: "Use Codex",
      capabilityTags: ["code"],
      policy: { runtime: { provider: "codex" } },
    });

    expect(() =>
      registry.createRun("user_1", {
        workspaceId: "workspace_1",
        conversationId: agentHubLocalDefaults.conversationId,
        agentId: agent.id,
        prompt: "hello",
      }),
    ).toThrow("Codex runtime is not configured yet");
  });

  it("persists conversation agent membership in snapshots", () => {
    const { registry } = createRegisteredRunLoopRegistry();
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Researcher",
      role: "worker",
      systemPrompt: "You research context.",
      capabilityTags: ["research"],
      policy: {},
    });

    const initial = registry.createWorkbenchSnapshot("user_1");
    expect(initial.conversationParticipants?.map((participant) => participant.agentId)).toEqual([
      agentHubLocalDefaults.orchestratorAgentId,
      agentHubLocalDefaults.implementerAgentId,
    ]);

    registry.addAgentToConversation("user_1", agentHubLocalDefaults.conversationId, agent.id);
    const added = registry.createWorkbenchSnapshot("user_1");
    expect(added.conversationParticipants?.map((participant) => participant.agentId)).toContain(
      agent.id,
    );

    registry.removeAgentFromConversation("user_1", agentHubLocalDefaults.conversationId, agent.id);
    const removed = registry.createWorkbenchSnapshot("user_1");
    expect(
      removed.conversationParticipants?.map((participant) => participant.agentId),
    ).not.toContain(agent.id);
    expect(registry.events.snapshot().at(-1)).toMatchObject({
      type: "conversation.membership_changed",
      payload: { action: "removed", agentId: agent.id },
    });
  });

  it("updates conversation-scoped agent settings without mutating global agent configuration or history", () => {
    const { registry } = createRegisteredRunLoopRegistry();
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Reviewer",
      role: "worker",
      systemPrompt: "Review carefully.",
      capabilityTags: ["review"],
      policy: {
        runtime: { provider: "claude-code" },
        claudeCode: { permissionPreset: "ask-first", effort: "medium" },
      },
    });
    const firstParticipant = registry.addAgentToConversation(
      "user_1",
      agentHubLocalDefaults.conversationId,
      agent.id,
    );
    const second = registry.createAgentConversation("user_1", {
      workspaceId: "workspace_1",
      agentId: agent.id,
    });
    const run = registry.createRun(
      "user_1",
      {
        workspaceId: "workspace_1",
        conversationId: agentHubLocalDefaults.conversationId,
        agentId: agent.id,
        prompt: "review this",
      },
      "claude-code",
    );

    const updated = registry.updateConversationAgentSettings(
      "user_1",
      agentHubLocalDefaults.conversationId,
      agent.id,
      {
        displayNameOverride: "Security reviewer",
        responsibilityOverride: "Focus on auth and data access.",
        notes: "Only for this group chat.",
        enabled: false,
        participationMode: "manual",
        priority: "high",
        quietMode: true,
        contextScope: "conversation-artifacts",
        includeHistorySummary: false,
        scopedInstructions: "Do not comment on formatting.",
        requireRunConfirmation: true,
        allowAutoDispatch: false,
      },
    );
    const snapshot = registry.createWorkbenchSnapshot("user_1");
    const globalAgent = snapshot.agents.find((candidate) => candidate.id === agent.id);
    const firstSnapshotParticipant = snapshot.conversationParticipants?.find(
      (participant) => participant.id === firstParticipant.id,
    );
    const secondSnapshotParticipant = snapshot.conversationParticipants?.find(
      (participant) => participant.id === second.participant.id,
    );

    expect(updated.conversationAgentSettings).toMatchObject({
      displayNameOverride: "Security reviewer",
      enabled: false,
      participationMode: "manual",
      priority: "high",
      contextScope: "conversation-artifacts",
      allowAutoDispatch: false,
    });
    expect(firstSnapshotParticipant?.conversationAgentSettings).toMatchObject({
      displayNameOverride: "Security reviewer",
      scopedInstructions: "Do not comment on formatting.",
    });
    expect(secondSnapshotParticipant?.conversationAgentSettings).toBeUndefined();
    expect(globalAgent).toMatchObject({
      displayName: "Reviewer",
      systemPrompt: "Review carefully.",
      policy: agent.policy,
    });
    expect(snapshot.messages.some((message) => message.parts[0]?.text === "review this")).toBe(
      true,
    );
    expect(snapshot.runs.find((candidate) => candidate.id === run.id)?.agentId).toBe(agent.id);
  });

  it("rejects conversation-scoped agent setting updates for non-participants", () => {
    const { registry } = createRegisteredRunLoopRegistry();
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Observer",
      role: "worker",
      systemPrompt: "Observe.",
      capabilityTags: [],
      policy: {},
    });

    expect(() =>
      registry.updateConversationAgentSettings(
        "user_1",
        agentHubLocalDefaults.conversationId,
        agent.id,
        { displayNameOverride: "Not in chat" },
      ),
    ).toThrow("Conversation participant not found");
  });

  it("applies conversation-scoped participant settings during run preparation", () => {
    const { registry, device } = createRegisteredRunLoopRegistry();
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Reviewer",
      role: "worker",
      systemPrompt: "Review carefully.",
      capabilityTags: ["review"],
      policy: {},
    });
    registry.addAgentToConversation("user_1", agentHubLocalDefaults.conversationId, agent.id);
    registry.updateConversationAgentSettings(
      "user_1",
      agentHubLocalDefaults.conversationId,
      agent.id,
      {
        responsibilityOverride: "Focus on security.",
        scopedInstructions: "Only report high-risk issues.",
      },
    );

    registry.createRun(
      "user_1",
      {
        workspaceId: "workspace_1",
        conversationId: agentHubLocalDefaults.conversationId,
        agentId: agent.id,
        prompt: "review this",
      },
      "claude-code",
    );
    const command = registry.takeRuntimeCommands("user_1", device.id).at(-1);

    expect(command).toMatchObject({ type: "run.start" });
    expect(command?.type === "run.start" ? command.payload.systemPrompt : "").toContain(
      "Review carefully.",
    );
    expect(command?.type === "run.start" ? command.payload.systemPrompt : "").toContain(
      "Focus on security.",
    );
    expect(command?.type === "run.start" ? command.payload.systemPrompt : "").toContain(
      "Only report high-risk issues.",
    );
  });

  it("prevents runs for disabled conversation participants", () => {
    const { registry, device } = createRegisteredRunLoopRegistry();
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Reviewer",
      role: "worker",
      systemPrompt: "Review carefully.",
      capabilityTags: ["review"],
      policy: {},
    });
    registry.addAgentToConversation("user_1", agentHubLocalDefaults.conversationId, agent.id);
    registry.updateConversationAgentSettings(
      "user_1",
      agentHubLocalDefaults.conversationId,
      agent.id,
      { enabled: false },
    );

    expect(() =>
      registry.createRun(
        "user_1",
        {
          workspaceId: "workspace_1",
          conversationId: agentHubLocalDefaults.conversationId,
          agentId: agent.id,
          prompt: "review this",
        },
        "claude-code",
      ),
    ).toThrow("Agent is disabled in this conversation");
    expect(registry.takeRuntimeCommands("user_1", device.id)).toHaveLength(0);
  });

  it("creates separate single-agent conversations for the same agent and routes runs there", () => {
    const { registry, device } = createRegisteredRunLoopRegistry();
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Researcher",
      role: "worker",
      systemPrompt: "Research carefully.",
      capabilityTags: ["research"],
      policy: {},
    });

    const first = registry.createAgentConversation("user_1", {
      workspaceId: "workspace_1",
      agentId: agent.id,
    });
    const second = registry.createAgentConversation("user_1", {
      workspaceId: "workspace_1",
      agentId: agent.id,
    });

    expect(first.conversation).toMatchObject({
      kind: "single-agent",
      workspaceId: "workspace_1",
      title: "Researcher",
    });
    expect(second.conversation.id).not.toBe(first.conversation.id);
    expect(first.participant.agentId).toBe(agent.id);
    expect(second.participant.agentId).toBe(agent.id);

    const snapshot = registry.createWorkbenchSnapshot("user_1");
    expect(snapshot.activeConversationId).toBe(second.conversation.id);
    expect(
      snapshot.conversations.filter((conversation) => conversation.kind === "single-agent"),
    ).toHaveLength(2);
    expect(
      snapshot.conversationParticipants?.filter((participant) => participant.agentId === agent.id),
    ).toHaveLength(2);

    registry.setActiveConversation("user_1", first.conversation.id);
    expect(registry.createWorkbenchSnapshot("user_1").activeConversationId).toBe(
      first.conversation.id,
    );

    const run = registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: second.conversation.id,
      agentId: agent.id,
      prompt: "new topic",
    });

    expect(run.conversationId).toBe(second.conversation.id);
    expect(registry.takeRuntimeCommands("user_1", device.id).at(-1)).toMatchObject({
      type: "run.start",
      payload: {
        conversationId: second.conversation.id,
        agentId: agent.id,
        prompt: "new topic",
      },
    });
  });

  it("creates project-bound conversations and resolves run commands from the selected project", () => {
    const { registry, device } = createRegisteredRunLoopRegistry();
    const snapshot = registry.createWorkbenchSnapshot("user_1");
    const project = snapshot.projects[0]!;
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Project Worker",
      role: "worker",
      systemPrompt: "Use the selected project.",
    });

    const created = registry.createAgentConversation("user_1", {
      workspaceId: "workspace_1",
      projectId: project.id,
      agentIds: [agent.id],
    });
    const run = registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: created.conversation.id,
      agentId: agent.id,
      prompt: "work here",
    });

    expect(created.conversation.projectId).toBe(project.id);
    expect(run.projectId).toBe(project.id);
    expect(registry.takeRuntimeCommands("user_1", device.id).at(-1)).toMatchObject({
      payload: {
        projectId: project.id,
        workspacePath: project.localPathLabel,
      },
    });
  });

  it("registers Desktop-only project metadata during conversation creation", () => {
    const { registry } = createRegisteredRunLoopRegistry();
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Desktop Worker",
      role: "worker",
      systemPrompt: "Use the desktop project.",
    });

    const created = registry.createAgentConversation("user_1", {
      workspaceId: "workspace_1",
      projectId: "project_desktop",
      agentIds: [agent.id],
      desktopProjectRegistration: {
        source: "desktop-directory",
        runtimeDeviceId: "runtime_1",
        displayName: "Desktop Project",
        localPath: "/tmp/desktop-project",
        localPathLabel: "/tmp/desktop-project",
        gitBranch: "feature/project-binding",
        gitBaseCommit: null,
        dirty: false,
      },
    });
    const snapshot = registry.createWorkbenchSnapshot("user_1");

    expect(created.conversation.projectId).toBe("project_desktop");
    expect(snapshot.projects.find((project) => project.id === "project_desktop")).toMatchObject({
      name: "Desktop Project",
      localPathLabel: "/tmp/desktop-project",
      isDefault: false,
    });
  });

  it("rejects project-bound conversation creation for unauthorized projects", () => {
    const { registry } = createRegisteredRunLoopRegistry();
    const project = registry.createWorkbenchSnapshot("user_1").projects[0]!;

    expect(() =>
      registry.createAgentConversation("user_2", {
        workspaceId: "workspace_1",
        projectId: project.id,
        agentIds: [agentHubLocalDefaults.implementerAgentId],
      }),
    ).toThrow("Project not found");
  });

  it("updates and archives user agent roles", () => {
    const { registry } = createRegisteredRunLoopRegistry();
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Researcher",
      role: "worker",
      systemPrompt: "Original prompt",
      capabilityTags: [],
      policy: {},
    });

    registry.updateAgent("user_1", agent.id, {
      displayName: "Senior Researcher",
      systemPrompt: "Updated prompt",
    });
    expect(
      registry
        .createWorkbenchSnapshot("user_1")
        .agents.find((candidate) => candidate.id === agent.id),
    ).toMatchObject({
      displayName: "Senior Researcher",
      systemPrompt: "Updated prompt",
    });

    registry.archiveAgent("user_1", agent.id);
    expect(
      registry
        .createWorkbenchSnapshot("user_1")
        .agents.some((candidate) => candidate.id === agent.id),
    ).toBe(false);
    expect(() =>
      registry.createRun("user_1", {
        workspaceId: "workspace_1",
        conversationId: agentHubLocalDefaults.conversationId,
        agentId: agent.id,
        prompt: "hello",
      }),
    ).toThrow("Agent not found");
  });

  it("updates, pins, configures notifications, and archives conversations", () => {
    const { registry } = createRegisteredRunLoopRegistry();
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Researcher",
      role: "worker",
      systemPrompt: "Research carefully.",
      capabilityTags: ["research"],
      policy: {},
    });
    const { conversation } = registry.createAgentConversation("user_1", {
      workspaceId: "workspace_1",
      agentId: agent.id,
    });

    const updated = registry.updateConversation("user_1", conversation.id, {
      notificationsMuted: true,
      pinned: true,
      title: "Pinned research",
    });
    expect(updated).toMatchObject({
      notificationsMuted: true,
      title: "Pinned research",
    });
    expect(updated.pinnedAt).toBeTruthy();
    expect(registry.events.snapshot().at(-1)).toMatchObject({
      type: "conversation.updated",
      payload: { id: conversation.id, notificationsMuted: true, title: "Pinned research" },
    });
    expect(registry.createWorkbenchSnapshot("user_1").conversations[0]?.id).toBe(conversation.id);

    registry.archiveConversation("user_1", conversation.id);
    const snapshot = registry.createWorkbenchSnapshot("user_1");
    expect(snapshot.conversations.some((candidate) => candidate.id === conversation.id)).toBe(
      false,
    );
    expect(snapshot.activeConversationId).toBe(agentHubLocalDefaults.conversationId);
  });

  it("uses selected agent prompts and memory namespace in run commands", () => {
    const { registry, device } = createRegisteredRunLoopRegistry();
    const agent = registry.createAgent("user_1", {
      workspaceId: "workspace_1",
      displayName: "Researcher",
      role: "worker",
      systemPrompt: "You remember research decisions.",
      capabilityTags: [],
      policy: {},
    });
    registry.addAgentToConversation("user_1", agentHubLocalDefaults.conversationId, agent.id);

    registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      agentId: agent.id,
      prompt: "hello",
    });

    expect(registry.takeRuntimeCommands("user_1", device.id).at(-1)).toMatchObject({
      type: "run.start",
      payload: {
        agentId: agent.id,
        systemPrompt: "You remember research decisions.",
        memory: {
          enabled: true,
          namespace: `agenthub:user_1:workspace_1:${agent.id}`,
        },
      },
    });
  });

  it("stores provider and memory health from runtime registration", () => {
    const registry = new ControlPlaneRegistry();
    const checkedAt = "2026-05-22T00:00:00.000Z";
    registry.registerRuntimeDevice("user_1", {
      id: "runtime_1",
      displayName: "MacBook Pro",
      platform: "macos",
      appVersion: "0.1.0",
      capabilities: ["provider:claude-code"],
      providerHealth: {
        providerMode: "claude-code",
        status: "connected",
        binaryPathLabel: "/usr/local/bin/claude",
        checkedAt,
        failureReason: null,
      },
      memoryHealth: {
        enabled: true,
        status: "connected",
        url: "http://127.0.0.1:3111",
        viewerUrl: "http://127.0.0.1:3113",
        checkedAt,
        failureReason: null,
      },
    });

    expect(registry.createWorkbenchSnapshot("user_1")).toMatchObject({
      providerHealth: { status: "connected" },
      memoryHealth: { status: "connected" },
    });
    expect(registry.latestProviderHealth("user_1")).toMatchObject({ status: "connected" });
    expect(registry.latestMemoryHealth("user_1")).toMatchObject({ status: "connected" });
  });

  it("queues local connection checks and stores returned health results", () => {
    const registry = new ControlPlaneRegistry();
    const device = registry.registerRuntimeDevice("user_1", {
      id: "runtime_1",
      displayName: "MacBook Pro",
      platform: "macos",
      appVersion: "0.1.0",
      capabilities: ["provider:smoke"],
      workspace: {
        workspaceId: "workspace_1",
        displayName: "Project",
        localPathLabel: "/tmp/project",
        gitBranch: "main",
        gitBaseCommit: "abc123",
        dirty: false,
        providerCapabilities: ["provider:smoke"],
      },
    });

    const request = registry.requestConnectionChecks("user_1", {
      workspaceId: "workspace_1",
      targets: ["runtime", "provider", "memory"],
    });

    expect(request).toMatchObject({
      acceptedTargets: ["runtime", "provider", "memory"],
      queuedTargets: ["provider", "memory"],
      runtimeOnline: true,
    });
    expect(registry.takeRuntimeCommands("user_1", device.id)).toMatchObject([
      {
        type: "connection.check",
        payload: {
          workspaceId: "workspace_1",
          targets: ["provider", "memory"],
        },
      },
    ]);

    registry.recordRuntimeConnectionCheckResult("user_1", {
      runtimeDeviceId: device.id,
      providerHealth: {
        providerMode: "smoke",
        status: "connected",
        binaryPathLabel: "smoke",
        checkedAt: "2026-05-24T00:00:00.000Z",
        failureReason: null,
      },
      memoryHealth: {
        enabled: true,
        status: "unavailable",
        url: "http://127.0.0.1:3111",
        viewerUrl: "http://127.0.0.1:3113",
        checkedAt: "2026-05-24T00:00:00.000Z",
        failureReason: "agentmemory health returned HTTP 500",
      },
    });

    expect(registry.createWorkbenchSnapshot("user_1")).toMatchObject({
      providerHealth: { status: "connected", checkedAt: "2026-05-24T00:00:00.000Z" },
      memoryHealth: {
        status: "unavailable",
        failureReason: "agentmemory health returned HTTP 500",
      },
    });
  });

  it("queues Claude Code discovery checks and stores redacted discovery summaries", () => {
    const { registry, device } = createRegisteredRunLoopRegistry();
    const result = registry.requestConnectionChecks("user_1", {
      workspaceId: "workspace_1",
      targets: ["claude-code"],
    });

    expect(result.queuedTargets).toEqual(["claude-code"]);
    expect(registry.takeRuntimeCommands("user_1", device.id)).toMatchObject([
      {
        type: "connection.check",
        payload: { targets: ["claude-code"] },
      },
    ]);

    registry.recordRuntimeConnectionCheckResult("user_1", {
      runtimeDeviceId: device.id,
      claudeCodeDiscovery: {
        binaryPathLabel: "claude",
        checkedAt: "2026-05-24T00:00:00.000Z",
        profileRootLabel: "/Users/example/.agenthub/claude-code",
        plugins: [{ name: "superpowers", version: "5.1.0", pathLabel: "superpowers" }],
        skills: [
          {
            name: "using-superpowers",
            description: "Use when starting a conversation",
            pluginName: "superpowers",
            pathLabel: "superpowers/skills/using-superpowers/SKILL.md",
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
    });

    expect(registry.createWorkbenchSnapshot("user_1").claudeCodeDiscovery).toMatchObject({
      checkedAt: "2026-05-24T00:00:00.000Z",
      plugins: [{ name: "superpowers" }],
      skills: [{ name: "using-superpowers" }],
      mcpServers: [{ name: "github" }],
    });
  });

  it("rejects local connection checks when the bound runtime is offline", () => {
    const registry = new ControlPlaneRegistry();
    const device = registry.registerRuntimeDevice("user_1", {
      id: "runtime_1",
      displayName: "MacBook Pro",
      platform: "macos",
      appVersion: "0.1.0",
      capabilities: ["provider:smoke"],
      workspace: {
        workspaceId: "workspace_1",
        displayName: "Project",
        localPathLabel: "/tmp/project",
        gitBranch: "main",
        gitBaseCommit: "abc123",
        dirty: false,
        providerCapabilities: ["provider:smoke"],
      },
    });
    registry.markRuntimeOffline("user_1", device.id);

    expect(() =>
      registry.requestConnectionChecks("user_1", {
        workspaceId: "workspace_1",
        targets: ["provider"],
      }),
    ).toThrow("Desktop Runtime must be online");
    expect(registry.takeRuntimeCommands("user_1", device.id)).toHaveLength(0);
  });
});

describe("control plane HTTP local mode", () => {
  it("rejects local-demo tokens in Supabase auth mode and accepts Supabase JWTs", async () => {
    const server = createControlPlaneServer({
      authMode: "supabase",
      jwtSecret: "test-secret",
      localAuthToken: "local-token",
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected TCP server address");
    }
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      const localDemoResponse = await fetch(`${baseUrl}/workbench/snapshot`, {
        headers: { authorization: "Bearer local-token" },
      });
      expect(localDemoResponse.status).toBe(401);

      const supabaseResponse = await fetch(`${baseUrl}/workbench/snapshot`, {
        headers: { authorization: `Bearer ${signTestJwt("github_user_1")}` },
      });
      expect(supabaseResponse.status).toBe(200);
      await expect(supabaseResponse.json()).resolves.toMatchObject({
        activeWorkspaceId: expect.any(String),
      });
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("serves health, registration, snapshot, commands, and runtime events", async () => {
    const registry = new ControlPlaneRegistry();
    const server = createControlPlaneServer({
      authMode: "local-demo",
      jwtSecret: "dev",
      localAuthToken: "local-token",
      localUserId: "user_local_demo",
      registry,
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected TCP server address");
    }
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const headers = {
      authorization: "Bearer local-token",
      "content-type": "application/json",
    };

    try {
      const health = await fetch(`${baseUrl}/health`);
      expect(health.ok).toBe(true);
      expect(await health.json()).toMatchObject({ service: "@agenthub/control-plane" });

      const registration = await fetch(`${baseUrl}/runtime/register`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          deviceId: "runtime_local_demo",
          displayName: "AgentHub Desktop Runtime",
          platform: "macos",
          appVersion: "0.1.0",
          capabilities: ["provider:smoke"],
          workspace: {
            workspaceId: "workspace_local_demo",
            displayName: "AgentHub",
            localPathLabel: "/tmp/agenthub",
            gitBranch: "main",
            gitBaseCommit: "abc123",
            dirty: false,
            providerCapabilities: ["provider:smoke"],
          },
        }),
      });
      expect(registration.ok).toBe(true);

      const snapshot = await fetch(`${baseUrl}/workbench/snapshot`, { headers });
      const snapshotBody = await snapshot.json();
      expect(snapshotBody.runtimeDevices[0].status).toBe("online");

      const createAgentResponse = await fetch(`${baseUrl}/agents`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          workspaceId: snapshotBody.activeWorkspaceId,
          displayName: "Researcher",
          role: "worker",
          systemPrompt: "You are a research role.",
          capabilityTags: ["research"],
          policy: {},
        }),
      });
      expect(createAgentResponse.status).toBe(201);
      const createdAgent = await createAgentResponse.json();
      expect(createdAgent.agent.displayName).toBe("Researcher");

      const addMembershipResponse = await fetch(
        `${baseUrl}/conversations/${snapshotBody.activeConversationId}/agents`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ agentId: createdAgent.agent.id }),
        },
      );
      expect(addMembershipResponse.status).toBe(200);

      const membershipSnapshot = await fetch(`${baseUrl}/workbench/snapshot`, { headers });
      const membershipSnapshotBody = await membershipSnapshot.json();
      expect(
        membershipSnapshotBody.conversationParticipants.map(
          (participant: { agentId: string }) => participant.agentId,
        ),
      ).toContain(createdAgent.agent.id);

      const updateMembershipSettingsResponse = await fetch(
        `${baseUrl}/conversations/${snapshotBody.activeConversationId}/agents/${createdAgent.agent.id}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            displayNameOverride: "Chat researcher",
            participationMode: "orchestrated",
            enabled: true,
          }),
        },
      );
      expect(updateMembershipSettingsResponse.status).toBe(200);
      const updatedMembership = await updateMembershipSettingsResponse.json();
      expect(updatedMembership.participant.conversationAgentSettings).toMatchObject({
        displayNameOverride: "Chat researcher",
        participationMode: "orchestrated",
      });

      const removeMembershipResponse = await fetch(
        `${baseUrl}/conversations/${snapshotBody.activeConversationId}/agents/${createdAgent.agent.id}`,
        {
          method: "DELETE",
          headers,
        },
      );
      expect(removeMembershipResponse.status).toBe(200);

      const createConversationResponse = await fetch(
        `${baseUrl}/agents/${createdAgent.agent.id}/conversations`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            workspaceId: snapshotBody.activeWorkspaceId,
            agentId: createdAgent.agent.id,
          }),
        },
      );
      expect(createConversationResponse.status).toBe(201);
      const createdConversationBody = await createConversationResponse.json();
      expect(createdConversationBody.conversation).toMatchObject({
        kind: "single-agent",
        title: "Researcher",
      });
      expect(createdConversationBody.participant.agentId).toBe(createdAgent.agent.id);

      const activeConversationResponse = await fetch(
        `${baseUrl}/conversations/${snapshotBody.activeConversationId}/active`,
        {
          method: "POST",
          headers,
        },
      );
      expect(activeConversationResponse.status).toBe(200);
      const activeConversationSnapshot = await fetch(`${baseUrl}/workbench/snapshot`, { headers });
      expect((await activeConversationSnapshot.json()).activeConversationId).toBe(
        snapshotBody.activeConversationId,
      );

      const agentsResponse = await fetch(`${baseUrl}/agents`, { headers });
      expect(
        (await agentsResponse.json()).agents.map(
          (agent: { displayName: string }) => agent.displayName,
        ),
      ).toContain("Researcher");

      const updateAgentResponse = await fetch(`${baseUrl}/agents/${createdAgent.agent.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ systemPrompt: "Updated research role." }),
      });
      expect(updateAgentResponse.status).toBe(200);

      const preflight = await fetch(`${baseUrl}/agents/${createdAgent.agent.id}`, {
        method: "OPTIONS",
        headers: {
          "access-control-request-headers": "authorization, content-type",
          "access-control-request-method": "PATCH",
          origin: "http://127.0.0.1:5173",
        },
      });
      expect(preflight.headers.get("access-control-allow-methods")).toContain("PATCH");

      const providerStatus = await fetch(`${baseUrl}/runtime/provider-status`, { headers });
      expect(providerStatus.status).toBe(200);

      const memoryStatus = await fetch(`${baseUrl}/memory/status`, { headers });
      expect(memoryStatus.status).toBe(200);

      const checkResponse = await fetch(`${baseUrl}/connections/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          workspaceId: snapshotBody.activeWorkspaceId,
          targets: ["provider", "memory"],
        }),
      });
      expect(checkResponse.status).toBe(202);

      const runResponse = await fetch(`${baseUrl}/runs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          workspaceId: snapshotBody.activeWorkspaceId,
          conversationId: snapshotBody.activeConversationId,
          agentId: snapshotBody.agents[1].id,
          prompt: "smoke",
          claudeCode: {
            permissionPreset: "auto-edits",
            settingsSource: "isolated",
            effort: "high",
          },
        }),
      });
      const runBody = await runResponse.json();
      expect(runBody.run.status).toBe("queued");
      expect(runBody.run.claudeCode).toMatchObject({
        permissionPreset: "auto-edits",
        overrideSource: "run-override",
        effectivePermissionPreset: "auto-edits",
        effectiveSettingsSource: "isolated",
      });

      const commands = await fetch(`${baseUrl}/runtime/commands?deviceId=runtime_local_demo`, {
        headers,
      });
      const commandBody = await commands.json();
      expect(commandBody.commands.map((command: { type: string }) => command.type)).toContain(
        "connection.check",
      );
      expect(commandBody.commands.map((command: { type: string }) => command.type)).toContain(
        "run.start",
      );
      expect(
        commandBody.commands.find((command: { type: string }) => command.type === "run.start"),
      ).toMatchObject({
        payload: {
          claudeCode: {
            permissionPreset: "auto-edits",
            settingsSource: "isolated",
            effort: "high",
          },
        },
      });

      const eventResponse = await fetch(`${baseUrl}/runtime/events`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: "run.status",
          runId: runBody.run.id,
          agentId: snapshotBody.agents[1].id,
          status: "completed",
        }),
      });
      expect(eventResponse.status).toBe(202);

      const checkResultResponse = await fetch(`${baseUrl}/runtime/connection-check-results`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          runtimeDeviceId: "runtime_local_demo",
          providerHealth: {
            providerMode: "smoke",
            status: "connected",
            binaryPathLabel: "smoke",
            checkedAt: "2026-05-24T00:00:00.000Z",
            failureReason: null,
          },
        }),
      });
      expect(checkResultResponse.status).toBe(202);
      const providerStatusAfterCheck = await fetch(`${baseUrl}/runtime/provider-status`, {
        headers,
      });
      expect((await providerStatusAfterCheck.json()).providerHealth).toMatchObject({
        status: "connected",
        checkedAt: "2026-05-24T00:00:00.000Z",
      });
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
