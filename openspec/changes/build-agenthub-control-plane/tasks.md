## 1. Project Foundation

- [x] 1.1 Create pnpm monorepo structure for shared contracts, web app, desktop app, control plane API, desktop runtime, and iOS project placeholder
- [x] 1.2 Add TypeScript, linting, formatting, test runner, and shared build scripts
- [x] 1.3 Define environment variable conventions for Supabase, control plane API, and local runtime configuration
- [x] 1.4 Add developer documentation for local setup and expected process topology

## 2. Shared Protocol And Domain Model

- [x] 2.1 Define shared TypeScript types for users, workspaces, devices, conversations, messages, agents, providers, runs, permissions, artifacts, and audit events
- [x] 2.2 Define AgentHub realtime event types for run lifecycle, message deltas, plan lifecycle, artifact updates, and device status
- [x] 2.3 Define JSON schemas for Orchestrator dispatch plans and provider-normalized runtime events
- [x] 2.4 Add schema validation utilities and tests for invalid Orchestrator output, invalid runtime events, and stale diff metadata

## 3. Supabase Backend

- [x] 3.1 Create Supabase migration for users-owned tables: workspaces, runtime_devices, conversations, conversation_participants, messages, agents, providers, runs, permissions, artifacts, and audit_logs
- [x] 3.2 Add row-level security policies scoped to authenticated user ownership
- [x] 3.3 Add Realtime publication coverage for messages, runs, permissions, artifacts, and runtime_devices
- [x] 3.4 Add seed data for a single personal workspace, Claude Code provider, Orchestrator agent, and worker agents
- [x] 3.5 Add database tests or migration checks for ownership isolation and required indexes

## 4. Control Plane API

- [x] 4.1 Implement authenticated API middleware using Supabase Auth JWTs
- [x] 4.2 Implement runtime device registration, heartbeat, and offline timeout handling
- [x] 4.3 Implement command routing from clients to the owning Desktop Runtime for workspace-bound runs
- [x] 4.4 Implement run creation, cancellation, state transitions, and event persistence
- [x] 4.5 Implement WebSocket or SSE channel for runtime-to-control-plane execution events
- [x] 4.6 Add API tests for unauthorized access, offline runtime routing failures, and run cancellation

## 5. Desktop Runtime

- [x] 5.1 Implement signed-in runtime bootstrap and device registration
- [x] 5.2 Implement local workspace registration with path, display name, git metadata, and owning runtime device
- [x] 5.3 Implement long-lived connection to receive commands from the control plane
- [x] 5.4 Implement process management for starting, streaming, cancelling, and cleaning up Claude Code runs
- [x] 5.5 Implement provider output normalization into AgentHub runtime events
- [x] 5.6 Add runtime tests with a fake provider adapter that lives outside product core

## 6. Claude Code Agent Adapter

- [x] 6.1 Implement `agenthub-adapter-claude-code` as a provider adapter separate from core runtime logic
- [x] 6.2 Map Agent identity, role prompt, workspace path, and conversation context into Claude Code local process invocation
- [x] 6.3 Stream Claude Code output into message delta and run lifecycle events
- [x] 6.4 Surface adapter failures as typed run failure events with stderr and exit code metadata
- [x] 6.5 Document local Claude Code prerequisites and authentication assumptions

## 7. Agent Collaboration And Orchestrator

- [x] 7.1 Implement conversation creation for single-agent and group conversations
- [x] 7.2 Implement explicit mention routing for non-Orchestrator agents and Orchestrator
- [x] 7.3 Implement Plan Mode lifecycle: draft, invalid, approved, revision requested, cancelled, dispatched, completed
- [x] 7.4 Implement Orchestrator schema validation and regeneration/blocking behavior for invalid dispatch plans
- [x] 7.5 Implement task assignment records that link Orchestrator plan steps to worker agent runs
- [x] 7.6 Implement Orchestrator summary creation after assigned worker runs reach terminal state

## 8. Permission Gateway

- [x] 8.1 Implement permission request creation for file writes, shell commands, sensitive resource access, and future deployment actions
- [x] 8.2 Implement allow once and deny decisions from any signed-in client
- [x] 8.3 Route permission decisions back to Desktop Runtime and unblock or deny pending runtime actions
- [x] 8.4 Add timeout behavior for unanswered permission requests
- [x] 8.5 Persist permission decisions to audit logs with user, device, workspace, run, agent, action, decision, and timestamp
- [x] 8.6 Add tests for permission gates in both normal chat mode and Plan Mode

## 9. Code And Diff Artifacts

- [x] 9.1 Implement local git status and diff summary collection in Desktop Runtime
- [x] 9.2 Persist code artifact metadata with changed paths, insertions, deletions, base commit, and working tree fingerprint
- [x] 9.3 Implement on-demand full diff retrieval routed from Web/Desktop/iOS through control plane to Desktop Runtime
- [x] 9.4 Implement optional short-lived full-diff cache with TTL and workspace-level configuration
- [x] 9.5 Implement stale diff detection when local git state no longer matches stored run metadata
- [x] 9.6 Add tests for online diff retrieval, offline summary display, and stale diff warnings

## 10. Shared React UI

- [x] 10.1 Build shared conversation list, chat timeline, composer, participant chips, and agent mention components
- [x] 10.2 Build Plan Card UI with approve, revise, cancel, and dispatch state display
- [x] 10.3 Build Permission Card UI with allow once, deny, timeout, and audit state display
- [x] 10.4 Build Diff Card UI with summary, changed file list, full diff loading, offline state, and stale warning
- [x] 10.5 Build runtime device and workspace status surfaces
- [x] 10.6 Add component tests for state transitions and responsive layouts

## 11. Desktop And Web Clients

- [x] 11.1 Implement Electron desktop shell that hosts shared React UI and starts Desktop Runtime
- [x] 11.2 Implement Web app that uses the same shared React UI and connects to Supabase plus control plane API
- [x] 11.3 Implement authentication flows for Desktop and Web
- [x] 11.4 Implement workspace selection, agent management, conversation creation, and group chat flows
- [x] 11.5 Implement end-to-end Desktop/Web flow for Orchestrator plan approval, worker execution, permission request, and diff display

## 12. iOS Client

- [x] 12.1 Create SwiftUI app using the shared API and event schema contracts
- [x] 12.2 Implement authentication, workspace list, runtime status, conversation list, and chat timeline
- [x] 12.3 Implement Plan Card, Permission Card, and Diff Card equivalents in native SwiftUI
- [x] 12.4 Implement run cancellation and permission decision actions routed through the control plane
- [x] 12.5 Validate iOS behavior when Desktop Runtime is offline, online, and actively running a task

## 13. Verification And Demo

- [x] 13.1 Add integration test covering login, runtime registration, workspace binding, and conversation synchronization
- [x] 13.2 Add integration test covering Orchestrator Plan Mode and worker dispatch
- [x] 13.3 Add integration test covering permission request, allow once, file modification, and audit log persistence
- [x] 13.4 Add integration test covering diff summary persistence and on-demand full diff retrieval
- [x] 13.5 Prepare demo script for the full MVP loop across Desktop, Web, and iOS
- [x] 13.6 Document P2 boundaries for GitHub integration, cloud runtime, deployment, team workspaces, and web preview artifacts
