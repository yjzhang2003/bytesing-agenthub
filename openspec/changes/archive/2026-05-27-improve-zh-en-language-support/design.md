## Context

AgentHub already has shared TypeScript localization helpers in `packages/ui/src/i18n.tsx` and native iOS localization support in `apps/ios/AgentHub/AgentHubLocalization.swift`. Existing tests verify some English fallback and Simplified Chinese rendering, but new feature work can still introduce product-owned strings outside the catalogs, skip accessible-label localization, or blur the boundary between product chrome and user/agent/technical content.

This change tightens the bilingual contract for English and Simplified Chinese without introducing a new translation service or changing persisted data models.

## Goals / Non-Goals

**Goals:**

- Make `en-US` and `zh-CN` the supported rendering locales, with deterministic normalization from common aliases and invalid values.
- Keep English as the canonical fallback while requiring Simplified Chinese parity for product-owned UI strings.
- Ensure Desktop/Web and iOS use localized product chrome consistently across settings, navigation, workbench, agents, connections, permissions, diffs, runtime, collaboration, empty/loading/error, toast, and accessibility surfaces.
- Preserve user-authored, agent-authored, workspace, provider, command, path, code, diff, and artifact content exactly as source content.
- Add verification gates that fail when product strings bypass localization or when supported-language catalogs drift.

**Non-Goals:**

- Add machine translation, dynamic remote catalogs, or runtime translation of conversation content.
- Add new supported languages beyond English and Simplified Chinese.
- Migrate Control Plane records or rewrite historical conversation content.

## Decisions

1. Use typed/static catalogs for shared UI strings.

   Keep the existing TypeScript catalog model and require new product-owned strings to enter through typed translation keys. This keeps missing-key checks deterministic in unit tests and avoids a runtime dependency for a two-language product surface. A remote translation service was considered, but it would add availability, caching, and review complexity without solving the current completeness problem.

2. Keep native iOS strings in `AgentHubStrings`.

   iOS screens should continue using the native locale enum and `AgentHubStrings` facade so SwiftUI views render localized labels without coupling to the web catalog implementation. Sharing a generated JSON catalog was considered, but the current native surface is small enough that direct Swift coverage is simpler and easier to test.

3. Normalize language values at the rendering boundary.

   Clients should normalize persisted or incoming values before rendering. `en`, `en-US`, `zh`, and `zh-CN` resolve to supported locales; unsupported or malformed values fall back to English and keep Settings usable. This avoids schema migrations while making behavior consistent across clients.

4. Treat product chrome and source content as separate domains.

   Product-owned labels, actions, status text, toasts, helper text, validation messages, empty states, loading states, and accessibility labels are localized. User messages, agent output, file paths, commands, provider names, workspace metadata, markdown artifacts, code, diffs, and persisted display names are preserved.

5. Verify coverage as a release gate.

   Tests should assert catalog key parity, representative English and Simplified Chinese renders, fallback behavior, and localized accessible labels for shared components. Feature tests that add product strings should fail if the Chinese catalog is missing parity or if raw strings bypass the localization layer.

## Risks / Trade-offs

- Missing product strings can still appear if tests do not cover a rarely used branch -> add catalog parity tests and representative render tests for empty, loading, error, and disabled states.
- English fallback can hide missing Simplified Chinese during manual testing -> make catalog parity a failing automated check rather than relying on visual review.
- Native and shared UI catalogs can drift in terminology -> document canonical terminology in tests and keep iOS assertions aligned with shared UI wording for common concepts such as language, settings, permissions, agents, and connections.
- Over-localizing source content would damage technical workflows -> keep preservation requirements explicit and include examples in tests for paths, commands, provider names, and agent/user message bodies.
