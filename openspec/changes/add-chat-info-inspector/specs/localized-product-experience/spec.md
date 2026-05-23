## ADDED Requirements

### Requirement: Chat information localization
The system SHALL localize product-owned chat information labels and participant management actions.

#### Scenario: Chat information renders in Simplified Chinese
- **WHEN** the selected language is Simplified Chinese and the user opens chat information
- **THEN** labels for participants, add agent, remove agent, chat name, chat kind, workspace, runtime, created, updated, announcement, note, and membership summary use Simplified Chinese text

#### Scenario: Chat title and agent names are source content
- **WHEN** the selected language is Simplified Chinese and a chat title or agent display name contains English or technical text
- **THEN** the title and agent display name remain unchanged while surrounding product chrome uses Simplified Chinese

#### Scenario: Unsupported locale opens chat information
- **WHEN** an unsupported locale value is present and chat information renders
- **THEN** the chat information labels fall back to English and add/remove controls remain usable
