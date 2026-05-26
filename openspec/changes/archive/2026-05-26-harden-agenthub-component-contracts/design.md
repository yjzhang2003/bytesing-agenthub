## Context

The AntD removal change replaced the styled vendor dependency with an AgentHub-owned component layer and a written component standard. That first pass deliberately kept compatibility aliases so existing workbench surfaces could move without a broad product rewrite.

The remaining risk is that `system.tsx` can be mistaken for a complete component system while some behavior-heavy components are still shallow implementations. Code review identified the highest-risk gaps: modal isolation is not app-wide, canonical APIs are incomplete, ThemeRoot does not carry component styling outside the workbench shell, guardrails miss forbidden class string usage, and tests are mostly static markup checks.

This change hardens the component system after the dependency removal, with emphasis on behavior, accessibility, and verification.

## Goals / Non-Goals

**Goals:**
- Make canonical component APIs match `packages/ui/COMPONENT_SYSTEM.md` for the exported component system.
- Keep existing workbench behavior working through compatibility aliases while moving feature code toward canonical names and props where practical.
- Implement production-ready behavior for the current behavior-heavy components that are exported publicly or used by workbench surfaces.
- Make `ThemeRoot` sufficient for isolated component rendering, including CSS variables and component CSS.
- Strengthen guardrails so forbidden vendor imports, dependencies, lockfile entries, resolved graph entries, CSS selectors, and class-name strings are detected.
- Add behavior tests for keyboard navigation, focus trapping/return, overlay close behavior, clear affordances, live feedback, and isolated ThemeRoot rendering.

**Non-Goals:**
- Redesign the workbench visual language.
- Add a public external component package separate from `@agenthub/ui`.
- Replace React, Lucide, Motion, Marked, or existing Radix behavior-only primitives.
- Reopen AntD compatibility or introduce another styled component framework.
- Implement a full design-system documentation site in this change.

## Decisions

### Decision 1: Use behavior primitives for overlays and tooltips

Dialog, DropdownMenu, and Tooltip should use unstyled behavior primitives where they reduce accessibility risk. Radix is acceptable for these controls because the component standard already allows behavior primitives when styling, class names, tokens, and public APIs remain AgentHub-owned.

Rationale: focus trapping, background isolation, roving menu focus, Escape handling, and tooltip timing are easy to get subtly wrong in local code. The previous local modal proved this risk.

Alternatives considered:
- Continue hardening the local implementations. Rejected for Dialog and DropdownMenu because robust focus and menu behavior will duplicate well-tested primitives.
- Drop behavior-heavy exports. Rejected because Chat Info already needs Dialog and the system standard documents these controls.

### Decision 2: Canonical APIs are primary, compatibility aliases are temporary

The exported canonical names (`Button`, `Dialog`, `Tabs`, `Select`, `Switch`, etc.) should expose the documented props. Compatibility aliases (`AgentHubButton`, `AgentHubModal`, etc.) may remain for existing feature code, but they should adapt old prop shapes to canonical components instead of defining the real API.

Rationale: the previous wrapper failure came from allowing compatibility prop shapes to become the system contract.

Alternatives considered:
- Rename every feature import in one patch. Rejected unless it stays mechanical; this change should prioritize behavior hardening over broad churn.
- Keep compatibility props indefinitely. Rejected because it preserves the wrapper mindset.

### Decision 3: Split component CSS from workbench layout CSS

Component CSS should be usable when `ThemeRoot` renders outside `AgentHubWorkbench`. Workbench layout CSS can remain in `workbenchCss`, but component-level selectors for Button, inputs, Select, Switch, Dialog, Tabs, Avatar, Badge, Toast, LoadingState, and similar controls should be exported or injected through the component system.

Rationale: `ThemeRoot` cannot be the component-system root if its children lack component styles outside the full workbench shell.

Alternatives considered:
- Require every consumer to render `AgentHubWorkbench`. Rejected because component tests and future isolated surfaces need the component system independently.
- Duplicate CSS in tests. Rejected because that hides production integration issues.

### Decision 4: Guardrail tests include intentional failure fixtures

The vendor-boundary guard should be tested against temporary fixture files containing forbidden imports, dependency names, selectors, and class strings. The script should support fixture roots or targeted inputs so negative cases can run without polluting production source.

Rationale: a passing scan alone does not prove the guard catches regressions.

Alternatives considered:
- Rely on `rg` in final verification. Rejected because guardrails should be automated and precise.

### Decision 5: Behavior verification uses a DOM-capable test setup

Static `renderToStaticMarkup` remains useful for SSR/class contracts, but focus, keyboard, live regions, and clear affordances need DOM tests. Use the existing test stack where possible and introduce the smallest reasonable DOM test setup if current Vitest configuration is not enough.

Rationale: the remaining risks are runtime interaction defects, not static markup defects.

Alternatives considered:
- Browser-only manual checks. Rejected because these regressions need repeatable tests.

## Risks / Trade-offs

- Introducing additional Radix packages may increase dependency surface → keep dependencies limited to behavior primitives and verify no styled vendor framework is introduced.
- Changing public APIs may break existing internal imports → keep compatibility aliases and migrate feature code incrementally.
- Focus/inert behavior can vary across environments → test both component-level DOM behavior and representative workbench rendering.
- Splitting CSS can cause selector ordering regressions → preserve current visual output and add rendered checks for current workbench surfaces.
- Guardrail fixture support could become too complex → keep fixtures local to tests and keep the production script simple.

## Migration Plan

1. Add or enable behavior primitives for Dialog, DropdownMenu, Tooltip, and any other behavior-heavy controls selected for this pass.
2. Refactor `system.tsx` so canonical components own the real implementation and compatibility aliases adapt legacy props.
3. Split or export component CSS so `ThemeRoot` can render styled components outside `AgentHubWorkbench`.
4. Implement Dialog app-level overlay isolation, focus trap, focus return, Escape handling, labels, descriptions, custom footers, and initial focus.
5. Implement DropdownMenu, Tooltip, Tabs, SearchInput, Toast, and LoadingState behavior to match the component standard.
6. Strengthen guardrails and add intentional failure tests.
7. Add DOM behavior tests and representative workbench tests.
8. Run `pnpm check`, `pnpm check:ui-boundaries`, `git diff --check`, and `openspec validate harden-agenthub-component-contracts --strict`.

Rollback strategy: preserve the prior committed AntD-free component layer as the fallback. If a behavior primitive introduces regressions, revert only that component to the local implementation while keeping canonical APIs and tests.

## Open Questions

- Should Dialog, DropdownMenu, and Tooltip all use Radix in this pass, or should native/simple controls remain for low-risk cases?
- Should Toast be implemented as a mounted provider inside `ThemeRoot`, or as an event bridge consumed by `AgentHubWorkbench` first?
- Should the compatibility aliases be removed in this change or only marked as deprecated after feature code moves to canonical imports?
