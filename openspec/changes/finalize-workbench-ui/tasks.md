## 1. Workbench View Model

- [x] 1.1 Define typed Desktop/Web workbench view models for workspace navigation, runtime summary, conversation timeline items, composer target state, inspector selection, and visual component states.
- [x] 1.2 Map the existing `WorkbenchSnapshot` into the MVP UI view model without introducing client-only transcript fixtures.
- [x] 1.3 Add fallback mappings for loading, empty, offline, unavailable, metadata-only, and error states where backend data is not available yet.
- [x] 1.4 Add unit tests for snapshot-to-view-model mapping, runtime action availability, and selected inspector fallback behavior.

## 2. Workbench Shell and Navigation

- [x] 2.1 Refactor the shared `AgentHubWorkbench` shell into explicit left navigation, timeline/composer, and Context Inspector regions with stable ARIA landmarks.
- [x] 2.2 Implement workspace status, runtime status, conversation list, Agents, Runs, Settings, and pending permission affordances in left navigation.
- [x] 2.3 Preserve navigation and history visibility when runtime-dependent actions are disabled.
- [x] 2.4 Add tests for loading, connection error, online runtime, offline runtime, and empty conversation shell states.

## 3. Timeline and Composer

- [x] 3.1 Implement timeline item rendering for user messages, agent messages, Orchestrator messages, run events, plan cards, permission cards, diff cards, artifact cards, and final summaries.
- [x] 3.2 Add selectable timeline card behavior that updates the current Context Inspector mode.
- [x] 3.3 Implement composer target selection that distinguishes Orchestrator Plan Mode from direct worker-agent messages.
- [x] 3.4 Disable runtime-dependent composer submission with an accessible explanation when the runtime is offline.
- [x] 3.5 Add component tests for timeline composition, card selection, Orchestrator targeting, worker targeting, and disabled send behavior.

## 4. Context Inspector and Detail Modes

- [x] 4.1 Implement Context Inspector modes for empty, plan, permission, diff, runtime, artifact, and run details.
- [x] 4.2 Implement plan detail sections for goal, assumptions, assigned agents, steps, risks, progress, and actions.
- [x] 4.3 Implement permission detail with requesting agent, action type, summary, workspace, risk, related run/plan, Allow once, and Deny actions.
- [x] 4.4 Implement diff detail with changed file summary, insertions, deletions, status, metadata, stale/offline warnings, and full-screen review entry.
- [x] 4.5 Implement runtime detail with device identity, online state, heartbeat, capabilities, workspace binding, active runs, and offline/degraded explanations.
- [x] 4.6 Add tests for each inspector mode and for selected detail becoming unavailable after a snapshot update.

## 5. Responsive Layout and Visual System

- [x] 5.1 Implement responsive layout modes that show three columns at wide desktop widths, collapse the Context Inspector first, and collapse left navigation second.
- [x] 5.2 Add compact light-first styling tokens and CSS for workbench panels, lists, timeline items, cards, buttons, focus states, and status treatments.
- [x] 5.3 Ensure long workspace, agent, branch, and file names truncate or wrap without overlapping controls.
- [x] 5.4 Remove or avoid marketing-style, decorative, oversized, nested-card, gradient, orb, or landing-page visual patterns in the app entry.
- [x] 5.5 Add keyboard focus and accessible labels for workspace navigation, conversation list, timeline cards, composer controls, inspector actions, permission decisions, and diff file navigation.

## 6. Full-Screen Diff and Verification

- [x] 6.1 Implement full-screen diff review entry and return path to the originating workspace/conversation context.
- [x] 6.2 Add rendered verification coverage for online workbench, offline runtime, active multi-agent conversation, draft plan review, pending permission queue, inline permission card, diff review, full-screen diff review, empty conversation, error state, and narrow layout.
- [x] 6.3 Verify Desktop shell still loads the Web workbench and inherits the same MVP UI states.
- [x] 6.4 Run `pnpm check`.
- [x] 6.5 Run `pnpm smoke:local` on an available local port and document any port override needed for local verification.

## 7. Codex-like Visual Refinement

- [x] 7.1 Add open-source UI primitive dependencies for shared scroll/separator behavior and consistent iconography.
- [x] 7.2 Rework the workbench visual layer into a Codex-like monochrome console instead of the first-pass custom card-heavy styling.
- [x] 7.3 Add dark and light theme tokens with an in-workbench theme toggle.
- [x] 7.4 Preserve existing view model, timeline, inspector, and composer behavior while replacing the visual treatment.
- [x] 7.5 Re-run UI typecheck and rendered component tests after the visual rewrite.
