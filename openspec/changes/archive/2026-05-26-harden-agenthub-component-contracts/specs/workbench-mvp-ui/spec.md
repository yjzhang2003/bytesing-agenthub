## ADDED Requirements

### Requirement: MVP component behavior verification
The Desktop/Web MVP implementation SHALL verify behavior for workbench surfaces that depend on AgentHub-owned component contracts.

#### Scenario: Chat information dialog behavior is ready for review
- **WHEN** the Chat Info add-agent dialog implementation is considered ready
- **THEN** verification covers opening the dialog from participant management, initial focus, focus containment, Escape close, cancel/confirm actions, focus return, localized labels, and no access to background workbench controls while the dialog is open

#### Scenario: Settings control behavior is ready for review
- **WHEN** Settings implementation is considered ready
- **THEN** verification covers localized accessible names and keyboard operation for theme and Enter-to-send switches

#### Scenario: Search control behavior is ready for review
- **WHEN** sidebar search controls are considered ready
- **THEN** verification covers localized accessible names, text entry, clear affordance behavior, disabled behavior where applicable, and compact visual consistency across Chat and Agents sidebars

#### Scenario: Component feedback behavior is ready for review
- **WHEN** workbench feedback or loading states are considered ready
- **THEN** verification covers localized loading labels, Toast live-region behavior, feedback tone rendering, and dark/light theme rendering
