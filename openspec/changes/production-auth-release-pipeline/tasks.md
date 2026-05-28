## 1. CI Baseline

- [x] 1.1 Add `.github/workflows/ci.yml` for pull requests and main branch validation.
- [x] 1.2 Configure CI to install with pnpm, then run format check, typecheck, lint, tests, OpenSpec spec validation, UI boundary checks, and workspace build.
- [x] 1.3 Run the CI-equivalent commands locally and adjust scripts only if existing root commands are unsuitable for CI.

## 2. Control Plane Production Deployment

- [x] 2.1 Add a production `start` script for the built Control Plane service.
- [x] 2.2 Update Control Plane configuration to require `SUPABASE_JWT_SECRET` when Supabase auth mode is enabled.
- [x] 2.3 Add tests covering local-demo auth defaults and fail-closed Supabase auth configuration.
- [x] 2.4 Add a Control Plane Dockerfile or equivalent deployable artifact definition.
- [x] 2.5 Verify Control Plane typecheck, config tests, and deployable artifact build.

## 3. Web Production Authentication

- [x] 3.1 Add a small Web Supabase session adapter that returns access token and user identity from the active session.
- [x] 3.2 Update Web client bootstrap so production auth mode uses Supabase access tokens for Control Plane calls.
- [x] 3.3 Preserve current local-demo token behavior for local development and smoke verification.
- [x] 3.4 Add tests for valid session, missing session, and local-demo fallback behavior.
- [x] 3.5 Verify Web typecheck and focused auth tests.

## 4. Desktop Packaging and Runtime Configuration

- [x] 4.1 Add Desktop package build scripts and the packaging dependency.
- [x] 4.2 Add macOS package configuration for the first Desktop artifact target.
- [x] 4.3 Ensure packaged Desktop can receive configured Web and Control Plane URLs without source changes.
- [x] 4.4 Verify unsigned local Desktop package build and bridge availability smoke coverage.

## 5. Release Workflow

- [x] 5.1 Add a tag-triggered Desktop release workflow that runs repository verification before packaging.
- [x] 5.2 Upload Desktop package artifacts to GitHub Releases only after verification and packaging succeed.
- [x] 5.3 Define required repository variables and secrets for staging release URLs and future signing/notarization.
- [x] 5.4 Verify workflow syntax and document first tag-based dry run expectations.

## 6. Deployment Runbook

- [x] 6.1 Document staging and production service layout for Web, Control Plane, Supabase Auth, and GitHub Releases.
- [x] 6.2 Document required environment variables for local-demo, staging, and production modes.
- [x] 6.3 Document release steps, smoke checks, and rollback actions for Web, Control Plane, and Desktop artifacts.
- [x] 6.4 Run `openspec validate production-auth-release-pipeline --strict` and commit the completed change artifacts.
