## ADDED Requirements

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
