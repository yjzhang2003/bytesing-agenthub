## 1. Desktop/Web Locale Foundation

- [x] 1.1 Expand the shared `packages/ui` locale catalog to cover English and Simplified Chinese for all product-owned workbench chrome.
- [x] 1.2 Define a stable `AgentHubLocale` type, supported-locale list, fallback helper, and interpolation behavior for dynamic labels and counts.
- [x] 1.3 Replace inline product-owned strings in shared UI primitives, cards, timeline, navigation, workbench shell, composer, inspector, settings, agents, and connections surfaces with translation keys.
- [x] 1.4 Preserve source text for user messages, agent/model output, markdown artifacts, commands, file paths, URLs, provider names, code snippets, and other technical values.

## 2. Language Preference UX

- [x] 2.1 Add a Settings language preference with English and Simplified Chinese options using existing AgentHub/Ant Design-backed controls.
- [x] 2.2 Persist the Desktop/Web language preference in local client storage with validation for unsupported stored values.
- [x] 2.3 Initialize Web and Electron workbench rendering from the persisted language before primary app chrome appears.
- [x] 2.4 Ensure language changes update the visible workbench without losing active workspace, conversation, inspector, theme, or composer state.

## 3. Desktop/Web Verification

- [x] 3.1 Add shared UI tests for English default rendering and Simplified Chinese rendering across workbench shell, navigation, Settings, composer, inspector, cards, loading, error, and empty states.
- [x] 3.2 Add tests for language persistence, unsupported-locale fallback, and missing-key fallback behavior.
- [x] 3.3 Add narrow/mobile-web rendered coverage proving Simplified Chinese labels do not overlap or break fixed workbench controls.
- [x] 3.4 Add a lightweight coverage guard or audit test that flags untranslated product chrome strings in shared UI components.

## 4. iOS Localization

- [x] 4.1 Add native iOS language preference state and persistence using SwiftUI-native app storage patterns.
- [x] 4.2 Add English and Simplified Chinese localized strings for workspace, conversation, runtime, settings, plan, permission, diff, and offline surfaces.
- [x] 4.3 Update iOS SwiftUI views to read localized product labels while preserving message bodies, commands, paths, and technical content.
- [x] 4.4 Add iOS view-model, unit, preview, or snapshot verification for English and Simplified Chinese core surfaces where the project test setup supports it.

## 5. Quality Gate

- [x] 5.1 Run formatting for touched TypeScript, TSX, and Swift files.
- [x] 5.2 Run `pnpm --filter @agenthub/ui typecheck` and targeted shared UI tests.
- [x] 5.3 Run the full repository verification command `pnpm check`.
- [x] 5.4 Document any remaining localization gaps, especially terminology intentionally kept in English such as AgentHub, Claude Code, Codex, and Control Plane.

## Notes

- Intentionally preserved source/technical content includes user and agent messages, markdown artifacts, commands, file paths, URLs, provider names, code snippets, and brand or platform terms such as AgentHub, Claude Code, Codex, and Control Plane.
- iOS verification uses Swift typechecking for the current SwiftUI source layout because this repository does not include a separate iOS test target.
