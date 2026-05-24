## Context

AgentHub already has a local execution loop: Web/Desktop creates runs, Control Plane queues runtime commands, Desktop Runtime polls commands, and the Claude Code adapter spawns a local `claude` process from the bound workspace. The current default is smoke mode unless `AGENTHUB_PROVIDER_MODE=claude-code` is set, and the adapter only passes `-p <prompt>` while treating stdout as unstructured text.

Claude Code now exposes enough CLI controls to make it a manageable runtime surface for AgentHub: permission modes, settings files, setting sources, MCP configs, strict MCP mode, plugin directories, custom agents, effort, sessions, and stream JSON output. Those controls should be selected through AgentHub at the workspace, agent, or run level while preserving the core privacy boundary: Desktop Runtime owns local files, profile files, MCP secrets, plugin contents, and source code.

## Goals / Non-Goals

**Goals:**

- Make real Claude Code the default provider for Desktop Runtime unless smoke mode is explicitly configured.
- Launch Claude Code from the bound workspace with AgentHub-selected settings, MCP configs, plugin directories, permission mode, effort, and session behavior.
- Add a managed profile model that can be inherited, AgentHub-managed, or isolated per workspace/agent/run.
- Expose safe, high-value Claude Code controls in the composer and agent configuration without requiring users to know CLI flags.
- Discover local Claude Code capabilities from Desktop Runtime and surface summary metadata in snapshots and Connections/Settings.
- Keep smoke mode deterministic and explicit for tests and local verification.

**Non-Goals:**

- Replacing Claude Code's own permission system with a complete AgentHub-native tool permission engine.
- Uploading full `SKILL.md`, plugin source, hooks, MCP secrets, or workspace source content to Control Plane.
- Implementing the Claude Agent SDK in this change.
- Building cloud-hosted Claude execution.
- Automatically writing `.claude/settings.local.json` or `.mcp.json` into user workspaces without explicit user choice.

## Decisions

### Real Claude Code is the default provider

Desktop Runtime should default to `claude-code` and only use smoke mode when `AGENTHUB_PROVIDER_MODE=smoke` is explicitly set. This matches the product intent and prevents local runs from silently using deterministic fake output.

Alternative considered: keep smoke as default for developer convenience. That is safer for CI but misleading for product use. The deterministic scripts can set smoke mode explicitly.

### Continue using the CLI, but use structured output

The adapter should continue spawning the local `claude` binary, but move from plain `claude -p` output to `--output-format stream-json` with partial message support where available. The CLI preserves Claude Code's local authentication, project context, plugin model, hooks, and MCP behavior without adopting a new SDK integration surface.

Alternative considered: migrate directly to the Claude Agent SDK. The SDK may be a better long-term fit for embedded applications, but the CLI is already available, matches the user's local setup, and is sufficient for this iteration.

### Use workspace-root cwd by default

Claude Code should normally start with `cwd` set to the bound workspace path. AgentHub-managed settings and MCP files can be passed by path, while plugin directories can be passed with repeated `--plugin-dir` arguments. This keeps Claude Code's project semantics, git behavior, relative paths, and hook environment aligned with the user's actual project.

Alternative considered: start in an AgentHub-managed profile directory and pass the workspace through `--add-dir`. That gives stronger isolation, but it changes project-root semantics and can make hooks, `CLAUDE.md`, and relative paths harder to reason about. It remains useful as an advanced isolated mode.

### Model profiles as policy, not copied skill content

AgentHub should store profile choices and local metadata summaries: permission preset, setting source mode, MCP profile, plugin references, enabled skill names, hooks policy, effort, and session behavior. Desktop Runtime materializes those choices into temporary or durable local profile files before launching Claude Code.

Alternative considered: copy selected skills into AgentHub prompts. That loses Claude Code's native skill discovery behavior, can duplicate plugin logic, and risks uploading or storing local plugin content unnecessarily.

### Three settings source modes

AgentHub should support:

- `inherit`: allow Claude Code to use user, project, and local settings.
- `managed`: pass AgentHub-managed settings/MCP/plugin flags while still running in the workspace; this is the recommended default.
- `isolated`: constrain settings and MCP to AgentHub-selected files and plugin dirs, including strict MCP config when requested.

This keeps simple personal use convenient while allowing reproducible and more controlled runs.

### Permission presets map to Claude Code permission modes

The composer and agent configuration should expose human-readable presets: `Plan only`, `Ask first`, `Auto edits`, and `Full access`. Desktop Runtime maps those to Claude Code permission modes and records the selected preset with the run. `Full access` must be visually gated and auditable.

Alternative considered: expose raw Claude Code permission modes directly. Raw modes are useful in advanced settings, but the main composer should use product language and explain risk.

### Discovery remains local-first

Desktop Runtime should perform local discovery for binary version, installed plugins, available skills, plugin directories, workspace Claude files, MCP config presence, and managed profile paths. Control Plane receives only summary metadata required for UI and routing.

## Risks / Trade-offs

- Claude Code CLI flags can change across versions -> Keep preflight version reporting, make unsupported flags a visible provider failure, and cover adapter argument construction with tests.
- Full-access runs can perform destructive local actions -> Require explicit selection, show a high-risk state in the composer/timeline, and record the policy choice with the run.
- Plugin hooks can execute local commands -> Default hooks policy should be conservative in managed/isolated profiles and show enabled hook sources in Connections/Settings.
- MCP configs can include secrets -> Store and display only names/status locally summarized by Desktop Runtime, never raw secret values in Control Plane snapshots.
- Inherited user settings may make runs less reproducible -> Offer managed and isolated profile modes and show the selected mode on each run.
- Smoke tests could accidentally call real Claude Code after the default flips -> Update all smoke scripts to set `AGENTHUB_PROVIDER_MODE=smoke` explicitly and add tests for default provider selection.

## Migration Plan

1. Add runtime config parsing that defaults to Claude Code and keeps explicit smoke mode.
2. Extend runtime command payloads and agent policy parsing with optional Claude Code run options.
3. Add a profile materialization layer in Desktop Runtime that writes AgentHub-managed settings/MCP files outside the workspace by default.
4. Upgrade the Claude Code adapter to construct profile-aware CLI args and parse stream JSON output into normalized AgentHub events.
5. Add discovery endpoints/results for Claude Code runtime capabilities.
6. Update Web/Desktop composer, Agents, Connections, and Settings surfaces.
7. Update docs and smoke scripts so deterministic verification opts into smoke.

Rollback is to set `AGENTHUB_PROVIDER_MODE=smoke` for local development or restore the old default while keeping profile fields ignored by older runtimes.

## Open Questions

- Should `managed` profiles inherit user-level Claude Code settings by default, or only project-local context plus AgentHub settings?
- Which hooks should be enabled in the first release: none by default, plugin hooks only, or selected AgentHub hooks?
- Should session continuation be per conversation, per agent, or explicitly selected per run in the first implementation?
