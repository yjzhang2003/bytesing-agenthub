## Context

AgentHub currently exposes `AgentHub*` UI wrappers backed by Ant Design components. That wrapper layer did not provide a true design-system boundary: feature code still relies on AntD prop shapes, AntD DOM class names, AntD portal behavior, AntD theme tokens, and AntD visual defaults. Recent chat and modal work showed concrete failures: vendor primary color leaked into AgentHub dialogs, modal portal placement bypassed AgentHub CSS variables, and fixes required feature-specific selectors against AntD internals.

The desired direction is not "better AntD wrappers"; it is a first-party AgentHub component system. AgentHub can still use low-level unstyled primitives where useful, but visual language, density, component APIs, state semantics, and accessibility contracts must be AgentHub-owned.

## Goals / Non-Goals

**Goals:**
- Remove AntD and Ant Design X from `@agenthub/ui` runtime dependencies.
- Replace `components/antd-primitives.tsx` with first-party AgentHub component modules and APIs.
- Define a component standard that covers tokens, variants, sizes, focus states, modal/overlay behavior, form controls, feedback, accessibility, and localization.
- Migrate existing Desktop/Web surfaces without changing Control Plane APIs or workbench workflows.
- Remove CSS selectors that target AntD internals and replace them with AgentHub classes and `data-*` state contracts.
- Make future UI work harder to regress into vendor styling leaks by adding tests and lint/search checks.

**Non-Goals:**
- Redesign the entire AgentHub information architecture.
- Replace React, Motion, Lucide, Marked, or Radix primitives that do not own visual language.
- Introduce a large external component framework as a new replacement for AntD.
- Build a public npm package or cross-repo design system distribution in this change.
- Change Control Plane data models, runtime behavior, or API endpoints.

## Decisions

### Decision 1: First-party components replace AntD wrappers

AgentHub will own its common UI components directly. The component layer should live under `packages/ui/src/components/system/` or an equivalent local module and export components such as `Button`, `IconButton`, `TextInput`, `TextArea`, `Select`, `Checkbox`, `Switch`, `Dialog`, `Dropdown`, `Tabs`, `Badge`, `Avatar`, `EmptyState`, `LoadingState`, and `Toast`/message feedback.

Rationale: passing AntD props through AgentHub wrappers preserves the vendor as the real API. A first-party API lets feature components express AgentHub semantics such as `tone`, `size`, `variant`, `density`, `state`, and `ariaLabel` without inheriting unrelated vendor behavior.

Alternatives considered:
- Keep AntD and harden wrappers. Rejected because the failures are structural: portal roots, theme defaults, internal DOM classes, and prop leakage still need constant policing.
- Replace AntD with another styled component library. Rejected because the problem is vendor visual ownership, not AntD specifically.

### Decision 2: Use unstyled primitives only when they do not own visual language

AgentHub may use Radix primitives or equivalent source patterns for behavior-heavy widgets such as dialog focus trapping, select listbox semantics, tooltip positioning, dropdown menus, scroll areas, and separators. Styling remains entirely AgentHub-owned.

Rationale: fully hand-rolling all accessibility behavior is risky, but behavior primitives are different from adopting a styled design language.

Alternatives considered:
- Hand-roll every control. Rejected because select, dialog, menu, and tooltip accessibility is easy to get subtly wrong.
- Keep styled vendor widgets for complex controls. Rejected because it reintroduces visual and DOM leakage.

### Decision 3: Tokens become CSS-variable contracts, not vendor theme bridge inputs

The existing semantic tokens remain the source of truth, but they should drive AgentHub components directly through CSS variables and component-level data attributes. There should be no AntD token bridge.

Rationale: token bridges are only useful when the vendor component is the rendering layer. Once AgentHub owns rendering, the bridge is unnecessary and obscures source-of-truth styling.

Alternatives considered:
- Keep the AntD theme bridge during migration. Acceptable only as a temporary compatibility step inside the implementation branch, but final completion requires no AntD runtime dependency.

### Decision 4: Migration is component-by-component with compatibility shims

The implementation should first create the new component module, then migrate feature surfaces in bounded slices. Temporary compatibility exports may keep names such as `AgentHubButton` while changing their implementation, but final code must remove `antd-primitives.tsx`, AntD imports, `.ant-*` selectors, and `agenthub-antd-*` class names.

Rationale: a one-shot rewrite of all UI surfaces is high risk. Compatibility shims let tests and feature components move incrementally while preserving workflows.

Alternatives considered:
- Rename all component imports at once. Rejected unless the patch remains mechanically simple and fully covered by tests.

### Decision 5: Component documentation and tests are part of the deliverable

The change should create a concise component standard document in the repo, plus tests that enforce representative component behavior and prevent direct AntD imports.

Rationale: without a written component contract, the project will drift back into ad hoc styling and wrapper leaks.

Alternatives considered:
- Keep expectations only in OpenSpec. Rejected because implementers need an adjacent engineering reference while editing components.

### Decision 6: Component contracts are defined before broad migration

The implementation should first define a written component contract for each component family before migrating feature surfaces at scale. The standard should live close to the UI package, preferably `packages/ui/COMPONENT_SYSTEM.md`, and act as the day-to-day engineering reference for component use.

Each component contract should include:
- Purpose and when to use it.
- When not to use it.
- Public props and controlled/uncontrolled behavior.
- Supported variants, tones, sizes, density, and loading/disabled/invalid states.
- Required accessible names, ARIA roles, keyboard behavior, and focus behavior.
- Stable AgentHub-owned classes and `data-*` state attributes.
- Theme token usage and forbidden hard-coded visual defaults.
- Localization expectations for labels, placeholders, validation, and option text.
- Representative examples from current workbench surfaces.
- Required unit/render/browser checks.

