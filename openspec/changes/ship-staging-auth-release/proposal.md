## Why

AgentHub has completed the production auth and release pipeline implementation work, but it has not yet been exercised against real hosted staging services or a generated Desktop artifact. The next risk is operational: OAuth callback configuration, hosted Control Plane authentication, Web deployment variables, and Desktop release packaging must be proven together before a production launch.

## What Changes

- Ship a staging release path that deploys Web and Control Plane with Supabase GitHub authentication enabled.
- Configure and verify real staging URLs for Web, Control Plane, Supabase Auth, GitHub OAuth callbacks, and Desktop release variables.
- Produce a local unsigned Desktop package for smoke testing before triggering a tag-based release workflow.
- Trigger a staging tag release and verify GitHub Release artifacts are produced for macOS.
- Run end-to-end staging smoke checks for Web login, Desktop browser-login callback, Control Plane JWT rejection/acceptance, local Desktop runtime connectivity, and rollback readiness.
- Capture the actual staging URLs, required repository variables/secrets, smoke results, and any release-blocking gaps in the deployment runbook.

## Capabilities

### New Capabilities

- `staging-release-readiness`: Staging deployment, release artifact, smoke verification, and rollback readiness requirements before production distribution.

### Modified Capabilities

- `account-sync`: Staging account access must use real Supabase GitHub OAuth sessions and reject local-demo tokens in hosted mode.
- `desktop-capability-bridge`: Staging Desktop packages must load configured hosted Web/Control Plane URLs and complete browser-login callback verification.
- `local-runnable-topology`: Hosted staging services must coordinate with the local Desktop runtime without breaking local-demo development.

## Impact

- Affected code/config: GitHub repository variables/secrets, deployment platform configuration, Supabase Auth settings, Desktop packaging commands, deployment runbook, and possibly workflow environment handling if staging exposes gaps.
- Affected systems: hosted Web, hosted Control Plane, Supabase Auth GitHub provider, GitHub Actions, GitHub Releases, and local macOS Desktop smoke environment.
- Operational inputs: real staging Web URL, Control Plane URL, Supabase project URL and anon key, Supabase JWT secret, GitHub OAuth client settings, GitHub repo variables, release tag naming, and rollback target identifiers.
