## Why

AgentHub needs to evolve from an incomplete course brief into an implementable multi-agent product plan. The target product is a personal developer control plane where Desktop, Web, and iOS clients share one account-backed experience while local execution stays on the user's own machine through Claude Code.

## What Changes

- Introduce an account-first AgentHub platform backed by Supabase for identity, metadata, session state, and realtime synchronization.
- Add a Desktop Runtime that registers as the user's executable device and runs Claude Code locally against user-owned workspaces.
- Provide Desktop, Web, and iOS clients as first-class control surfaces with a shared product model and event protocol.
- Implement multi-agent IM collaboration where Orchestrator and worker agents can all be backed by the Claude Code local process adapter.
- Add Plan Mode for orchestrated work, including dispatch plan approval when the user explicitly invokes Orchestrator.
- Add interactive permission requests for file writes, command execution, sensitive resource access, and future deployment actions.
- Prioritize code and diff artifacts. Full source code and long-lived full diffs remain local by default; cloud stores metadata and optional short-lived caches.
- Defer GitHub integration, cloud execution, deployment, team workspaces, and rich web previews to later phases.

## Capabilities

### New Capabilities

- `account-sync`: Account-first authentication, personal workspace metadata, session synchronization, and realtime state across Desktop, Web, and iOS.
- `runtime-device-control`: Desktop Runtime registration, heartbeat, command routing, local workspace binding, and Claude Code local process execution.
- `agent-collaboration`: IM-style conversations, multi-agent group chats, Claude Code-backed Orchestrator, Plan Mode, dispatch, and result aggregation.
- `permission-gateway`: User-mediated authorization for risky agent actions with allow/deny decisions and audit logging.
- `code-diff-artifacts`: Code-focused artifacts, changed file summaries, on-demand local diff retrieval, and cloud metadata/caching rules.

### Modified Capabilities

- None.

## Impact

- New monorepo application architecture for shared TypeScript contracts, React UI, Electron desktop shell, Node runtime/control plane, and SwiftUI iOS client.
- Supabase becomes the primary cloud dependency for Auth, Postgres, Realtime, and optional Storage.
- Claude Code CLI becomes the first real agent provider through a local process adapter.
- The data model must cover users, devices, workspaces, conversations, agents, runs, messages, permissions, artifacts, and audit events.
- The API/event contract must support realtime run events, plan events, permission requests, and diff metadata without requiring cloud source-code storage.
