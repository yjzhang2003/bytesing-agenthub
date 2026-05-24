## Why

The current add-agent flow in chat information does not match the requested IM-style picker experience and only supports choosing one eligible agent at a time. A searchable, avatar-first multi-select dialog will make group chat membership management faster and closer to the expected mobile messaging pattern.

## What Changes

- Redesign the Add agent dialog as a compact list picker with a prominent search field, circular selection controls, avatar thumbnails, and agent display names matching the provided visual direction.
- Allow users to select multiple eligible agents before confirming the add action.
- Keep already-participating agents out of the selectable list, preserve active chat/workbench state while the dialog is open, and localize product chrome in English and Simplified Chinese.
- Add empty, no-search-results, loading/disabled, keyboard, and responsive behavior expectations for the picker.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `workbench-mvp-ui`: Add-agent chat membership behavior changes from single immediate selection to a searchable multi-select picker dialog.
- `visual-design-system`: Define the picker's compact IM-style list, search field, selection controls, avatars, and responsive/accessibility visual constraints.

## Impact

- Desktop/Web UI chat information inspector and add-agent dialog components.
- AgentHub UI localization strings for picker labels, placeholders, empty states, and actions.
- Client membership action wiring may need to call the existing add-agent action once per selected agent unless a batch API is introduced separately.
- UI tests and rendered verification for English, Simplified Chinese, search filtering, multi-select confirmation, and narrow layouts.
