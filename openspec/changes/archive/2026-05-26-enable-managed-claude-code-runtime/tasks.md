## 1. Contracts And Configuration

- [x] 1.1 Change Desktop Runtime provider config so unset `AGENTHUB_PROVIDER_MODE` defaults to `claude-code` and only explicit `smoke` selects smoke mode.
- [x] 1.2 Extend contracts and validation schemas with Claude Code run options for permission preset, settings source mode, runtime profile, MCP profile, hooks policy, allowed/disallowed tools, effort, and session behavior.
- [x] 1.3 Extend agent policy handling so Claude Code-backed agents can persist default runtime controls without breaking existing agents.
- [x] 1.4 Extend runtime command payload tests to cover agent defaults and composer overrides.

## 2. Desktop Runtime Profiles And Discovery

- [x] 2.1 Add a Desktop Runtime profile materialization module that writes AgentHub-managed settings and MCP config outside the workspace by default.
- [x] 2.2 Add profile modes for inherited, managed, and isolated settings sources, including strict MCP behavior for isolated mode.
- [x] 2.3 Add local discovery for Claude Code version, setting support, plugin directories, skill summaries, MCP summaries, hook sources, workspace Claude files, and managed profile path labels.
- [x] 2.4 Redact MCP secrets, full skill contents, hook command details, and raw local file contents from discovery payloads.
- [x] 2.5 Add unit tests for profile materialization, redaction, and discovery failure states.

## 3. Claude Code Adapter

- [x] 3.1 Update the Claude Code adapter to construct CLI args for settings, setting sources, MCP config, plugin directories, permission mode, tools, effort, and session behavior.
- [x] 3.2 Launch Claude Code from the bound workspace path by default while preserving workspace privacy boundaries.
- [x] 3.3 Switch supported runs to structured output mode and normalize partial messages, final output, errors, and terminal status into AgentHub provider events.
- [x] 3.4 Add a documented fallback or visible failure path when the local Claude Code CLI does not support required structured output or selected flags.
- [x] 3.5 Add adapter tests for CLI arg construction, structured output parsing, failed process startup, unsupported flag failure, and cancellation.

## 4. Control Plane Runtime State

- [x] 4.1 Store and expose Claude Code discovery summaries in workbench snapshots and status routes without secret values.
- [x] 4.2 Queue local Claude Code capability discovery commands through the bound online Desktop Runtime.
- [x] 4.3 Record each run's effective permission preset, runtime profile, MCP profile, effort, settings source mode, and override source for audit and timeline display.
- [x] 4.4 Add Control Plane tests for default Claude Code mode, explicit smoke mode, profile option propagation, discovery result storage, and high-risk permission audit metadata.

## 5. Web And Desktop UI

- [x] 5.1 Add concise composer controls for permission preset, runtime profile, MCP profile, effort, and session behavior when targeting Claude Code-backed agents.
- [x] 5.2 Add advanced composer controls for settings source mode, hooks policy, allowed/disallowed tools, plugin profile, and session options.
- [x] 5.3 Add high-risk confirmation and visible run state for Full access or bypass-style permission presets.
- [x] 5.4 Show each run's effective Claude Code profile and permission preset in timeline or inspector run details.
- [x] 5.5 Extend the Agents surface so users can save Claude Code runtime defaults and see warnings for high-risk permissions or enabled hooks.
- [x] 5.6 Extend Connections/Settings to show Claude Code binary status, discovery summaries, available plugins/skills/MCP profiles, workspace Claude files, and managed profile status.

## 6. Documentation And Verification

- [x] 6.1 Update local setup docs and environment examples to document real Claude Code as the default and explicit smoke mode for deterministic verification.
- [x] 6.2 Update all smoke scripts so deterministic smoke verification explicitly sets `AGENTHUB_PROVIDER_MODE=smoke`.
- [x] 6.3 Add optional real Claude Code verification that only runs when explicitly requested and reports setup failures clearly.
- [x] 6.4 Add regression coverage for source privacy and secret redaction in discovery payloads.
- [x] 6.5 Run typecheck, lint, unit tests, and smoke verification for explicit smoke mode.
