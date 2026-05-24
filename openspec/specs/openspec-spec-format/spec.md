## Purpose

Define the maintained OpenSpec capability file structure used by this repository so spec validation can distinguish current files from legacy delta headings.

## Requirements

### Requirement: Maintained specs use current OpenSpec structure
Maintained OpenSpec capability files SHALL use the current required top-level structure with a purpose section followed by requirements.

#### Scenario: Legacy spec is normalized
- **WHEN** a maintained capability spec exists under `openspec/specs`
- **THEN** the spec contains a `## Purpose` section and a `## Requirements` section

#### Scenario: Existing requirements are preserved
- **WHEN** a legacy spec is migrated to the current structure
- **THEN** existing requirement titles, requirement bodies, scenario titles, and scenario bodies remain semantically unchanged

#### Scenario: Specs are validated after normalization
- **WHEN** the legacy spec migration is complete
- **THEN** OpenSpec spec validation is run to confirm the normalized files satisfy the current validator format

### Requirement: Completed OpenSpec changes are committed
Completed OpenSpec change work SHALL include a git commit before the work is considered handed off or archived, unless the user explicitly requests no commit.

#### Scenario: Change implementation is ready
- **WHEN** an OpenSpec change implementation has passed required validation and is ready for review, handoff, or archive
- **THEN** the agent stages the relevant implementation, test, and OpenSpec files and creates a concise git commit without requiring a separate user request

#### Scenario: Commit cannot be created safely
- **WHEN** validation fails, git identity is missing, unrelated dirty files cannot be separated safely, or the user explicitly asks not to commit
- **THEN** the agent reports the blocker and does not claim the OpenSpec change is fully handed off until the commit path is resolved
