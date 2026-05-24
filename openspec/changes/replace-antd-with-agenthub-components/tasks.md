## 1. Component Standard And Guardrails

- [x] 1.1 Add `packages/ui/COMPONENT_SYSTEM.md` as the AgentHub component standard and make it the implementation reference for this change.
- [x] 1.2 Define component principles: AgentHub-owned visual language, no styled vendor component framework, no third-party prop passthroughs, no feature-level dependency on vendor DOM classes, compact desktop-workbench density, and localized accessible UI.
- [x] 1.3 Define semantic token usage for light/dark themes, surfaces, text, borders, focus, selection, disabled, danger, warning, success, loading, and overlay elevation.
- [x] 1.4 Define shared API conventions for `variant`, `tone`, `size`, `density`, `disabled`, `loading`, `invalid`, `ariaLabel`, `className`, controlled values, and `data-*` state attributes.
- [x] 1.5 Define component contracts for `ThemeRoot`, `Button`, `IconButton`, `TextInput`, `SearchInput`, `TextArea`, `Select`, `Checkbox`, `Switch`, `FormField`, `Tooltip`, `DropdownMenu`, `Dialog`, `Tabs`, `Badge`, `Avatar`, `EmptyState`, `LoadingState`, and `Toast`/feedback.
- [x] 1.6 For each component contract, document purpose, non-use cases, props, variants, states, keyboard behavior, ARIA requirements, focus behavior, token usage, class/state attributes, localization expectations, examples, and required tests.
- [x] 1.7 Decide and document which unstyled behavior primitives remain allowed for dialog, select, menu, tooltip, scroll area, separator, and visually-hidden behavior.
- [x] 1.8 Define the final public component API names and temporary migration aliases so feature code can move without preserving AntD prop passthroughs.
- [x] 1.9 Add a migration mapping from existing `AgentHub*` wrappers and `agentHubMessage` to final AgentHub component names.
- [x] 1.10 Add source/dependency guardrails that fail or clearly flag direct imports from `antd`, `@ant-design/icons`, `@ant-design/x`, AntD subpaths, `.ant-*` selector dependencies, and `agenthub-antd-*` classes.
- [x] 1.11 Review the component standard against current Composer, Chat Info, Agents, Connections, Settings, and Inspector use cases before broad feature migration starts.

## 2. First-Party Component Foundation

- [x] 2.1 Create the AgentHub component module that replaces `components/antd-primitives.tsx` with first-party implementations for theme root, button, icon button, text input, text area, select, checkbox, switch, form field, tooltip, dropdown, dialog, tabs, badge, avatar, empty state, loading state, and feedback message.
- [x] 2.2 Implement component styling with AgentHub-owned classes, CSS variables, `data-*` state attributes, compact density, focus states, disabled states, dark/light theme support, and localized accessible labels.
- [x] 2.3 Implement dialog and overlay behavior so overlays inherit AgentHub theme context and return focus to a safe initiating element.
- [x] 2.4 Add component-level tests for variants, disabled/focused/invalid/loading states, overlay behavior, keyboard interaction, theme switching, and Chinese/English labels.

## 3. Workbench Surface Migration

- [x] 3.1 Migrate composer controls away from AntD text area/button dependencies while preserving mention suggestions, slash commands, target synchronization, prompt state, Enter-to-send, and runtime-disabled behavior.
- [x] 3.2 Migrate Chat Info participant management and add-agent dialog to AgentHub-owned components without vendor color, portal, focus, or density leakage.
- [x] 3.3 Migrate Context Inspector actions, cards, badges, avatars, empty/loading states, and timeline-adjacent controls to first-party components.
- [x] 3.4 Migrate Agents list/detail/create/edit surfaces to first-party components while preserving create, update, archive, template defaults, advanced disclosure, validation, and new-conversation workflows.
- [x] 3.5 Migrate Connections and Settings surfaces to first-party components while preserving refresh behavior, provider/memory status display, language settings, keyboard settings, and theme switching.

## 4. Dependency And CSS Removal

- [x] 4.1 Remove `antd`, `@ant-design/icons`, and `@ant-design/x` from `packages/ui/package.json` and update the lockfile.
- [x] 4.2 Remove `components/antd-primitives.tsx` or convert any remaining compatibility file so it no longer imports AntD and no longer exposes AntD prop passthroughs.
- [x] 4.3 Remove all AntD-specific CSS selectors, including `.ant-*`, `.agenthub-antd-*`, AntD focused/open selector patches, and AntD modal/button/select overrides.
- [x] 4.4 Update public exports from `packages/ui/src/index.tsx` to expose AgentHub-owned component APIs and remove AntD-specific types.

## 5. OpenSpec And Verification

- [x] 5.1 Update tests that currently assert AntD wrapper class names so they assert AgentHub component contracts and workflows instead.
- [x] 5.2 Verify representative UI flows in rendered tests: online workbench, composer, chat info add-agent dialog, Agents editor, Connections status, Settings preferences, narrow layout, Simplified Chinese rendering, and dark/light theme switching.
- [x] 5.3 Run source/dependency scans proving AntD imports, AntD packages, `.ant-*` selectors, and `agenthub-antd-*` classes are gone.
- [x] 5.4 Run `pnpm check`, `git diff --check`, and `openspec validate replace-antd-with-agenthub-components --strict`.
- [x] 5.5 Review resulting UI for design-language consistency and record any intentionally deferred component gaps.
