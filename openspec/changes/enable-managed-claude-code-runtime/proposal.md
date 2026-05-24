## Why

AgentHub currently treats Claude Code as an optional provider and falls back to smoke mode unless explicitly configured, which makes the product default diverge from the intended local-agent experience. Claude Code also exposes useful runtime controls for permissions, settings, plugins, skills, hooks, MCP servers, and sessions, but AgentHub does not yet make those controls visible or repeatable per workspace, agent, or run.

## What Changes

- Make real Claude Code the default Desktop Runtime provider; smoke mode remains available only when explicitly requested for deterministic verification.
- Add AgentHub-managed Claude Code runtime profiles that can launch the CLI from a bound workspace with selected settings, MCP config, plugin directories, hooks policy, permission mode, effort, and session behavior.
- Expose first-class Claude Code controls in the workbench composer, agent configuration, and Connections/Settings surfaces without requiring users to hand-edit CLI flags or local settings files.
- Add runtime discovery for the local Claude Code binary, installed plugins, available skills, MCP configuration, workspace Claude files, and AgentHub-managed profile paths.
- Preserve source privacy by keeping full local profile files, plugin contents, hooks, MCP secrets, and workspace source on the Desktop Runtime unless the user explicitly edits or exports them.
- Update smoke verification so local smoke runs explicitly opt into the smoke provider instead of relying on smoke as the default.

## Capabilities

### New Capabilities

- `managed-claude-code-runtime`: Defines AgentHub-managed Claude Code runtime profiles, settings sources, plugin/skill/MCP/hook selection, session behavior, and local discovery metadata.

### Modified Capabilities

- `runtime-device-control`: Claude Code becomes the default provider, runtime commands carry managed Claude Code options, and Desktop Runtime launches Claude Code with structured output and profile-aware CLI arguments.
- `local-runnable-topology`: Local setup and smoke commands explicitly distinguish real Claude Code defaults from smoke-only verification paths.
- `conversation-workbench`: The composer exposes Claude Code run controls such as permission mode, runtime profile, MCP profile, effort, and session behavior.
- `agent-role-management`: Agent roles can define default Claude Code runtime controls, including permission mode, settings source, profile, MCP profile, hooks policy, and allowed/disallowed tools.
- `permission-gateway`: Run-level permission presets are represented as auditable policy choices and high-risk full-access runs are visibly gated.
- `connection-health-checks`: Connections can discover and refresh Claude Code runtime capabilities beyond binary health, including plugins, skills, MCP config, and managed profile status.

## Impact

- Desktop Runtime configuration and provider selection defaults.
- Claude Code provider adapter CLI arguments, structured output parsing, and profile generation.
- Control Plane runtime command payloads, snapshot metadata, and agent policy storage.
- Web/Desktop composer, Agents, Connections, and Settings UI surfaces.
- Local development docs, environment templates, and smoke scripts.
- Tests for provider defaults, explicit smoke mode, profile generation, connection discovery, and permission-mode mapping.
