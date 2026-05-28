## Why

The Connections page currently exposes both `Claude Code` and `Claude Code capabilities` as peer rows, which makes one provider look like two separate connections and leaves users without a clear path from diagnosis to recovery. The page needs a tighter setup loop while preserving the current compact AgentHub management-page style.

## What Changes

- Collapse Claude Code capability discovery into the Claude Code provider detail surface instead of showing it as a separate selectable connection row.
- Keep the existing Connections layout, density, typography, list/detail structure, AgentHub-owned controls, and localized copy patterns; this change is a structural refinement, not a visual redesign.
- Add actionable setup guidance for common blocking states: Desktop Runtime offline, Claude Code missing, Claude Code auth/setup required, provider misconfiguration, discovery unavailable, and managed profile issues.
- Let users re-check provider health and Claude Code capability discovery from the Claude Code detail surface while preserving last known results during checks.
- Keep Desktop Runtime and agentmemory as lower-level dependency diagnostics that can explain provider availability without becoming top-level selectable connection rows.
- Preserve future provider slots such as Codex as disabled provider-level rows.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `connection-health-checks`: Add setup-loop guidance and clarify that Claude Code capability discovery is a provider detail rather than a separate connection row.
- `workbench-mvp-ui`: Update Connections page requirements so provider-level rows remain compact and capability/dependency diagnostics render inside the selected provider detail without large UI style changes.

## Impact

- Shared UI view model and Connections components: `packages/ui/src/view-model.ts`, `packages/ui/src/components/connections.tsx`, localized strings, and related component tests.
- Web connection check wiring may continue to call existing `/connections/checks`; no new endpoint is expected unless implementation finds the current payload cannot express combined provider/discovery checks.
- Existing Control Plane and Desktop Runtime connection check routing should remain intact.
- Visual and behavior verification should cover the merged Claude Code detail, offline/runtime-gated checks, checking state, auth/setup issue guidance, disabled Codex row, narrow layout, and English/Simplified Chinese rendering.
