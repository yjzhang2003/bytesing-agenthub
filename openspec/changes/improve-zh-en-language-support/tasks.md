## 1. Locale Normalization

- [x] 1.1 Audit shared UI and iOS locale normalization paths for props, persisted settings, local storage, and runtime configuration.
- [x] 1.2 Update shared UI normalization so `en`, `en-US`, `zh`, and `zh-CN` resolve deterministically and unsupported values fall back to English.
- [x] 1.3 Update iOS locale normalization to match shared UI behavior and keep Settings usable after malformed persisted values.
- [x] 1.4 Add tests for supported aliases, invalid values, persisted preference writes, and startup rendering in both supported languages.

## 2. Product Chrome Coverage

- [x] 2.1 Audit `packages/ui/src` for product-owned visible text, placeholders, aria labels, tooltips, toasts, empty/loading/error states, and validation messages that bypass localization.
- [x] 2.2 Add missing English and Simplified Chinese translation keys for shared UI workbench, settings, navigation, composer, timeline, inspector, agents, connections, permissions, diffs, runtime, collaboration, and feedback surfaces.
- [x] 2.3 Audit `apps/ios/AgentHub` screens for product-owned strings outside `AgentHubStrings`.
- [x] 2.4 Add missing English and Simplified Chinese native strings for iOS navigation, settings, conversations, plans, permissions, diffs, and workspace screens.
- [x] 2.5 Verify user, agent, workspace, provider, command, path, code, diff, and artifact values remain source content and are not passed through translation catalogs.

## 3. Component Verification

- [x] 3.1 Extend shared component behavior tests for localized Switch, Select, SearchInput, TextArea, validation, disabled, and helper-text states.
- [x] 3.2 Extend feedback tests for localized Toast, LoadingState, empty-state, error-state, live-region, and dismiss-control text.
- [x] 3.3 Extend overlay tests for localized Dialog, DropdownMenu, Tooltip, accessible names, focus behavior, Escape handling, and focus return behavior.
- [x] 3.4 Add assertions that component behavior is unchanged between English and Simplified Chinese renders.

## 4. Catalog Governance

- [x] 4.1 Strengthen localization catalog tests so every required translation key has English and Simplified Chinese values.
- [x] 4.2 Add representative shared UI render tests for English and Simplified Chinese settings, navigation, composer, inspector, agents, connections, permissions, diffs, runtime states, empty states, loading states, error states, and feedback messages.
- [x] 4.3 Add native iOS verification for representative English and Simplified Chinese surfaces.
- [x] 4.4 Add source-content preservation tests covering user messages, agent output, commands, paths, URLs, provider names, workspace metadata, code snippets, diffs, and markdown artifacts under Simplified Chinese.

## 5. Validation

- [x] 5.1 Run shared UI unit and component behavior tests.
- [x] 5.2 Run relevant iOS build or test verification for localized screens.
- [x] 5.3 Run OpenSpec validation/status for `improve-zh-en-language-support`.
