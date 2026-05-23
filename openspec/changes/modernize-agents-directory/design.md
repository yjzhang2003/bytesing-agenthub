## Context

The Desktop/Web Agents page currently reuses the side-list/detail layout from the workbench, but its detail panel defaults to raw role configuration. That makes the page feel like an internal admin form instead of a modern agent directory. The page also renders a malformed search control because the Agents sidebar places `AgentHubSearchInput` inside the chat search label container, while the chat sidebar uses a custom icon/input structure.

The change is UI-only. It must preserve the existing Control Plane agent model, callbacks, localization model, side navigation, and create/update behavior. No backend schema or API changes are needed.

## Goals / Non-Goals

**Goals:**

- Make Agents feel like a contact-style configuration surface: readable, compact, and easy to scan.
- Fix the Agents search field by using the same shared search field structure as chat.
- Remove the duplicate prominent right-side "New agent" header action.
- Keep one primary save action for changed agent configuration.
- Make creation friendlier by offering template-assisted defaults inside the single create interface.
- Hide raw system prompt and policy JSON behind a default-collapsed advanced configuration section.
- Preserve English and Simplified Chinese product chrome.

**Non-Goals:**

- No new backend agent template API.
- No separate template gallery or template selection page.
- No changes to the agent role enum, provider model, or policy schema.
- No archive workflow redesign beyond removing the prominent detail-header archive/create management feel from the default surface.

## Decisions

### Use a shared AgentHub search field

Create or refactor a shared search field component that renders the icon, search input, focus state, and compact sidebar sizing in one AgentHub-owned DOM structure. Chat and Agents should both use this component.

Alternative considered: restyle Ant Design `Input.Search` only on Agents. This is less reliable because it keeps two markup structures for the same sidebar search behavior and requires fragile vendor DOM styling.

### Keep Agents as side-list plus detail, but change the detail hierarchy

The left side remains the agent list because it matches the current workbench navigation model and keeps switching fast. The right side becomes a readable configuration detail with grouped sections rather than a raw top-to-bottom form.

Alternative considered: a card grid directory. This is more decorative and uses more horizontal space without improving the core workflow of selecting and configuring one agent.

### Make creation template-assisted in one interface

When the user creates an agent, the same detail surface switches to create mode. Template choices appear as compact presets inside that create form and populate friendly defaults for name, role, responsibility, tags, system prompt, and policy. The user does not navigate to a separate template page.

Alternative considered: a dedicated template selection screen. The user rejected this because creation should have only one interface.

### Collapse advanced configuration by default

Raw system prompt and policy JSON remain editable for power users, but they are placed in a default-collapsed advanced section. The default path should present natural-language responsibility and capability fields first.

Alternative considered: removing advanced fields from the page. This would make the UI friendlier but would block current configuration use cases.

### Use a single save action

The detail surface should not show prominent edit/create/archive management actions in the profile header. Configuration changes are made on the page and committed through one save action. Any destructive or rare action should be secondary and visually separated from the primary path if retained.

Alternative considered: explicit edit mode plus archive action in the header. This adds management noise and conflicts with the user's expectation that the page has one primary save action.

## Risks / Trade-offs

- Template defaults could imply more backend support than exists -> Keep templates client-side presets that submit through the existing create callback.
- Collapsing advanced settings could hide important validation errors -> If an advanced field has an error, expand or visibly mark the advanced section.
- Shared search refactor could regress chat navigation -> Cover both chat and Agents sidebar search markup in component tests.
- A single save action can make dirty state ambiguous -> Disable or de-emphasize save when unchanged, and keep validation messages near affected fields.
- Removing prominent archive affordance may reduce discoverability -> Treat archive as a secondary advanced/destructive action if the existing workflow must remain available.

## Migration Plan

1. Add the shared AgentHub search field and migrate chat and Agents sidebars to it.
2. Refactor the Agents detail into display/configuration groups with a single save action.
3. Add client-side template presets to create mode within the same detail surface.
4. Move system prompt raw editing and policy JSON into the default-collapsed advanced configuration section.
5. Update localization strings and tests.
6. Verify desktop and narrow layouts in English and Simplified Chinese.
