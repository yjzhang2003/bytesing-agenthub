## Why

The Desktop/Web Settings surface currently looks oversized compared with Chat and Agents because it uses page-specific large typography, row heights, spacing, and radius values instead of the shared AgentHub compact workbench scale. This makes Settings feel like a separate product surface even though it should belong to the same developer console.

## What Changes

- Rework Settings visual density so category navigation, group headers, rows, labels, descriptions, and controls use AgentHub typography tokens and compact spacing.
- Align the Settings page with the Chat and Agents desktop shell language: restrained panels, compact rows, consistent icon sizing, and no oversized preference-card treatment.
- Preserve the existing Settings behavior for language, theme, keyboard, workspace, runtime, and permission review controls.
- Add verification that Settings renders consistently in English and Simplified Chinese, including desktop and narrow layouts.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `visual-design-system`: Tighten the Settings visual structure requirement so Settings must follow AgentHub compact typography and density tokens and visually align with Chat and Agents.
- `workbench-mvp-ui`: Extend rendered verification expectations to include the Settings surface in desktop, narrow, and localized states.

## Impact

- Affected code: `packages/ui/src/components/settings.tsx`, `packages/ui/src/styles.ts`, and related UI tests.
- Affected specs: `visual-design-system` and `workbench-mvp-ui`.
- No backend API, persistence, dependency, or data-model changes.
