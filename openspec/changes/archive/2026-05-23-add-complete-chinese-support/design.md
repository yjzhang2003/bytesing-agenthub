## Context

AgentHub is a monorepo with shared React UI in `packages/ui`, Web/Electron entry points, and a native SwiftUI iOS client. A first pass added a component-level `locale` prop and partial Simplified Chinese strings in shared UI, but language is not yet a product preference, Settings has no language control, and many user-facing strings still live inline across React and SwiftUI components.

The complete solution is cross-cutting because language affects application startup, settings persistence, shared UI components, native iOS views, accessibility labels, tests, and future development guardrails. The Control Plane should not need to store or translate UI text for this MVP; generated/user/system content remains content, not product chrome.

## Goals / Non-Goals

**Goals:**
- Provide English and Simplified Chinese as supported product UI languages.
- Let users select language from Settings and keep that choice after restart or reload.
- Apply language consistently to Desktop/Web shared UI and native iOS surfaces.
- Keep user messages, agent output, commands, file paths, provider names, code, URLs, and persisted domain data in their original language.
- Add coverage that makes untranslated product chrome visible during implementation and future review.
- Preserve compact workbench density, accessibility, keyboard labels, and responsive safety in both languages.

**Non-Goals:**
- Machine-translating conversations, agent output, markdown artifacts, code diffs, commands, or user-authored content.
- Adding account-synced language preferences or Control Plane schema changes in this change.
- Supporting locale-specific date/time/number formatting beyond labels needed for the current UI.
- Adding additional languages beyond English and Simplified Chinese.

## Decisions

### Use a shared typed locale catalog for Desktop/Web

Desktop/Web shared UI will use a typed locale catalog owned by `packages/ui`, exposed through an `AgentHubI18nProvider`, `AgentHubLocale`, and a translation helper. Components will consume translation keys instead of inline user-facing strings.

Alternatives considered:
- External i18n library: more complete, but adds dependency weight and setup complexity before the app needs plural rules, extraction pipelines, or remote translation workflows.
- Ad hoc `locale === "zh-CN"` checks in components: fast initially, but difficult to audit and likely to regress.

### Store the client language preference locally for MVP

Desktop/Web will persist language in `localStorage` using an AgentHub-owned key and initialize the workbench from that value before rendering primary chrome. iOS will persist the same logical preference through native app storage (`AppStorage` or equivalent).

Alternatives considered:
- Store on the Control Plane/account: useful later for cross-device sync, but unnecessary for MVP and would create backend migration work.
- Browser/system language auto-switch only: useful as a default, but insufficient because users need an explicit Settings choice.

### Keep content and product chrome separate

Translation applies to product-owned UI chrome: navigation, settings, empty/loading/error states, composer affordances, cards, inspector labels, buttons, accessible labels, and tooltips. Translation does not apply to conversation messages, agent/model output, command text, file paths, provider names, artifact summaries, markdown content, URLs, or code snippets.

Alternatives considered:
- Translate all visible text: misleading for technical artifacts and could corrupt commands, diffs, or model output.
- Translate only Settings and navigation: leaves core workbench interactions partially English and fails the “complete support” goal.

### Add coverage checks at component boundaries first

The initial guardrail will be rendered tests that verify Chinese output for primary workbench surfaces plus focused checks for catalog fallback behavior. As implementation matures, lint or test helpers can flag direct product string literals in shared UI components.

Alternatives considered:
- Rely on manual QA screenshots only: catches visual issues but not coverage drift.
- Full extraction tooling immediately: heavier than the current codebase needs and likely to slow the MVP.

### Use native iOS localization patterns

iOS will expose the same language options and translate native SwiftUI UI strings through a native catalog or typed string table, while keeping product terminology aligned with the shared Desktop/Web catalog.

Alternatives considered:
- Embed the Web UI for localized screens: conflicts with the existing native iOS experience requirement.
- Share the TypeScript catalog directly with Swift: possible later, but unnecessary unless translation volume grows.

## Risks / Trade-offs

- Incomplete catalog coverage -> Add rendered tests for key surfaces and a follow-up audit task for direct product string literals.
- Chinese strings may be longer than English in compact controls -> Verify narrow, standard, and wide layouts and constrain labels with existing text safety rules.
- Duplicate terminology between React and SwiftUI -> Maintain a terminology section or shared source list in tasks and tests for key labels such as Workspace, Runtime, Permissions, and Settings.
- Local-only preference may differ by device -> Accept for MVP and leave account-synced preference to a future account-sync change.
- Dynamic status strings and counts can be grammatically awkward -> Keep initial templates simple and explicit; avoid complex pluralization until more languages are added.

## Migration Plan

1. Expand the shared Desktop/Web catalog and replace inline product chrome strings with translation keys.
2. Add language selection to Settings and persist it locally.
3. Initialize Web/Electron with the persisted language before rendering workbench chrome.
4. Add iOS language preference and native localized strings for existing SwiftUI screens.
5. Add tests for English default behavior, Simplified Chinese rendering, persistence, fallback, and narrow layout text safety.
6. Rollback by defaulting to English and hiding the Settings language control if a blocking issue appears; no backend data migration is required.

## Open Questions

- Should the default language follow the OS/browser language when no preference exists, or always default to English until the user chooses Chinese?
- Should Desktop/Web and iOS use exactly the same storage key semantics to ease a future account-sync migration?
- Which terminology should remain as product names in English, such as AgentHub, Claude Code, Codex, and Control Plane?
