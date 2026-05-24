## 1. Contracts and View Models

- [x] 1.1 Add typed connection check request, command, and result contracts for provider, memory, and runtime checks.
- [x] 1.2 Update schema validation and contract tests for connection check commands and health result payloads.
- [x] 1.3 Extend UI view-model types with connection identity, checkability, disabled reasons, and transient checking state.
- [x] 1.4 Update `createWorkbenchViewModel` so user-facing providers and disabled future providers render through one connection list model while lower-level runtime and memory dependencies remain internal state.

## 2. Control Plane Routing

- [x] 2.1 Add authenticated Control Plane endpoint or action for requesting one or more connection checks.
- [x] 2.2 Route provider and memory checks to the online Desktop Runtime bound to the active workspace.
- [x] 2.3 Return actionable offline or unsupported responses when checks cannot be queued.
- [x] 2.4 Store provider and memory health results from runtime check completion in the same snapshot-visible state used by existing status routes.
- [x] 2.5 Add Control Plane tests for check queueing, offline rejection, unsupported checks, and stored result visibility.

## 3. Desktop Runtime Checks

- [x] 3.1 Extend runtime command handling to accept non-run connection check commands.
- [x] 3.2 Reuse Claude Code provider preflight for user-triggered provider checks.
- [x] 3.3 Reuse `AgentMemoryClient.checkHealth()` for user-triggered agentmemory checks.
- [x] 3.4 Publish provider and memory check results back to Control Plane without creating runs or timeline messages.
- [x] 3.5 Add Desktop Runtime tests for provider check, memory check, unsupported check, and no-run side effects.

## 4. Web Client Wiring

- [x] 4.1 Add Web Control Plane client methods for checking one connection and checking all enabled connections.
- [x] 4.2 Wire Connections actions through `AgentHubWorkbench` and refresh or update snapshot state after check requests.
- [x] 4.3 Preserve last known health while a check is pending and clear pending state when fresh health is observed or the request fails.
- [x] 4.4 Add user-visible error handling for failed check requests.

## 5. Connections UI

- [x] 5.1 Redesign Connections as a compact side-list/detail management page aligned with Chat and Agents page structure.
- [x] 5.2 Add Claude Code and future provider rows with status badges, last checked labels, and selected states; keep Desktop Runtime and agentmemory out of the user-facing connection list.
- [x] 5.3 Add detail panels with configuration rows, failure reasons, disabled explanations, Check connection, and Check all actions.
- [x] 5.4 Add checking-state affordances that do not overwrite the last known health result.
- [x] 5.5 Make narrow layout stack or collapse cleanly without text overlap or unreachable actions.
- [x] 5.6 Add English and Simplified Chinese i18n keys for all new Connections labels, actions, and explanations.

## 6. Verification

- [x] 6.1 Add UI tests for connected, failed, disabled, offline, and checking Connections states.
- [x] 6.2 Add rendered verification for desktop and narrow Connections layouts in English and Simplified Chinese.
- [x] 6.3 Add local verification or smoke coverage for provider and memory check requests in local-demo mode.
- [x] 6.4 Run `pnpm check`.
- [x] 6.5 Run `openspec validate improve-connections-health-checks --strict`.
