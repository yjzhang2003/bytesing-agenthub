## Why

AgentHub currently has only partial component-level Chinese rendering, so users cannot reliably choose Chinese in Settings or expect the whole product experience to stay localized across Desktop, Web, and iOS. A complete language capability is needed now because the app already has shared UI surfaces and settings flows where language should be a first-class user preference rather than an implementation prop.

## What Changes

- Add a product-level Simplified Chinese localization capability for Desktop, Web, and iOS user-facing chrome.
- Add a language preference in Settings with English and Simplified Chinese options.
- Persist the selected language per client and apply it at startup before the main workbench renders.
- Localize shared workbench chrome, navigation, settings, composer affordances, loading/error/empty states, inspector actions, cards, and common accessibility labels.
- Keep system-originated content, user messages, agent messages, commands, file paths, provider names, code snippets, URLs, and model output in their source language.
- Add translation coverage checks and rendered tests so new user-facing strings cannot silently bypass localization.
- No breaking changes to Control Plane APIs or persisted workspace data.

## Capabilities

### New Capabilities
- `localized-product-experience`: Defines language selection, persistence, localized UI coverage, and fallback behavior across AgentHub clients.

### Modified Capabilities
- `workbench-mvp-ui`: Workbench shell, navigation, composer, timeline, inspector, and state surfaces must render through the selected product language.
- `visual-design-system`: Text, accessibility labels, layout density, and responsive behavior must remain safe for English and Simplified Chinese strings.
- `ios-mobile-experience`: Native iOS settings and mobile surfaces must expose and apply the same language preference using native SwiftUI patterns.

## Impact

- Affected code: `packages/ui`, `apps/web`, `apps/desktop`, and `apps/ios/AgentHub`.
- Affected tests: shared UI SSR tests, web app state/rendering tests, iOS SwiftUI snapshot or view-model tests where available, and localization coverage checks.
- New or expanded implementation surface: translation catalogs, locale context/provider, Settings language control, persisted preference loading, iOS localized strings, and developer guardrails for untranslated UI strings.
- No new backend storage is required for the MVP; preference may remain local to each installed client unless account sync later adds cross-device settings.
