## Why

AgentHub already has production authentication plumbing, but users still do not have a real login surface. Web, Desktop, and iOS need a consistent GitHub sign-in experience before hosted deployments and downloadable Desktop builds can be used by real accounts.

## What Changes

- Add a cross-platform login experience with GitHub as the first supported OAuth provider.
- Add Web login, authenticated loading, login error, and sign-out surfaces.
- Add Desktop login that opens the browser for GitHub OAuth and returns to Desktop through a callback/deep-link flow.
- Add native iOS login using the system browser/authentication session and return to the app after GitHub OAuth.
- Add localized English and Simplified Chinese product chrome for login, logout, loading, and authentication error states.
- Preserve local-demo development behavior without requiring GitHub or hosted Supabase credentials.

## Capabilities

### New Capabilities

- `github-login-experience`: Cross-platform GitHub OAuth login pages, session lifecycle, logout, and authentication error handling for Web, Desktop, and iOS.

### Modified Capabilities

- `account-sync`: Account access must be backed by a GitHub OAuth-authenticated Supabase session in production and must keep local-demo auth isolated to development.
- `ios-mobile-experience`: iOS must present native login and return from GitHub OAuth before loading private workspace data.
- `desktop-capability-bridge`: Desktop must support browser-based login handoff and callback/deep-link return without exposing Node integration to the renderer.
- `localized-product-experience`: Login, logout, provider, loading, and authentication error chrome must be covered in English and Simplified Chinese.

## Impact

- Affected code: shared Web app bootstrap, shared UI auth surfaces, Desktop shell OAuth callback handling, iOS auth views, Supabase auth client setup, localization catalogs, and tests.
- Affected systems: Supabase Auth GitHub provider, GitHub OAuth app configuration, Web deployment callback URLs, Desktop custom protocol or loopback callback, and iOS URL scheme/universal link configuration.
- Operational inputs: GitHub OAuth client settings in Supabase, allowed redirect URLs for Web/Desktop/iOS, Desktop protocol registration, and iOS URL scheme configuration.