Rationale: the failed wrapper design came from hiding an external API behind AgentHub names without defining AgentHub's own contract. A contract-first pass prevents the replacement components from becoming generic passthroughs around a different library.

Alternatives considered:
- Define APIs while migrating each screen. Rejected because it spreads design decisions across unrelated product patches.
- Only define high-level tokens and let component APIs evolve freely. Rejected because feature code needs stable interaction contracts for overlays, form controls, and repeated desktop workflows.

### Decision 7: Public names should converge on product-neutral component names

The final component API should prefer product-neutral names such as `Button`, `IconButton`, `TextInput`, `TextArea`, `Select`, `Dialog`, `DropdownMenu`, `Tooltip`, `Tabs`, `Avatar`, `Badge`, `EmptyState`, `LoadingState`, and `Toast`. Temporary aliases such as `AgentHubButton` may exist during migration, but they should not preserve AntD prop passthroughs or remain the long-term canonical API.

Migration mapping:

| Current wrapper | Target component | Notes |
| --- | --- | --- |
| `AgentHubThemeProvider` | `ThemeRoot` | Applies AgentHub CSS variables directly; no AntD `ConfigProvider`. |
| `AgentHubButton` | `Button` | Uses AgentHub `variant`, `tone`, `size`, and `loading` semantics. |
| `AgentHubIconButton` | `IconButton` | Requires `ariaLabel`; uses fixed square sizing. |
| `AgentHubTextInput` | `TextInput` | Native input-backed unless a behavior requirement proves otherwise. |
| `AgentHubSearchInput` | `SearchInput` | Owns clear affordance and search accessible naming. |
| `AgentHubTextArea` | `TextArea` | Preserves composer refs and keyboard behavior without AntD types. |
| `AgentHubSelect` | `Select` | Uses native select or unstyled primitive based on contract decision. |
| `AgentHubCheckbox` | `Checkbox` | Exposes checked/disabled/invalid states through AgentHub attributes. |
| `AgentHubSwitch` | `Switch` | Owns compact settings-row behavior and accessible labels. |
| `AgentHubFormItem` | `FormField` | Owns label, hint, error, required, and layout semantics. |
| `AgentHubTooltip` | `Tooltip` | Behavior primitive allowed; styling and timing are AgentHub-owned. |
| `AgentHubDropdown` | `DropdownMenu` | Behavior primitive allowed; item variants are AgentHub-owned. |
| `AgentHubModal` | `Dialog` | Owns portal root, focus trap, close behavior, and action placement. |
| `AgentHubTabs` | `Tabs` | Owns compact tablist semantics and selected state attributes. |
| `AgentHubBadge` | `Badge` | Uses semantic `tone`; no vendor count bubble defaults. |
| `AgentHubAvatar` | `Avatar` | Owns initials, icon, square/round shape, and fallback behavior. |
| `AgentHubEmptyState` | `EmptyState` | Avoids decorative vendor imagery and oversized empty panels. |
| `AgentHubLoadingState` | `LoadingState` | Owns skeleton/spinner semantics and reduced motion behavior. |
| `agentHubMessage` | `Toast` or `Feedback` | Owns placement, tone, duration, and localization. |

Rationale: long-term API names should describe the component, not the previous migration wrapper. Temporary compatibility is acceptable only to keep patches small.

### Decision 8: The component standard has a review gate

Before broad feature migration starts, the component standard should be reviewed against current workbench needs:
- Composer input, suggestions, and send action.
- Chat Info participant tiles and add-agent dialog.
- Agent list, editor form, template choices, and new-conversation action.
- Connections provider rows and status badges.
- Settings select, switches, and destructive/reset actions.
- Inspector cards, avatars, badges, empty states, and timeline-adjacent controls.

The review should confirm that each current AntD-backed use case maps to a defined AgentHub component or to a documented local exception.

Rationale: the migration has enough affected surfaces that missing component contracts will otherwise appear late as visual regressions.

## Risks / Trade-offs

- AntD removal may reduce built-in behavior for complex controls → use unstyled primitives for dialog/menu/select behavior and add keyboard tests for critical paths.
- Migrating all controls can create visual regressions → migrate by surface, compare rendered snapshots/HTML expectations, and use targeted browser verification for composer, Agents, Settings, and chat info.
- Select and dialog accessibility can regress → define explicit ARIA/focus requirements and prefer proven unstyled primitives where appropriate.
- Temporary compatibility shims can become permanent → tasks require deleting AntD imports, package dependencies, `.ant-*` selectors, and `agenthub-antd-*` class names before completion.
- Tests that assert CSS strings can become brittle → keep existing coverage but add behavior-oriented tests for component states and direct-import guards.

## Migration Plan

1. Add the AgentHub component standard document and first-party component module.
2. Implement core primitives with AgentHub-owned APIs and CSS classes.
3. Replace `AgentHubThemeProvider` with a theme root that applies AgentHub variables without AntD `ConfigProvider`.
4. Migrate composer and timeline-adjacent controls.
5. Migrate chat information dialog and inspector controls.
6. Migrate Agents, Connections, and Settings forms and controls.
7. Remove `antd-primitives.tsx`, AntD imports, AntD dependencies, and AntD-specific CSS.
8. Update tests to assert AgentHub component contracts and run full validation.

Rollback strategy: if a surface fails during migration, keep the previous committed UI behavior until the corresponding first-party component is ready. Do not ship a partial final state with both AntD and the new component system as long-term peers.

## Open Questions

- Should AgentHub use Radix Select/Dialog primitives, native controls, or local implementations for the first implementation pass?
- Should the component standard live in `packages/ui/COMPONENT_SYSTEM.md` or under `docs/`?
- Should the implementation include a small local component gallery/dev route, or rely on unit/render tests for this phase?
