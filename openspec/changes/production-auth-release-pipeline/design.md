## Context

AgentHub currently has a strong local-demo development loop: Control Plane, Web, Desktop, and Desktop Runtime can run locally with deterministic smoke paths. The repository also has root validation commands, but no CI workflow, no production deployment contract, and no Desktop packaging/release pipeline.

The product direction now needs hosted login and distributable Desktop builds. Production must not weaken the local-first model: Claude Code execution and local project access remain on the user's machine through Desktop Runtime, while hosted services provide identity, account-scoped metadata, and the Web shell.

## Goals / Non-Goals

**Goals:**

- Establish CI gates for pull requests and main before more production-facing work accumulates.
- Add a deployable Control Plane configuration that fails closed in Supabase authentication mode.
- Define Web production authentication through Supabase sessions while preserving local-demo defaults.
- Add macOS Desktop package and release artifact publishing as the first Desktop distribution target.
- Document required server, environment, and release operations.

**Non-Goals:**

- Moving Claude Code execution, local repository inspection, or Desktop Runtime commands to the hosted server.
- Implementing Windows/Linux Desktop packaging in the first release pipeline.
- Implementing auto-update behavior before signed/notarized Desktop artifacts exist.
- Reworking the current UI style or navigation as part of delivery infrastructure.
- Replacing Supabase with a custom identity provider.

## Decisions

### Use GitHub Actions as the first CI/CD runner

GitHub Actions is already adjacent to the repository and can validate pull requests, build macOS artifacts on macOS runners, and publish GitHub Releases without introducing another platform. This keeps the first pipeline simple and visible.

Alternatives considered:

- Self-hosted CI: useful later for cost or signing isolation, but too much operational weight for the first pipeline.
- Vercel-only deployment checks: good for Web, but does not cover Desktop packaging or repository-wide validation.

### Keep local-demo and production-auth modes side by side

The existing local-demo token flow remains the default for local development and deterministic smoke tests. Production Web and Desktop shells use Supabase sessions and send user JWTs to Control Plane when `AGENTHUB_AUTH_MODE=supabase` or equivalent client build configuration is enabled.

Alternatives considered:

- Require Supabase for all local development: increases setup friction and weakens deterministic smoke tests.
- Keep static local tokens in production: simpler implementation, but incompatible with account isolation and real users.

### Host identity and metadata, keep execution local

Control Plane and Web are deployed as hosted services, but Desktop Runtime continues to execute local Claude Code runs and local project actions. Runtime registration and command polling bridge the hosted account state to the local device.

Alternatives considered:

- Hosted execution workers: would require new tenancy, filesystem, secret, billing, and permission models.
- Desktop-only product: avoids server work, but blocks Web/iOS continuity and account-scoped state sync.

### Start Desktop distribution with macOS artifacts

The first release workflow produces macOS package artifacts and publishes them to GitHub Releases. Signing and notarization secrets are planned in the workflow shape, but hardened distribution can be completed after unsigned packaging is stable.

Alternatives considered:

- Build all platforms immediately: expands scope before the packaging model is proven.
- Manual packaging outside CI: faster initially, but does not create a repeatable release path.

## Risks / Trade-offs

- Production secrets are misconfigured -> Control Plane must fail startup in Supabase mode when required secrets are missing, and deployment docs must list every required variable.
- CI becomes too slow -> Start with existing root commands, then split jobs only when runtime data shows a bottleneck.
- Desktop release artifacts are unsigned at first -> Treat unsigned packaging as an internal/staging milestone and gate public distribution on signing/notarization.
- Web session refresh breaks long-running usage -> Centralize session acquisition in a small Web auth adapter so refresh behavior can be tested independently.
- Hosted Web cannot reach local runtime directly -> Continue routing execution through Control Plane and Desktop Runtime registration rather than exposing local ports to browsers.

## Migration Plan

1. Add OpenSpec coverage for the production auth and release pipeline.
2. Add CI validation on pull requests and main.
3. Make Control Plane deployable with production auth configuration.
4. Add Web Supabase session bootstrap for production builds.
5. Add Desktop macOS package build scripts and release workflow.
6. Document staging deployment and rollback.
7. Run staging release smoke: sign in, load Web, launch Desktop, check Claude Code connection, and start a local run.

Rollback:

- Disable or revert production auth client builds while keeping local-demo mode.
- Redeploy the previous Control Plane container/image.
- Remove or mark broken Desktop release artifacts as pre-release and publish a patched tag.
