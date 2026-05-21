## Why

The existing AgentHub control-plane change defines the platform capabilities but does not yet make the UI, product information architecture, or key interaction rules decision-complete. AgentHub needs a dedicated UI specification so Desktop, Web, and iOS can be implemented as one coherent developer control product instead of three divergent clients.

## What Changes

- Define AgentHub's visual direction as a light-first professional developer console.
- Define Desktop and Web as a workspace-first three-column workbench with navigation, conversation timeline, and Context Inspector.
- Define iOS as an experience-isomorphic native client that preserves the same product objects and cards while adapting layout to mobile navigation.
- Specify the main conversation workbench, including IM-style multi-agent timeline, composer, mentions, run states, artifacts, and runtime status.
- Specify Plan Mode, permission requests, and diff review as first-class interaction surfaces rather than ad hoc message cards.
- Establish design-system rules for tokens, density, component states, responsiveness, empty/error/offline states, and visual QA.
- Keep this change focused on UI/UX behavior and interaction contracts; it does not change the Supabase, runtime, Claude Code adapter, or persistence architecture.

## Capabilities

### New Capabilities

- `ui-information-architecture`: Workspace-first navigation, global app structure, primary surfaces, and cross-client routing rules.
- `conversation-workbench`: Desktop/Web three-column workbench, group chat timeline, composer, agent mentions, run indicators, and Context Inspector behavior.
- `plan-permission-interactions`: Plan Mode, permission queue, inline permission cards, decision actions, and cross-client state behavior.
- `diff-review-experience`: Diff summary cards, right-panel review, full-screen review, mobile diff navigation, stale/offline states, and artifact review actions.
- `ios-mobile-experience`: Native iOS navigation, mobile adaptations of workspace, conversation, plan, permission, diff, and runtime status surfaces.
- `visual-design-system`: Light-first professional console visual language, design tokens, density rules, component states, accessibility, and visual QA constraints.

### Modified Capabilities

- None.

## Impact

- Adds UI/UX requirements that guide the shared React UI, Electron desktop app, Web app, and SwiftUI iOS app.
- Introduces no backend architecture changes; UI behavior relies on existing control-plane concepts: accounts, workspaces, runtime devices, conversations, agents, runs, permissions, and code/diff artifacts.
- Establishes implementation tasks for design tokens, shared components, Desktop/Web workbench, iOS screens, key interaction states, and visual verification.
