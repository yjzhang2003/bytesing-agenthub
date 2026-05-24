## 1. Dialog Behavior

- [x] 1.1 Replace the single-select `AddChatAgentDialog` state with local search query and selected-agent ID set state that resets when the dialog opens or the chat changes.
- [x] 1.2 Render a searchable eligible-agent list with row toggles, avatar/name content, selected state, no-eligible-agents empty state, and no-search-results state.
- [x] 1.3 Update confirmation behavior so one or more selected agents invoke the existing add-agent membership action for every selected ID before the picker closes.
- [x] 1.4 Preserve cancel, Escape, focus restoration, disabled confirm, and active chat/inspector/composer state behavior.

## 2. Visual Styling

- [x] 2.1 Replace the add-agent dialog select styling with compact IM-style picker styles: large search field, circular selection controls, stable row dimensions, avatars, hover/focus/selected/disabled states, and internal list scrolling.
- [x] 2.2 Ensure the picker uses AgentHub semantic tokens and works in both light and dark theme modes without feature-specific vendor internals.
- [x] 2.3 Add responsive rules so the dialog fits narrow/mobile-web viewports, keeps actions reachable, and prevents long names or Chinese labels from overlapping adjacent controls.

## 3. Localization and Wiring

- [x] 3.1 Add or update English and Simplified Chinese strings for search placeholder, confirm label/count behavior, empty eligible list, and no search results.
- [x] 3.2 Adjust Web app callback wiring if needed so multi-selected agents can be added without unnecessary intermediate refreshes.

## 4. Verification

- [x] 4.1 Update component behavior tests for search filtering, selecting multiple agents, confirming multiple add calls, no-results, and empty eligible list behavior.
- [x] 4.2 Update static rendering/localization tests for the new picker structure and Simplified Chinese strings.
- [x] 4.3 Run the affected UI test suite and capture or verify rendered desktop and narrow layout states for the redesigned picker.
