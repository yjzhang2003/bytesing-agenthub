## 1. Shared Search Field

- [x] 1.1 Add an AgentHub-owned shared sidebar search field component with icon, input, placeholder, accessible label, compact sizing, and focus styling.
- [x] 1.2 Replace the conversation sidebar search markup with the shared search field without changing current navigation behavior.
- [x] 1.3 Replace the Agents sidebar search markup with the shared search field and remove the nested Ant Design search input that causes the malformed field.
- [x] 1.4 Add or update component tests that assert chat and Agents sidebars render the shared search structure.

## 2. Agents Detail Hierarchy

- [x] 2.1 Refactor the Agents detail header to remove the prominent right-side "New agent" action.
- [x] 2.2 Present selected agents with readable identity, role, provider, responsibility summary, capability tags, and configuration summary before raw fields.
- [x] 2.3 Keep one primary save action for configuration changes and de-emphasize or disable it when there are no unsaved changes.
- [x] 2.4 Preserve existing selected-agent state, create callback, update callback, default-agent indicator, and localization behavior.

## 3. Single-Interface Template Creation

- [x] 3.1 Add client-side template presets for common agent roles such as Orchestrator, Implementer, Reviewer, and Researcher.
- [x] 3.2 Show template presets inside the single create interface after the user activates the Agents sidebar create affordance.
- [x] 3.3 Populate create fields from the selected template while allowing the user to edit name, role, responsibility, tags, system prompt, and policy before saving.
- [x] 3.4 Ensure saving a template-assisted agent uses the existing create workflow and does not require backend API changes.

## 4. Advanced Configuration

- [x] 4.1 Move raw system prompt and policy JSON controls into a default-collapsed advanced configuration disclosure for both edit and create states.
- [x] 4.2 Keep basic responsibility and capability fields visible outside advanced configuration.
- [x] 4.3 Surface advanced validation errors clearly and make the advanced section discoverable when policy JSON is invalid.
- [x] 4.4 Add English and Simplified Chinese labels for template presets, advanced configuration, responsibility, and save states.

## 5. Verification

- [x] 5.1 Update React static-render tests for existing-agent detail, create mode, template preset rendering, collapsed advanced configuration, and single save action.
- [x] 5.2 Run the UI test suite and relevant TypeScript checks.
- [x] 5.3 Perform browser visual verification at desktop width for chat search, Agents search, existing-agent detail, and create interface.
- [x] 5.4 Perform browser visual verification for Simplified Chinese and a narrow layout to confirm text and controls do not overlap.
