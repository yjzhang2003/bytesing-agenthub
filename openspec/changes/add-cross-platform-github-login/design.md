## Context

AgentHub has Supabase client wiring and Control Plane JWT verification, but no real login experience. Web currently falls into an authentication error state when production auth is enabled without a session. Desktop loads the shared Web shell and needs a native-safe way to launch browser OAuth and receive the result. iOS is native SwiftUI and needs a system-browser login flow rather than embedding the Web app.

The first production provider is GitHub through Supabase Auth. The implementation must preserve the local-demo development path so smoke tests and local iteration do not depend on GitHub OAuth configuration.

## Goals / Non-Goals

**Goals:**

- Provide first-class login, loading, error, and sign-out states for Web, Desktop, and iOS.
- Support GitHub OAuth through Supabase Auth as the first provider.
- Let Desktop start login in the browser and return to the app via a callback/deep-link flow.
- Let iOS use the system authentication session and return to the app before loading private data.
- Keep all login chrome localized in English and Simplified Chinese.
- Keep local-demo mode available without hosted Supabase or GitHub credentials.

**Non-Goals:**

- Adding password, email magic-link, SSO, or multi-provider account linking in this change.
- Building account management, billing, team invite, or profile editing surfaces.
- Replacing Supabase Auth or implementing custom OAuth token exchange.
- Moving local Claude Code execution to hosted infrastructure.

## Decisions

### Use Supabase GitHub OAuth as the single production provider

Supabase already issues the JWTs that Control Plane validates. Using Supabase's GitHub provider keeps Web, Desktop, and iOS on one session model and avoids custom OAuth token exchange code.

Alternatives considered:

- Direct GitHub OAuth in each client: more control, but duplicates token exchange and session storage.
- Email magic-link first: lower provider setup complexity, but the explicit product requirement is GitHub login.

### Keep auth orchestration outside the shared workbench model

The shared workbench should only render authenticated app state. Each host app owns the pre-workbench auth shell, obtains a session, and then passes an authenticated Control Plane client into the workbench flow.

Alternatives considered:

- Put auth inside `@agenthub/ui` workbench: easier shared rendering, but it couples core workspace UI to provider-specific login.
- Let Control Plane serve login pages: would mix API service and frontend shell responsibilities.

### Desktop uses external browser login with native callback handling

Desktop SHALL open GitHub OAuth in the user's default browser through Supabase. The callback returns to Desktop through a registered app protocol or loopback callback, and the Desktop shell persists the resulting Supabase session for subsequent launches.

Alternatives considered:

- Embedded BrowserWindow login: simpler callback plumbing but worse security posture and provider compatibility.
- Manual copy/paste auth codes: useful fallback later, but not the primary UX.

### iOS uses native system authentication session

iOS SHALL use `ASWebAuthenticationSession` or the platform equivalent so GitHub OAuth happens in the system browser context and returns to the app with a configured callback URL.

Alternatives considered:

- Embedded WebView login: not appropriate for OAuth provider login.
- Opening Safari without return handling: leaves session completion ambiguous.

## Risks / Trade-offs

- GitHub OAuth callback URLs are misconfigured -> Document Web/Desktop/iOS redirect URL requirements and show actionable client errors when callback completion fails.
- Desktop protocol registration differs by packaged and development builds -> Support development loopback or dev protocol configuration, and test callback parsing separately from OS registration.
- Session persistence differs by platform -> Keep session storage behind platform-specific adapters with common session-state tests.
- Login UI may drift across clients -> Define common states and localization keys, while allowing native controls on iOS and Desktop/Web shell-specific layouts.
- Local-demo mode could leak into production -> Production auth mode must require Supabase session and never accept the local demo token.

## Migration Plan

1. Add shared auth state model, provider labels, and localized login strings.
2. Implement Web login shell and sign-out around the existing authenticated Web app.
3. Add Desktop OAuth launch and callback handling, then wire Desktop shell login to the shared Web login state.
4. Add native iOS login view, session handling, callback handling, and sign-out.
5. Verify local-demo mode still bypasses OAuth in development.
6. Verify production mode blocks private data until GitHub login succeeds.
7. Document required Supabase GitHub provider and redirect URL configuration.
