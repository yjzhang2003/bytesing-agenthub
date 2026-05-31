## Context

AgentHub now has GitHub-backed Supabase authentication, a production Control Plane auth mode, hosted Web configuration paths, Desktop OAuth callback handling, CI, and a tag-triggered Desktop release workflow. The repository has local build outputs, but there is no evidence of a real hosted Web deployment, hosted Control Plane deployment, configured Supabase GitHub provider, GitHub Release artifact, or tag-triggered Desktop package.

This change turns the completed implementation into a staged release exercise. The goal is to discover operational gaps before production: callback URL mismatches, missing environment variables, hosted JWT failures, Desktop protocol callback issues, and release workflow packaging failures.

## Goals / Non-Goals

**Goals:**

- Establish a staging Web and Control Plane deployment using Supabase auth mode.
- Configure Supabase GitHub OAuth and GitHub repository variables for staging URLs.
- Produce and smoke-test a local unsigned Desktop package.
- Trigger a staging release tag and verify GitHub Release artifacts are published.
- Run end-to-end staging smoke checks that cover Web login, Control Plane auth, Desktop hosted-shell loading, Desktop browser-login callback, local runtime connectivity, and rollback readiness.
- Record actual staging inputs and smoke outcomes in deployment documentation.

**Non-Goals:**

- Shipping a public production release.
- Adding Apple code signing or notarization beyond the existing unsigned release path.
- Adding new authentication providers or account management features.
- Migrating local Claude Code execution to hosted infrastructure.
- Replacing the selected deployment providers after staging is already configured, unless staging exposes a hard blocker.

## Decisions

### Treat staging as the release gate before production

Staging SHALL use production-like auth mode and callback URLs, but with staging hostnames and a staging tag such as `v0.1.0-staging.1`. This keeps public production distribution blocked until the hosted and packaged flows work together.

Alternatives considered:

- Direct production release: faster, but callback and Desktop package issues would be user-facing.
- Local-only verification: useful for implementation, but cannot prove hosted OAuth redirects or GitHub Release publishing.

### Keep Desktop packaging unsigned for the staging dry run

The current Electron Builder configuration supports unsigned macOS `dmg` and `zip` artifacts with `CSC_IDENTITY_AUTO_DISCOVERY=false`. Staging should prove packaging, hosted URL injection, and Desktop bridge/auth behavior before signing/notarization is introduced.

Alternatives considered:

- Add signing now: increases setup complexity and mixes release hardening with distribution compliance.
- Skip packaging until production: leaves the highest-risk Desktop distribution path untested.

### Record real environment values in the runbook without storing secrets

The runbook SHALL capture staging URLs, callback URLs, repository variable names, release tag, and smoke results. Secrets such as Supabase JWT secret, OAuth client secret, and signing credentials SHALL remain in provider dashboards or GitHub secrets, not in repository files.

Alternatives considered:

- Keep only generic placeholders: avoids churn, but makes handoff and rollback ambiguous.
- Commit `.env` files: convenient, but unsafe for secrets and provider credentials.

### Keep local-demo mode separate from staging mode

Staging MUST use Supabase auth mode end to end. Local-demo remains the deterministic local development path and should not require hosted Supabase credentials.

Alternatives considered:

- Reuse local-demo token in staging for smoke: faster, but it would not test the production security boundary.
- Require Supabase auth for all local smoke: more realistic, but slower and more fragile for development.

## Risks / Trade-offs

- OAuth callback mismatch → Document the exact Web, Desktop, iOS, and local callback URLs and test login before creating a production tag.
- Hosted Control Plane rejects valid sessions → Verify Supabase JWT secret alignment and test both valid JWT access and local-demo token rejection.
- Desktop package loads the wrong Web or Control Plane URL → Verify package-time environment variables and inspect the packaged app behavior during smoke.
- GitHub Release workflow fails after tag push → Use a staging tag first and require downloadable artifacts before production tagging.
- Unsigned macOS package has Gatekeeper friction → Treat unsigned staging artifacts as internal smoke-only; keep production public distribution gated on a later signed/notarized release.
- Staging URLs or secrets leak into source → Store secrets only in deployment platforms/GitHub secrets and commit only non-secret URLs and variable names.

## Migration Plan

1. Archive or clearly baseline completed auth/release changes before starting staging work.
2. Choose staging hostnames and deployment providers for Web and Control Plane.
3. Configure Supabase GitHub OAuth with staging redirect URLs.
4. Configure hosted Web and Control Plane environment variables.
5. Configure GitHub repository variables for Desktop release URL injection.
6. Deploy Control Plane and Web to staging.
7. Run hosted auth smoke checks.
8. Produce a local unsigned Desktop package and run Desktop bridge/auth smoke.
9. Push a staging release tag and verify GitHub Release artifacts.
10. Record smoke results and rollback targets in the runbook.

Rollback strategy:

- Web: redeploy the prior successful static build or disable staging host routing.
- Control Plane: redeploy the prior service image/artifact and keep Supabase auth fail-closed.
- Desktop Release: mark the staging GitHub Release as pre-release or delete broken assets, then publish a corrected staging tag.

## Open Questions

- Which providers should host staging Web and Control Plane?
- What exact staging hostnames should be used for Web and API?
- Should the first staging GitHub Release be a pre-release?
- Do we want to archive `production-auth-release-pipeline` and `add-cross-platform-github-login` before starting implementation, or keep them complete until staging proves the release?
