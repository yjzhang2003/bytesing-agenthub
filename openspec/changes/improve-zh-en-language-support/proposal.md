## Why

AgentHub already supports English and Simplified Chinese in the shared UI and iOS shell, but the contract does not yet make bilingual completeness, runtime consistency, and developer-facing content boundaries strict enough for continued feature growth. As more workbench, agent, connection, and runtime surfaces are added, language support needs to be enforced as a first-class acceptance criterion instead of a best-effort translation pass.

## What Changes

- Strengthen English and Simplified Chinese coverage expectations across Desktop/Web, iOS, settings, workbench navigation, agent management, connection setup, permission, diff, runtime, collaboration, empty/loading/error, toast, and accessibility-label surfaces.
- Require every product-owned string to use a typed translation key or native localization entry, with English as the canonical fallback and Simplified Chinese parity verified before release.
- Define language normalization for aliases and unsupported values so clients consistently resolve `en`, `en-US`, `zh`, `zh-CN`, and invalid persisted values.
- Preserve user-authored, agent-authored, workspace, command, path, provider, code, diff, and artifact content in its source language while localizing surrounding product chrome.
- Add explicit verification requirements for translation-key coverage, representative render coverage, fallback behavior, and newly introduced product strings.
- No breaking API changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `localized-product-experience`: Clarify bilingual language normalization, complete product chrome coverage, content-preservation boundaries, and automated coverage gates for English and Simplified Chinese.
- `component-behavior-verification`: Extend component verification expectations so shared primitives and product surfaces prove localized accessible labels, errors, loading states, and toasts in both supported languages.

## Impact

- Affected shared UI: `packages/ui/src/i18n.tsx`, workbench components, settings, navigation, composer, inspector, agents, connections, primitives, feedback/toast, and UI tests.
- Affected iOS UI: `apps/ios/AgentHub/AgentHubLocalization.swift` and localized native screens that read `AgentHubStrings`.
- Affected contracts: any locale-bearing client state or settings fields should normalize language values before rendering.
- Affected tests: localization catalog completeness, representative English and Simplified Chinese renders, unsupported-locale fallback, and preservation of user/agent/technical content.
