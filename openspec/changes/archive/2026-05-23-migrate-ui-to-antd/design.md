## Context

AgentHub Desktop/Web is a React UI shared by the web client and Electron desktop shell. The product already has meaningful component boundaries, including primitive controls, status badges, detail sections, chat timeline, composer, agent pages, connections pages, and workbench layout. The current pain is that common control behavior and polish are still mostly handcrafted: form layout, validation display, dropdowns, menus, tooltips, empty states, loading states, notifications, avatars, badges, and modal surfaces.

Ant Design can reduce that repeated work, but AgentHub's target experience is not a default enterprise admin dashboard. The workbench is a compact desktop IM/client surface with a left rail, resizable sidebars, dense rows, runtime state, conversation context, and role-specific agent management. The migration must use Ant Design for durable component foundations while preserving the AgentHub-owned shell and interaction model.

## Goals / Non-Goals

**Goals:**
- Add Ant Design to Desktop/Web as the default library for common controls and stateful UI primitives.
- Preserve AgentHub's current Control Plane API contracts, workbench view model, route-free center-view model, Electron startup flow, and local dev behavior.
- Create an AgentHub theme bridge that maps semantic tokens to Ant Design component tokens for dark/light modes and compact density.
- Replace high-value hand-rolled UI first: forms, inputs, selects, text areas, buttons, dropdowns, tooltips, badges, avatars, tabs, empty/loading states, notifications, and modal flows.
- Evaluate Ant Design X chat components with a small spike before adopting them for timeline/composer surfaces.
- Keep existing behavior tests and add wrapper/component tests that protect product-specific workflows.

**Non-Goals:**
- Rebuild the product as a generic Ant Design admin console.
- Replace Control Plane APIs, agent role contracts, runtime provider contracts, memory contracts, or Electron app structure.
- Fully migrate every visual surface in one pass.
- Adopt native macOS SwiftUI/AppKit UI as part of this change.
- Remove AgentHub-owned layout shells for the rail, sidebars, agent directory, timeline, composer, or connections page.

## Decisions

### Decision: Use Ant Design behind AgentHub-owned wrappers

AgentHub will expose internal UI wrappers for common controls rather than importing Ant Design components directly throughout product surfaces. Wrappers keep product code stable, centralize density/theme overrides, and allow selective rollback if a component does not fit the IM client style.

Alternatives considered:
- Direct Ant Design imports everywhere: faster initially, but spreads vendor-specific props and styling assumptions across the workbench.
- Continue fully custom controls: keeps visual control, but repeats solved accessibility, overlay, form, and feedback behavior.

### Decision: Keep layout and workbench shells custom

The left rail, chat sidebar, resizable panel behavior, center view switching, agent directory layout, connection diagnostics layout, composer placement, and runtime-aware workbench structure remain AgentHub-owned. Ant Design supplies controls inside these layouts.

Alternatives considered:
- Use Ant Design Layout/Menu globally: would push the product toward an admin-dashboard shape and weaken the desktop IM feel.
- Replace the workbench with Ant Design Pro patterns: too broad and mismatched for the current local runnable client.

### Decision: Map AgentHub semantic tokens into Ant Design tokens

The theme layer will derive Ant Design tokens from existing AgentHub semantic variables for color, radius, border, focus, status, density, and typography. Dark and light modes must remain controlled by AgentHub state, with Ant Design ConfigProvider receiving the matching algorithm/token overrides.

Alternatives considered:
- Use Ant Design default dark/light themes: faster, but creates visual inconsistency with existing sidebars and custom timeline surfaces.
- Replace AgentHub CSS variables entirely: too disruptive and unnecessary for a phased migration.

### Decision: Migrate forms and operational controls before chat primitives

Agent editor, connections detail, settings, modal flows, tooltips, dropdowns, empty/loading states, and status controls are the first migration targets. Timeline and composer chat primitives require a separate Ant Design X spike because they are more sensitive to AgentHub's IM behavior and runtime navigation.

Alternatives considered:
- Start with message bubbles: visually prominent, but higher risk because current timeline has agent navigation, run events, compact cards, and inspector selection.
- Migrate everything surface-by-surface: risks duplicating wrappers and theming decisions before the foundation is stable.

### Decision: Treat Ant Design X as optional until proven

Ant Design X may provide useful Bubble, Sender, Conversations, and chat avatar patterns. The implementation must verify whether those components support AgentHub's message metadata, agent-click navigation, run events, compact operational cards, and dense desktop layout before replacing custom timeline/composer pieces.

Alternatives considered:
- Adopt Ant Design X immediately: may save work, but could force mismatched behavior into the core conversation surface.
- Ignore Ant Design X: leaves potentially useful chat primitives unexplored.

## Risks / Trade-offs

- Ant Design default styling could dilute AgentHub's desktop IM visual language -> Mitigation: use wrappers, token bridge, compact density, and keep layout shells custom.
- Bundle size and CSS payload may increase -> Mitigation: measure app bundle after adding dependencies and avoid importing unused optional packages.
- Ant Design overlay portals may conflict with Electron/window layering or test snapshots -> Mitigation: centralize providers and add component tests for dropdowns, tooltips, modals, and notifications.
- Existing CSS selectors may fight Ant Design class names -> Mitigation: scope AgentHub overrides through wrapper classes and avoid global Ant Design selector patches except theme-level resets.
- Ant Design X may not support mixed timeline content -> Mitigation: run a spike and keep the current custom timeline if replacement reduces behavior quality.
- Tests may become brittle due to generated markup -> Mitigation: test user-visible behavior and wrapper contracts, not Ant Design internal DOM structure.

## Migration Plan

1. Add Ant Design dependencies and a root ConfigProvider in the shared UI app boundary.
2. Implement `AgentHubThemeProvider` to map current dark/light semantic tokens into Ant Design theme tokens.
3. Introduce wrapper primitives for common controls and migrate low-risk usages first.
4. Migrate Agents page editor/list controls and Connections page diagnostics controls.
5. Migrate settings, modal, tooltip, dropdown, empty/loading, notification, badge, and avatar surfaces.
6. Run an Ant Design X spike for timeline/composer components and document the adopt/keep decision.
7. Update tests and visual QA screenshots for desktop/narrow layouts and dark/light themes.
8. Keep rollback simple by preserving AgentHub wrappers and avoiding direct Ant Design usage in feature components.

## Open Questions

- Should Ant Design X be added in the first implementation pass or only after the core Ant Design foundation lands?
- Which wrappers should remain thin Ant Design pass-throughs versus product-specific components with constrained props?
- Do we want to preserve current CSS variable names indefinitely, or eventually generate both CSS variables and Ant Design tokens from one token source?
