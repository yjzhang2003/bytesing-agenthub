## Why

Older OpenSpec capability files do not consistently use the current `## Purpose` and `## Requirements` structure, so `openspec validate --specs` reports format failures even when the actual requirements are unchanged.

Normalizing the legacy spec structure now removes validation noise before the next functional change and keeps future archive/sync work easier to review.

## What Changes

- Add a concise `## Purpose` section to legacy specs that do not have one.
- Rename legacy top-level `## ADDED Requirements` headings to `## Requirements`.
- Preserve all existing requirement and scenario wording.
- Do not change application code, behavior, APIs, dependencies, or product scope.

## Capabilities

### New Capabilities

- `openspec-spec-format`: Documents the required structure for maintained OpenSpec capability files.

### Modified Capabilities

- None. This change is documentation structure normalization only; it does not alter spec-level requirements.

## Impact

- Affected files: legacy `openspec/specs/*/spec.md` files that still lack the current required section structure.
- No runtime code impact.
- No package, API, database, or UI behavior impact.
