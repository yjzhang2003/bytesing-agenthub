## Why

The Connections page already exposes provider and memory status, but it does not yet feel like the Chat and Agents management surfaces and its refresh action only reloads cached snapshot data. AgentHub needs a dedicated provider health surface where users can verify whether configured user-facing providers such as Claude Code are usable before starting work, while lower-level runtime and memory services remain implementation details elsewhere in the workbench.

## What Changes

- Redesign Connections as a Chat/Agents-style management page with a left connection list and right detail surface.
- Add clear provider-level rows for Claude Code and future providers with compact status, last checked time, and actionable detail states.
- Add user-triggered connection checks for individual connections and an optional check-all action.
- Distinguish cached status refresh from active health checks by showing checking, connected, missing, unavailable, misconfigured, disabled, and offline states.
- Route active checks through Control Plane and Desktop Runtime when the check requires local machine access.
- Keep Desktop Runtime and agentmemory out of the Connections list because they are lower-level dependencies, while retaining their health data for availability decisions and internal checks.
- Keep future provider slots visible but disabled until they have real configuration and check behavior.
- Add English and Simplified Chinese product copy plus rendered/behavior verification for desktop and narrow Connections layouts.

## Capabilities

### New Capabilities

- `connection-health-checks`: Defines user-triggered health checks for local runtime dependencies, including provider and memory connection states, check commands, and result publication.

### Modified Capabilities

- `workbench-mvp-ui`: Adds Connections page layout, interaction, localization, and visual verification requirements matching the Chat and Agents management surfaces.
- `local-runnable-topology`: Extends local health checks from startup/smoke verification into user-triggered provider and memory checks available through the runtime/control-plane path, with Connections rendering only provider-level entries.
- `runtime-device-control`: Extends Desktop Runtime behavior to handle connection check commands and report fresh provider and memory health results.

## Impact

- `packages/ui/src/components/connections.tsx`, shared component usage, styles, i18n keys, and UI tests.
- `packages/ui/src/view-model.ts` and UI view-model types for connection check states and actions.
- `packages/contracts/src/local-runtime.ts` and schemas for connection check commands/results if the existing runtime command model needs extension.
- `services/control-plane/src/http.ts` and `runtime-registry.ts` for check request endpoints, command queueing, and result storage.
- `runtimes/desktop/src/**` for executing provider and memory checks after startup and publishing updated health.
- Web client wiring in `apps/web/src/control-plane-client.ts` and `apps/web/src/main.tsx`.
- Local smoke or focused tests for check request routing and updated status rendering.
