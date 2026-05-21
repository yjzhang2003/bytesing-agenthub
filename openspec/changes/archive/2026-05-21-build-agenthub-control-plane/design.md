## Context

AgentHub is starting from a course brief and has no application code yet. The product direction is a personal multi-agent control plane: Desktop, Web, and iOS clients share one account-backed experience, while local execution happens through a Desktop Runtime on the user's machine.

The first real agent provider is Claude Code running as a local process. Mock agents are not part of the product core; any mock implementation must live behind the same adapter contract and be removable without changing the platform model.

The platform must support three first-class clients, but execution capability is not equal across clients. Desktop can run local processes and inspect workspaces. Web and iOS control the same workflows through cloud state and command routing.

## Goals / Non-Goals

**Goals:**

- Provide an account-first AgentHub platform using Supabase for Auth, Postgres, Realtime, and optional short-lived artifact storage.
- Provide a Desktop Runtime that registers as an executable device and runs Claude Code against local workspace paths.
- Provide Desktop, Web, and iOS clients with the same conversation, agent, plan, permission, and diff concepts.
- Support multi-agent group chat with a Claude Code-backed Orchestrator and Claude Code-backed worker agents.
- Support Plan Mode when the user explicitly invokes Orchestrator, including plan approval before dispatch.
- Support interactive permission requests for risky actions such as file writes and command execution.
- Keep source code and full diffs local by default, with cloud storage limited to metadata and optional short-lived caches.

**Non-Goals:**

- Cloud-hosted agent execution or cloud workspaces.
- Team spaces, organization roles, and collaborative permissions.
- GitHub OAuth, branch creation, push, pull request creation, or PR review workflows.
- Deployment publishing, web preview hosting, document/PPT artifact rendering, or mobile-local agent execution.
- Replacing git history with an AgentHub versioning system.

## Decisions

### Use Supabase as the account and synchronization backend

Supabase provides the fastest path to Auth, Postgres, Realtime subscriptions, and Storage while keeping the project understandable for a course demo. AgentHub will use Supabase for durable metadata and realtime client synchronization.

Alternative considered: a fully custom Node API and Postgres backend. This gives more control but requires implementing authentication, realtime fanout, and storage primitives that are not central to the product thesis.

### Keep a separate Node control plane for runtime routing

Agent execution control does not fit cleanly into direct client-to-Supabase writes. A Node control plane will validate run requests, route commands to Desktop Runtime devices, maintain runtime sessions, and normalize runtime events before they are persisted or broadcast.

Alternative considered: clients write run requests directly to Supabase and runtimes poll tables. Polling is simpler but produces weaker control over authorization, retries, concurrency, and live execution status.

### Make Desktop Runtime the execution boundary

The Desktop Runtime owns local workspace paths, launches Claude Code, streams events, computes git status/diff, and enforces permission decisions. Web and iOS never directly access local files or spawn Claude Code.

Alternative considered: browser-local execution. Browsers cannot safely provide the required local process, file-system, and git capabilities.

### Model agents separately from providers

An Agent is a product identity with a name, role, system prompt, capabilities, and permission policy. A Provider is an execution backend such as Claude Code. Multiple Agents can use the same Claude Code provider with different prompts and roles.

This enables the MVP to run Orchestrator, Architect, Implementer, and Reviewer all through Claude Code while preserving a future adapter path for Codex, OpenCode, or custom providers.

### Use Claude Code-backed Orchestrator with schema-checked outputs

Orchestrator is an Agent with a special role. It uses Claude Code but must operate through an Orchestrator skill/rules package, structured dispatch plans, and hook validation. The backend treats plan creation, assignment, blocking, completion, and summary as typed events.

Alternative considered: a rule-based orchestrator. It is more predictable but less representative of the intended multi-agent collaboration product.

### Prefer Plan Mode for explicit Orchestrator work

Normal group chat remains conversational. When the user explicitly mentions Orchestrator or chooses coordinated execution, Orchestrator must create a dispatch plan before worker execution. High-risk actions still trigger permission gates in every mode.

### Store diff metadata durably and retrieve full diffs on demand

The durable cloud record stores changed paths, line counts, base commit, run association, and artifact metadata. Full diffs are computed by Desktop Runtime from local git state when requested. Optional full-diff caching is short-lived and user-configurable.

Alternative considered: storing every full diff permanently in the cloud. That improves offline review but conflicts with the privacy boundary and turns AgentHub into a source-code storage system.

## Risks / Trade-offs

- **Desktop Runtime offline blocks execution** -> Web and iOS will still show history, plans, metadata, and device status, but execution controls must show that the workspace requires an online runtime.
- **Claude Code CLI integration behavior changes** -> Keep all CLI invocation details inside `agenthub-adapter-claude-code` and expose only stable AgentHub events to the rest of the system.
- **Three clients increase scope** -> Build shared contracts first, prioritize Desktop/Web for the first execution loop, then implement iOS against the same API and event model.
- **Supabase Realtime may not be enough for all runtime events** -> Use Supabase for persisted state and a Node WebSocket/SSE channel for high-frequency execution streams if needed.
- **Permission bridging with Claude Code may be complex** -> Implement AgentHub-level permission requests as the product protocol first; bridge native CLI prompts where supported and otherwise gate AgentHub-initiated file/command capabilities.
- **Full diff retrieval depends on git state remaining available** -> Store base commit and run fingerprints so the UI can detect when a requested diff is stale or no longer reproducible.
