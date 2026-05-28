## Why

AgentHub needs a repeatable production delivery path before account state, hosted login, and downloadable Desktop builds become dependencies for real users. The current local-demo flow is useful for development, but it does not define CI gates, production authentication, hosted service deployment, or Desktop package publishing.

## What Changes

- Add a CI workflow that validates pull requests and main with formatting, typechecking, linting, tests, OpenSpec validation, and builds.
- Add a production Control Plane deployment path with explicit Supabase JWT authentication and fail-closed configuration.
- Add Web production login behavior that uses an authenticated Supabase session instead of a local demo token.
- Add Desktop package build and release publishing for macOS artifacts, with signing/notarization secrets prepared for the later hardened release step.
- Preserve the current local-demo development mode and local Desktop runtime model.

## Capabilities

### New Capabilities

- `release-pipeline`: CI/CD validation, release artifact production, release publishing, and deployment runbook expectations.

### Modified Capabilities

- `account-sync`: Production clients must authenticate through Supabase-backed sessions before accessing private AgentHub data.
- `local-runnable-topology`: Hosted Web and Control Plane deployments must coexist with the local Desktop runtime and local-demo development topology.
- `desktop-capability-bridge`: Packaged Desktop builds must preserve local bridge behavior while loading the configured Web shell and runtime connection settings.

## Impact

- Affected code: `.github/workflows`, `apps/web`, `apps/desktop`, `services/control-plane`, package scripts, and deployment documentation.
- Affected systems: Supabase Auth, hosted Control Plane, hosted Web app, GitHub Actions, GitHub Releases, and macOS Desktop distribution.
- New operational inputs: production Control Plane URL, Supabase URL, Supabase anon key, Supabase JWT secret, Desktop release variables, and future Apple signing/notarization secrets.
