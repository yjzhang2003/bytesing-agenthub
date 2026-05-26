## ADDED Requirements

### Requirement: Desktop capability-gated project actions
The Desktop/Web MVP workbench SHALL show local project creation actions only when the active client reports matching Desktop capabilities.

#### Scenario: Desktop supports local project creation
- **WHEN** the new conversation project picker is opened in Desktop and capability discovery reports local-directory and default-project capabilities
- **THEN** the picker exposes the New from folder and New default project actions using the same compact modal layout as existing project selection

#### Scenario: Desktop bridge is unavailable
- **WHEN** the new conversation project picker is opened in Desktop but the capability bridge is unavailable or degraded
- **THEN** the picker does not expose broken native actions and provides a concise localized unavailable state or diagnostic affordance

#### Scenario: Web opens project picker
- **WHEN** the new conversation project picker is opened in a normal browser
- **THEN** the picker lists existing projects only and does not show local directory or default-directory actions

#### Scenario: Native project is selected
- **WHEN** a Desktop user completes New from folder or New default project during conversation creation
- **THEN** the selected project appears in the picker, can be confirmed for the conversation, and displays name, path label, runtime status, and repository branch when available
