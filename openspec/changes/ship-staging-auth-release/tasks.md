## 1. Baseline and Release Inputs

- [x] 1.1 Confirm `add-cross-platform-github-login` and `production-auth-release-pipeline` are complete and decide whether to archive them before staging work starts.
- [x] 1.2 Choose staging Web and Control Plane hostnames and deployment providers.
- [x] 1.3 Record non-secret staging URLs, callback URLs, and provider choices in the deployment runbook.
- [x] 1.4 Identify required secret locations for Supabase JWT secret, Supabase anon key, GitHub OAuth client secret, and deployment provider credentials without committing secret values.

## 2. Staging Auth and Hosted Services

- [x] 2.1 Configure Supabase GitHub OAuth with staging Web callback, Desktop callback, iOS callback, and local development callback URLs.
- [ ] 2.2 Deploy Control Plane in Supabase auth mode with `SUPABASE_JWT_SECRET`, provider mode, and staging URL configuration.
- [ ] 2.3 Deploy Web in Supabase auth mode with staging Control Plane URL, Supabase URL, and Supabase anon key.
- [ ] 2.4 Verify staging Web opens unauthenticated to the GitHub login surface without loading private workbench data.
- [ ] 2.5 Verify hosted Control Plane rejects the local-demo token and accepts a Supabase JWT from a GitHub-authenticated staging session.

## 3. Desktop Staging Package

- [x] 3.1 Configure GitHub repository variables for staging `AGENTHUB_WEB_URL` and `AGENTHUB_CONTROL_PLANE_URL`.
- [x] 3.2 Run the local unsigned Desktop package command with signing disabled and confirm package artifacts are produced.
- [ ] 3.3 Launch the local staging Desktop package and verify it loads the hosted staging Web shell.
- [ ] 3.4 Verify Desktop bridge capability discovery is available from the packaged staging app.
- [ ] 3.5 Verify packaged Desktop starts GitHub browser login and handles the Desktop callback without exposing tokens to renderer globals.

## 4. Staging Release Workflow

- [ ] 4.1 Create and push a staging release tag matching the release workflow pattern.
- [ ] 4.2 Verify GitHub Actions runs repository verification, builds Desktop package artifacts, and publishes a GitHub Release.
- [ ] 4.3 Download the staging GitHub Release artifact and launch it locally for smoke verification.
- [ ] 4.4 Mark the staging release as pre-release or otherwise document its internal-only status.

## 5. End-to-End Smoke and Rollback

- [ ] 5.1 Run Web staging smoke for GitHub login, authenticated workbench load, sign-out, and private-data blocking after sign-out.
- [ ] 5.2 Run Desktop staging smoke for hosted shell loading, browser-login callback, sign-out, and event stream closure on auth rejection.
- [ ] 5.3 Run local runtime staging smoke proving the local Desktop Runtime can coordinate with hosted staging services for the signed-in account.
- [ ] 5.4 Document rollback actions and concrete rollback targets for Web, Control Plane, and Desktop staging artifacts.
- [ ] 5.5 Record smoke date, staging URLs, release tag, artifact location, pass/fail result, and any production blockers in the deployment runbook.

## 6. Verification and Change Completion

- [ ] 6.1 Run `openspec validate ship-staging-auth-release --strict`.
- [ ] 6.2 Run any repository checks affected by documentation, workflow, or configuration changes.
- [ ] 6.3 Confirm `openspec instructions apply --change ship-staging-auth-release --json` reports the change is ready or all tasks complete after implementation.
