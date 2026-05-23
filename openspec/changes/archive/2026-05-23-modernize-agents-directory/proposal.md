## Why

The current Agents page exposes low-level role configuration as the default experience, which makes routine agent browsing and creation feel too technical and visually heavy. The page also has a malformed search field because the Agents sidebar wraps an Ant Design search input inside the chat search container instead of sharing the same search field structure.

## What Changes

- Replace the Agents detail default with a modern contact-style configuration surface focused on readable agent identity, role, responsibilities, and capabilities.
- Keep a single primary save action for agent configuration changes; remove the prominent right-side "New agent" action from the detail header.
- Make agent creation template-assisted inside one creation interface instead of sending users to a separate template selection page.
- Move advanced fields such as raw system prompt and policy JSON behind a collapsed advanced configuration section by default.
- Introduce a shared search field implementation for chat and Agents sidebars so both render consistently and avoid nested input styling conflicts.
- Preserve existing create, update, selection, localization, and runtime-independent agent management behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `conversation-workbench`: Agents center view behavior changes from a raw editor-first page to a contact-style configuration and template-assisted creation flow while preserving the existing side-list/detail model.
- `visual-design-system`: Search field reuse, compact form hierarchy, default-collapsed advanced configuration, and single-primary-action placement become visual system requirements for the Agents surface.
- `workbench-mvp-ui`: Desktop/Web MVP verification must cover the modernized Agents page, shared search field rendering, template-assisted creation, advanced configuration collapsed state, and localized labels.

## Impact

- Affected code: `packages/ui/src/components/agents.tsx`, `packages/ui/src/components/navigation.tsx`, shared primitives in `packages/ui/src/components/antd-primitives.tsx` or `packages/ui/src/components/primitives.tsx`, `packages/ui/src/styles.ts`, `packages/ui/src/i18n.tsx`, and UI component tests.
- APIs: No backend or contract API changes are expected.
- Dependencies: No new runtime dependency is required.
- Verification: React static-render tests and browser visual checks should cover English and Simplified Chinese Agents states, including search, existing-agent details, creation, and advanced configuration.
