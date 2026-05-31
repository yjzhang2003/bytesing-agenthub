## 1. Shared Auth Model and UI

- [x] 1.1 Add shared auth state types for unauthenticated, authenticating, authenticated, and error states.
- [x] 1.2 Add shared login surface props and a GitHub provider action for Desktop/Web rendering.
- [x] 1.3 Add English and Simplified Chinese login, logout, loading, retry, provider, and authentication error strings.
- [x] 1.4 Add shared UI tests for English login rendering, Simplified Chinese login rendering, GitHub provider preservation, and unauthenticated private-data blocking.

## 2. Web GitHub Login

- [x] 2.1 Add Web auth session tests for starting GitHub OAuth, handling missing sessions, handling OAuth errors, and signing out.
- [x] 2.2 Implement Web Supabase GitHub sign-in through `signInWithOAuth`.
- [x] 2.3 Wrap the Web app bootstrap with login, authenticating, authenticated, error, and sign-out states.
- [x] 2.4 Ensure local-demo mode still bypasses GitHub login and uses the configured local token.
- [x] 2.5 Verify Web auth tests, Web typecheck, and representative localized UI rendering.

## 3. Desktop Browser Login Callback

- [x] 3.1 Add Desktop auth bridge tests for capability discovery, browser login launch, valid callback handling, invalid callback handling, and sign-out.
- [x] 3.2 Extend the Desktop preload bridge with safe browser-login capability methods.
- [x] 3.3 Implement Desktop main-process OAuth launch using the system browser and Supabase GitHub OAuth URL.
- [x] 3.4 Implement Desktop callback/deep-link or development loopback handling that validates OAuth state and completes the Supabase session.
- [x] 3.5 Persist and clear Desktop Supabase session state without exposing tokens through unsafe renderer globals.
- [x] 3.6 Verify Desktop typecheck, Desktop tests, and desktop bridge smoke coverage.

## 4. iOS Native GitHub Login

- [x] 4.1 Add iOS localization smoke expectations for login, GitHub sign-in, sign-out, loading, and authentication errors.
- [x] 4.2 Add native SwiftUI login view with GitHub sign-in, loading, error, retry, and localized product chrome.
- [x] 4.3 Add iOS auth session service using system browser authentication session and configured callback URL.
- [x] 4.4 Add iOS callback handling, session persistence, session clearing, and authenticated workspace loading gate.
- [x] 4.5 Verify iOS localization smoke and native build/test path available in the repository.

## 5. Account and Control Plane Integration

- [x] 5.1 Add tests proving production mode rejects local-demo tokens and accepts Supabase JWTs from GitHub-authenticated sessions.
- [x] 5.2 Ensure clients clear private in-memory data when sign-out, session expiry, or authentication rejection occurs.
- [x] 5.3 Ensure Control Plane event streams are closed on sign-out or authentication failure.
- [x] 5.4 Document required Supabase GitHub provider settings and redirect URLs for Web, Desktop, and iOS.

## 6. Verification and Change Completion

- [x] 6.1 Run focused Web, Desktop, iOS, and Control Plane auth tests.
- [x] 6.2 Run `pnpm format:check:changed`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `openspec validate --specs --strict`, and `pnpm build`.
- [x] 6.3 Run `openspec validate add-cross-platform-github-login --strict`.
- [x] 6.4 Confirm `openspec instructions apply --change add-cross-platform-github-login --json` reports all tasks complete after implementation.
