## Why

AgentHub can now sign users in through GitHub, but users who want an AgentHub-owned account cannot
create or access one without a third-party identity provider. Adding first-party email login gives
the product a normal account path while keeping Supabase as the session authority that Control Plane
already trusts.

## What Changes

- Add a Web email/password account login flow alongside the existing GitHub OAuth action.
- Add Web account creation, email/password sign-in, password reset request, and reset callback
  handling through Supabase Auth.
- Keep GitHub login available and visually secondary-equivalent rather than replacing it.
- Keep Control Plane authentication based on Supabase access tokens; no custom password storage or
  custom session signing is introduced.
- Add login UI states, validation, localized copy, and tests for email auth, signup, reset, pending,
  success, and failure states.
- Document required Supabase Email Auth and redirect URL configuration for staging.
- Defer Desktop and iOS email/password UI to future changes; they continue using the existing GitHub
  browser-login path.

## Capabilities

### New Capabilities

- `agenthub-account-login`: Web first-party AgentHub account login, signup, password reset, and
  email-auth recovery states.

### Modified Capabilities

- `account-sync`: Production/staging account sessions may originate from GitHub OAuth or Supabase
  Email Auth, while Control Plane continues to authenticate Supabase JWT subjects.
- `localized-product-experience`: Login, signup, password reset, and account-auth error chrome must
  be available in English and Simplified Chinese.

## Impact

- Affected Web code: auth session helpers, route/view state, login page UI, callback handling,
  Supabase client calls, and tests in `apps/web`.
- Affected shared UI: auth component props, login/signup/reset forms, styles, and localization in
  `packages/ui`.
- Affected deployment configuration: Supabase Email Auth settings, password reset redirect URL,
  staging callback allow list, and deployment runbook.
- Affected auth behavior: Control Plane keeps validating Supabase JWTs without knowing whether the
  session came from GitHub or email/password.
