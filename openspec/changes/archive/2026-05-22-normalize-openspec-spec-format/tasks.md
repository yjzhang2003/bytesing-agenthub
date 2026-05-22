## 1. Identify Legacy Specs

- [x] 1.1 List all `openspec/specs/*/spec.md` files that do not contain both `## Purpose` and `## Requirements`.
- [x] 1.2 Confirm already-normalized specs are left unchanged unless validation exposes a directly related issue.

## 2. Normalize Spec Structure

- [x] 2.1 Add concise non-normative `## Purpose` text to each legacy spec based on its existing requirements.
- [x] 2.2 Rename each legacy `## ADDED Requirements` top-level heading to `## Requirements`.
- [x] 2.3 Preserve existing requirement names, requirement bodies, scenario names, and scenario bodies.

## 3. Validate and Review

- [x] 3.1 Run targeted validation for migrated specs.
- [x] 3.2 Run `openspec validate --specs` and address structural issues caused by this migration.
- [x] 3.3 Review the diff to confirm the change is limited to OpenSpec structure normalization and the new meta capability spec.
