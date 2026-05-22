## Context

Several existing files under `openspec/specs/*/spec.md` were written with the older `## ADDED Requirements` top-level heading and no `## Purpose` section. The current OpenSpec validator expects maintained spec files to use `## Purpose` and `## Requirements`, so full spec validation currently fails before it can surface more meaningful issues.

This is a repository maintenance change. It touches spec documentation structure only and should not change product requirements or runtime behavior.

## Goals / Non-Goals

**Goals:**

- Normalize legacy OpenSpec capability files to the current required section structure.
- Preserve every existing requirement title, requirement body, scenario title, and scenario body.
- Add concise purpose summaries that describe the existing capability scope.
- Make the normalized specs pass `openspec validate --specs` unless unrelated validator issues are discovered.

**Non-Goals:**

- Changing product behavior, UI behavior, APIs, services, package dependencies, or tests.
- Rewriting requirement language beyond the minimum heading normalization.
- Expanding or narrowing any capability scope.

## Decisions

- Use a mechanical heading migration for legacy files: insert `## Purpose` before requirements and convert `## ADDED Requirements` to `## Requirements`.
- Keep purpose text short and descriptive so it does not introduce new normative behavior.
- Validate individual specs after migration, then run full spec validation to confirm the maintenance work removed the current format failures.
- Keep implementation in one focused commit so any accidental semantic drift is easy to review.

## Risks / Trade-offs

- Purpose text can accidentally imply new scope. Mitigation: keep it non-normative and aligned to existing requirement names.
- Large multi-file documentation edits can hide unintended requirement changes. Mitigation: review diffs for headings and purpose additions only.
- Full validation may expose additional legacy issues after the heading failures are fixed. Mitigation: fix only issues caused by this structural migration, and report any unrelated failures separately.
