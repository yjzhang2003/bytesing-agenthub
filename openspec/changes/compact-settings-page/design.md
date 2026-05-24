## Context

Desktop/Web already has a compact AgentHub typography scale in the component system: `--agenthub-type-xs`, `--agenthub-type-sm`, `--agenthub-type-md`, `--agenthub-type-lg`, and `--agenthub-type-title`. The Settings page diverges from that scale by using page-local sizes such as 20px navigation labels, 22px group headings, 19px row titles, large row heights, and a larger group radius. Chat and Agents use the same shell, tokenized typography, compact rows, and restrained panel treatment, so Settings currently feels visually disconnected.

The change is UI-only. It must preserve existing Settings controls, localization, callbacks, theme switching, permission review routing, workspace/runtime metadata, and responsive behavior.

## Goals / Non-Goals

**Goals:**

- Make Settings follow AgentHub typography tokens instead of page-specific large font sizes.
- Reduce Settings category, group, and row density so it matches the compact Chat and Agents workbench feel.
- Keep Settings readable in English and Simplified Chinese without text overlap.
- Preserve all existing Settings behavior and data flow.
- Add rendered or component-level verification for Settings desktop, narrow, and localized states.

**Non-Goals:**

- Redesign Settings information architecture or add new settings categories.
- Change persisted preferences, runtime APIs, workspace data, or permission data.
- Replace AgentHub components or introduce new UI dependencies.
- Rework Chat or Agents beyond comparison-driven test coverage if needed.

## Decisions

### Decision 1: Treat Settings as a workbench detail surface

Settings should keep the category navigation plus grouped preference rows, but the visual scale should match the existing workbench instead of adopting a standalone operating-system preferences scale.

Rationale: Settings is reached from the same AgentHub shell as Chat and Agents. The user should not experience a sudden jump in text scale or spacing when switching views.

Alternative considered: keep the larger Settings visual style and only shrink controls. Rejected because the mismatch comes mainly from navigation labels, headings, row titles, row heights, padding, and radius.

### Decision 2: Use existing typography tokens first

Settings headings, row titles, descriptions, category labels, and controls should use `--agenthub-type-*` tokens. Page-local pixel font sizes should be removed unless they are already part of the shared component-system scale.

Rationale: the component system already defines the product typography scale; duplicating sizes in page CSS makes Settings drift from Chat and Agents again.

Alternative considered: create Settings-specific CSS variables. Rejected for this pass because there is no need for a separate Settings scale.

### Decision 3: Normalize spacing and radius with nearby surfaces

Settings groups may remain visually grouped, but their radius, padding, header height, row height, icon size, and gaps should be compact enough to scan like Agents configuration sections and workbench rows.

Rationale: the current 18px group radius, 78px group headers, 76px rows, 44px outer padding, and 28px icons make the page feel inflated.

Alternative considered: remove groups entirely. Rejected because grouped preference rows are already specified and are useful for scanning related settings.

## Risks / Trade-offs

- Shrinking Settings too far could make controls feel cramped -> Compare Settings against Chat and Agents screenshots and keep row controls readable.
- Chinese labels can be longer than English labels -> Verify Simplified Chinese Settings rendering in desktop and narrow layouts.
- Reducing row heights could affect touch usability on narrow web layouts -> Preserve accessible control hit areas and allow rows to wrap when necessary.
- Tokenizing typography could expose older hard-coded Settings styles -> Add tests or style assertions that cover Settings font-size usage and rendered structure.

## Migration Plan

1. Audit Settings CSS for page-local typography, spacing, row height, radius, and icon sizes that exceed the component-system scale.
2. Replace oversized Settings typography with AgentHub `--agenthub-type-*` tokens.
3. Compact Settings sidebar items, group headers, rows, padding, radius, gaps, and control sizing while preserving layout structure.
4. Verify English and Simplified Chinese Settings rendering at desktop and narrow widths.
5. Update tests to cover Settings compact visual structure and existing behavior.

Rollback strategy: revert only the Settings CSS and tests if visual regressions appear; no data migration or API rollback is required.

## Open Questions

- Should Settings category navigation remain a left sidebar at all desktop widths, or should the narrow horizontal strip threshold move earlier after compaction?
