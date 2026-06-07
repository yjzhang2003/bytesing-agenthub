## Context

AgentHub staging now uses Supabase Auth as the account authority and Control Plane validates
Supabase access tokens, including the current ES256/JWKS signing mode. The public Web surface has a
product homepage and a dedicated login page, but the only user-facing sign-in action is GitHub OAuth.

Supabase Auth already supports email/password signup, sign-in, and password recovery without adding
custom password storage to AgentHub. That makes first-party AgentHub account login mostly a Web auth
surface and Supabase configuration change; Control Plane should continue to trust the resulting
Supabase JWT subject regardless of provider.

## Goals / Non-Goals

**Goals:**

- Add Web email/password account login alongside GitHub OAuth.
- Add Web signup and password reset flows backed by Supabase Auth.
- Keep GitHub OAuth working and available from the same login surface.
- Keep Control Plane provider-agnostic by validating Supabase JWTs, not auth provider type.
- Add English and Simplified Chinese product chrome for account login, signup, password reset,
  validation, pending, success, and error states.
- Document Supabase Email Auth and redirect URL configuration needed for staging.

**Non-Goals:**

- Store passwords or password hashes in AgentHub-owned tables or services.
- Build custom account management, billing, profile settings, organization invites, or MFA.
- Add Desktop or iOS email/password login UI in this change.
- Remove GitHub OAuth.
- Change account ownership semantics or migrate existing Supabase users.

## Decisions

### Use Supabase Email Auth for first-party accounts

The Web client SHALL use Supabase `signInWithPassword`, `signUp`, `resetPasswordForEmail`, and
`updateUser` for email/password and password recovery. AgentHub will not implement a custom password
database or custom credential exchange.

Alternative considered: build an AgentHub-owned account service. That would give more control over
branding and account policy, but it duplicates Supabase security-sensitive behavior and would require
new server-side storage, hashing, reset tokens, and rate-limit design.

### Keep Control Plane session validation provider-agnostic

Control Plane SHALL continue authenticating only the Supabase JWT subject. It SHOULD NOT reject or
branch on whether the session came from GitHub or email/password unless a later policy requirement
needs provider-level authorization.

Alternative considered: require GitHub-linked identities for Control Plane access. That preserves the
current mental model but defeats the purpose of first-party AgentHub accounts.

### Make Web the first supported email-account client

The first implementation SHALL support email/password account login on Web. Desktop and iOS continue
to use the existing GitHub browser-login flow until separate native UX work is scoped.

Alternative considered: add Web, Desktop, and iOS email login together. That would be more complete,
but password reset deep links, native secure text entry, and platform-specific callback behavior would
make the first change too broad.

### Add login modes inside the dedicated login page

The existing `/login` page SHALL become a multi-method auth surface with a primary email account form
and a GitHub OAuth action. It should support switching between sign-in, signup, forgot-password, and
set-new-password states without turning the product homepage into an account form.

Alternative considered: create separate `/signup` and `/reset-password` pages first. Separate routes
may still be useful for reset callbacks, but a single focused auth surface keeps the initial Web
implementation smaller and easier to localize.

### Use explicit reset callback handling

Password recovery SHALL send users back to an AgentHub-owned Web route, such as
`/auth/reset-password`, that can process the Supabase recovery session and collect the new password.
The hosted SPA fallback must serve this route the same way it serves `/login` and `/auth/callback`.

Alternative considered: rely only on Supabase-hosted reset pages. That is simpler, but it breaks the
AgentHub-owned account experience and gives less control over localization and post-reset routing.

## Risks / Trade-offs

- [Risk] Email Auth settings are disabled or confirmation redirects are missing in Supabase. ->
  Mitigate with deployment runbook checks and staging smoke against signup and password reset.
- [Risk] Password form UI introduces more error states than OAuth. -> Mitigate with explicit auth
  state modeling, focused validation, and tests for pending/success/failure.
- [Risk] Account duplication between GitHub and email identities creates user confusion. -> Mitigate
  by documenting that identity linking is out of scope and by keeping provider labels explicit.
- [Risk] Password reset callback routes can 404 on Vercel. -> Mitigate with SPA rewrite coverage for
  `/auth/reset-password`.
- [Risk] Desktop/iOS appear inconsistent because they remain GitHub-only. -> Mitigate by scoping the
  copy as Web account login and leaving native email login to follow-up changes.

## Migration Plan

1. Enable Supabase Email Auth in staging and configure confirmation/recovery redirect URLs for the
   hosted Web app.
2. Add Web email auth helpers and route/view states for login, signup, forgot password, and reset.
3. Extend shared login UI with email forms and provider choices.
4. Verify Web signup, login, sign-out, password reset, GitHub login, and Control Plane access.
5. Record staging evidence and required Supabase settings in the deployment runbook.

Rollback strategy:

- Disable the email/password controls in Web while keeping GitHub OAuth unchanged.
- Keep Supabase Email Auth configuration in place if users were created, but hide the AgentHub UI
  entry until reset/login issues are fixed.

## Open Questions

- Should email signup require confirmation before first login, or should staging allow immediate
  login while production requires confirmation?
- Should the first Web form default to sign-in or present GitHub and email as equal choices?
- Should the public product homepage add a direct "Create account" CTA, or should all account
  creation start from `/login`?
