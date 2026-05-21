## 1. UI Foundation

- [x] 1.1 Define light-first professional console design principles in the product UI docs
- [x] 1.2 Define semantic design tokens for colors, typography, spacing, borders, radius, elevation, focus, status, and density
- [x] 1.3 Define shared component state names for loading, empty, offline, blocked, error, success, warning, selected, focused, and disabled
- [x] 1.4 Define responsive breakpoints and collapse rules for Desktop/Web three-column workbench
- [x] 1.5 Define SwiftUI token mapping so iOS uses equivalent semantic names and meanings

## 2. Information Architecture

- [x] 2.1 Specify workspace-first navigation for Desktop, Web, and iOS
- [x] 2.2 Specify primary MVP surfaces: Workspaces, Conversations, Agents, Runs, and Settings
- [x] 2.3 Specify runtime status placement and behavior for online, offline, degraded, and active-running states
- [x] 2.4 Specify MVP exclusions for team spaces, GitHub PR workflows, cloud runtime, deployments, and web preview hosting

## 3. Desktop Web Workbench

- [x] 3.1 Define the Desktop/Web three-column layout with left navigation, center conversation timeline, and right Context Inspector
- [x] 3.2 Define left navigation content for workspace switcher, runtime status, conversations, agents, runs, and settings
- [x] 3.3 Define conversation timeline rendering for user messages, agent messages, Orchestrator messages, run events, plans, permissions, and artifacts
- [x] 3.4 Define composer behavior for agent mentions, Orchestrator targeting, and direct worker-agent routing
- [x] 3.5 Define Context Inspector selection behavior for plan, permission, diff, runtime, and artifact details
- [x] 3.6 Define narrow viewport behavior for collapsing the Context Inspector and sidebar without losing pending permissions

## 4. Plan And Permission Interactions

- [x] 4.1 Define compact Plan Card content for the conversation timeline
- [x] 4.2 Define full plan detail layout in Context Inspector with goal, assumptions, steps, agents, dependencies, artifacts, risks, and actions
- [x] 4.3 Define plan states: draft, invalid, approved, revision requested, cancelled, dispatched, completed, failed
- [x] 4.4 Define inline Permission Card content with requesting agent, action summary, workspace, risk level, and decision state
- [x] 4.5 Define global pending permission queue for Desktop/Web and equivalent iOS pending permissions surface
- [x] 4.6 Define permission states: pending, allowed once, denied, expired, blocked, completed

## 5. Diff Review Experience

- [x] 5.1 Define compact Diff Card content for changed files, insertions, deletions, run association, and open-review action
- [x] 5.2 Define right-panel diff review layout with file list, selected file diff, metadata, stale state, offline state, and review actions
- [x] 5.3 Define full-screen diff review layout and return path to the conversation workbench
- [x] 5.4 Define iOS diff review flow from changed-file list to single-file diff detail
- [x] 5.5 Define behavior for offline runtime, stale diff, unavailable full diff, and temporary cached diff states

## 6. iOS Experience

- [x] 6.1 Define iOS navigation structure for workspace list, workspace home, conversations, conversation detail, inspector details, runs, agents, and settings
- [x] 6.2 Define iOS conversation timeline parity for messages, run states, plan summaries, permission cards, and artifact cards
- [x] 6.3 Define iOS Plan Mode detail surface using bottom sheet or pushed detail screen
- [x] 6.4 Define iOS permission review and decision flow for allow once, deny, timeout, and offline runtime states
- [x] 6.5 Define iOS runtime limitation messaging for actions that require Desktop Runtime execution

## 7. Visual QA And Acceptance

- [x] 7.1 Create visual QA checklist for workspace workbench, active group chat, plan review, permission queue, diff review, offline runtime, and mobile layouts
- [x] 7.2 Verify the UI spec avoids marketing pages, decorative hero sections, oversized dashboard cards, generic purple gradients, and decorative orb backgrounds
- [x] 7.3 Verify Desktop/Web and iOS specs use the same product object names and state names
- [x] 7.4 Verify Plan, Permission, and Diff interactions have default placement, actions, empty states, error states, offline states, and mobile equivalents
- [x] 7.5 Document that dark mode, team UI, GitHub UI, deployment UI, web preview UI, and cloud runtime UI are outside MVP
