## 1. Locale Behavior

- [x] 1.1 Add a public-page locale resolver for unauthenticated web routes that uses persisted supported locale values when present.
- [x] 1.2 Make the hosted unauthenticated homepage default to Simplified Chinese when no supported persisted locale exists.
- [x] 1.3 Pass the resolved public locale into the public homepage and login surfaces without changing authenticated workbench locale behavior.

## 2. Homepage Copy

- [x] 2.1 Shorten Simplified Chinese homepage hero, navigation, call-to-action, feature, evidence, and footer copy while preserving AgentHub product meaning.
- [x] 2.2 Replace remaining translatable English labels in the Simplified Chinese homepage catalog where they are product chrome rather than source identifiers.
- [x] 2.3 Keep English homepage copy supported and concise enough to fit the existing responsive layout.

## 3. Motion Background

- [x] 3.1 Add a scoped CSS-only animated background treatment to the public homepage shell or hero.
- [x] 3.2 Ensure the animation remains behind content, low contrast, and consistent with AgentHub light-first restrained styling.
- [x] 3.3 Add `prefers-reduced-motion: reduce` handling that disables or freezes decorative homepage motion.

## 4. Product Evidence and Layout

- [x] 4.1 Preserve the homepage product evidence panel with AgentHub-relevant concepts such as workspace, agents, runtime, permissions, and artifacts.
- [x] 4.2 Verify Chinese and English homepage layouts at desktop and mobile widths for clipping, overlap, horizontal scrolling, and sign-in usability.
- [x] 4.3 Ensure shortened copy and motion changes do not affect authenticated workbench routing or login/callback behavior.

## 5. Tests and Validation

- [x] 5.1 Add or update web routing/localization tests for the Simplified Chinese default homepage and supported English override.
- [x] 5.2 Add or update shared UI tests for concise Chinese homepage copy and preserved source identifiers.
- [x] 5.3 Run targeted UI/auth tests plus relevant repository validation commands and record any visual QA evidence needed for review.
