## MODIFIED Requirements

### Requirement: Settings panel visual structure
The Desktop/Web Settings surface SHALL use a focused settings-panel layout with category navigation and grouped preference rows that follow AgentHub compact workbench typography, density, radius, and spacing tokens instead of page-specific oversized settings styling.

#### Scenario: User opens Settings on desktop
- **WHEN** the user opens Settings at desktop width
- **THEN** the UI presents a left category list and a right scrollable content area with compact grouped setting panels, tokenized row labels, compact controls, and clear separators between rows without using oversized category labels, headings, row titles, row heights, or preference-card styling

#### Scenario: Settings matches adjacent workbench surfaces
- **WHEN** the user switches between Chat, Agents, and Settings
- **THEN** Settings uses the same AgentHub compact typography scale, restrained panel treatment, icon scale, and control density as the surrounding workbench surfaces

#### Scenario: Settings contains operational metadata
- **WHEN** Settings shows workspace, runtime, permissions, language, keyboard, or appearance information
- **THEN** interactive preferences render as row controls while read-only technical values remain secondary text inside grouped rows rather than taking primary visual focus

#### Scenario: Settings is viewed in a narrow layout
- **WHEN** available width cannot support the desktop split layout
- **THEN** the category navigation collapses into a horizontal scrollable strip above the grouped settings content without overlapping controls, clipping localized labels, or inflating typography beyond the compact workbench scale
