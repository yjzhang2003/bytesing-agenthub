## Context

AgentHub already has an OpenSpec change for the account-backed control-plane architecture: Supabase sync, Desktop Runtime execution, Claude Code-backed agents, Plan Mode, permission gateway, and code/diff artifacts. That change identifies UI tasks but does not define the product information architecture or key interaction patterns.

This design sets the UI direction before implementation. AgentHub is a professional developer console for controlling multiple agents, not a landing page, casual chat app, or IDE clone. Desktop, Web, and iOS must feel like one product even though Desktop/Web share React UI and iOS uses native SwiftUI.

## Goals / Non-Goals

**Goals:**

- Make Desktop/Web and iOS UI implementation decision-complete for MVP.
- Establish a light-first professional console visual language.
- Define workspace-first navigation across all clients.
- Define Desktop/Web as a three-column workbench: navigation, conversation timeline, and Context Inspector.
- Define iOS as experience-isomorphic: same objects and actions, mobile-native layout.
- Specify Plan Mode, permission, and diff review surfaces with default placement, states, and fallback behavior.
- Define design-system constraints for density, typography, colors, components, accessibility, and visual QA.

**Non-Goals:**

- Creating marketing pages, onboarding tours, or website hero sections.
- Designing team collaboration, GitHub PR review, deployment, web preview, or cloud runtime UI.
- Replacing the existing backend architecture or adding persistence requirements.
- Forcing iOS to reuse React/WebView UI.
- Finalizing brand identity beyond the MVP design system.

## Decisions

### Use a light-first professional console

The MVP default theme is light. The UI should feel focused, technical, and calm: high information density, strong hierarchy, restrained color, crisp dividers, and explicit status surfaces. Dark mode can be added later through the same tokens but is not MVP parity work.

Alternative considered: dark-first developer tool. It fits long coding sessions but was not the selected default. The design system must still avoid color choices that make dark mode hard later.

### Make workspace the primary navigation object

Every execution path depends on a workspace and an online runtime. The app should lead with workspace selection, then show conversations, agents, runs, and settings within that workspace context.

Alternative considered: conversation-first navigation. It is faster for chat but hides the local execution boundary and makes offline runtime states less obvious.

### Use a three-column Desktop/Web workbench

Desktop/Web default layout:

- Left rail/sidebar: workspace switcher, runtime status, conversations, agents, runs, settings.
- Center: current conversation timeline and composer.
- Right Context Inspector: selected plan, permission queue, diff review, runtime details, artifact details.

This keeps IM collaboration central while giving complex agent control surfaces enough room.

Alternative considered: chat-only layout. It makes the product feel simpler but overloads the message stream with plans, permissions, and diffs.

### Use Context Inspector as the default detail surface

Plans, diffs, permission queues, runtime details, and artifact details open in the right panel by default. Message cards remain concise and link to the relevant inspector detail. Full-screen review is reserved for large diffs and focused plan review.

### Keep iOS experience-isomorphic

iOS must contain the same core objects and actions: workspace, runtime status, conversation, agent, run, plan, permission, diff, and artifact. It adapts the three-column workbench into tab navigation plus push/detail screens and bottom sheets.

Alternative considered: iOS as approval-only companion. It is easier but contradicts the product goal of three first-class clients.

### Treat Plan, Permission, and Diff as first-class interactions

Plan Mode is not just a long assistant message. Permission requests are not just transient alerts. Diff review is not just a code block. Each has a durable state, compact timeline card, Context Inspector view, mobile equivalent, and clear empty/error/offline states.

### Use React shared UI for Desktop/Web and shared contracts for iOS

Desktop/Web share React components and design tokens. iOS uses SwiftUI components that follow the same API schemas, state machines, token names, and interaction requirements. Code-level UI reuse is not required across Web and iOS.

## Risks / Trade-offs

- **Three-column layout can feel crowded on smaller Web viewports** -> Collapse the Context Inspector first, then sidebar sections, while keeping conversation and pending permissions reachable.
- **Light theme can feel less like a developer tool** -> Use compact spacing, strong type hierarchy, code-aware surfaces, status color discipline, and restrained neutral backgrounds.
- **Plans and diffs can overwhelm chat context** -> Keep timeline cards compact and put full content in Context Inspector or full-screen review.
- **iOS parity can grow scope** -> Define iOS MVP as the same objects and actions with mobile layout, not every Desktop/Web density feature.
- **Permission requests can be missed during parallel agent runs** -> Combine inline source cards with a global pending permission queue.
- **Shared tokens can drift between React and SwiftUI** -> Treat token names and semantic component states as contract artifacts, with visual QA screenshots for each client.
