## 1. Supabase Account Auth Baseline

- [x] 1.1 Confirm staging Supabase Email Auth settings for signup, confirmation, password minimum length, and recovery redirect behavior.
- [x] 1.2 Add hosted Web email auth redirect URLs to Supabase allow list, including password reset and any confirmation callback routes.
- [x] 1.3 Document staging Email Auth settings, redirect URLs, and rollback expectations in the deployment runbook.
- [x] 1.4 Verify Control Plane accepts Supabase JWTs from non-GitHub providers without provider-specific branching.

## 2. Web Auth Session Helpers

- [x] 2.1 Extend Web Supabase auth client types to cover `signInWithPassword`, `signUp`, `resetPasswordForEmail`, and `updateUser`.
- [x] 2.2 Add email/password sign-in helper with normalized success and error handling.
- [x] 2.3 Add signup helper that distinguishes active-session signup from confirmation-required signup.
- [x] 2.4 Add password reset request helper with an AgentHub-owned reset redirect URL.
- [x] 2.5 Add password update helper for reset callback completion.
- [x] 2.6 Add unit tests for helper success, Supabase error, confirmation-required, and redirect URL behavior.

## 3. Web Routing and State Model

- [x] 3.1 Extend Web auth route/view state for login, signup mode, forgot-password mode, and password-reset callback processing.
- [x] 3.2 Ensure hosted routes such as `/auth/reset-password` are served by the SPA fallback.
- [x] 3.3 Prevent unauthenticated email auth states from loading private workbench data.
- [x] 3.4 Preserve signed-in redirects from public auth routes into the workbench.
- [x] 3.5 Ensure sign-out clears private state regardless of whether the session came from GitHub or email/password.
- [x] 3.6 Add routing tests for email login, signup, forgot-password, reset callback, signed-in redirect, and sign-out.

## 4. Shared Login UI

- [x] 4.1 Extend shared auth component props and view state for email sign-in, signup, forgot-password, reset-password, pending, success, validation, and error states.
- [x] 4.2 Add email/password form controls with accessible labels, validation messages, and stable responsive layout.
- [x] 4.3 Add signup form state with confirmation-required success messaging.
- [x] 4.4 Add forgot-password and reset-password states without exposing account-existence information.
- [x] 4.5 Keep GitHub OAuth available as a distinct supported login action.
- [x] 4.6 Add render and DOM behavior tests for account auth forms, mode switching, disabled pending states, validation, and error recovery.

## 5. Localization

- [x] 5.1 Add English and Simplified Chinese keys for email sign-in, signup, forgot-password, reset-password, validation, pending, success, and error states.
- [x] 5.2 Preserve source values such as GitHub, email addresses, URLs, routes, and env var names in localized output.
- [x] 5.3 Extend localization coverage tests for account login in English, Simplified Chinese, and unsupported-locale fallback.
- [x] 5.4 Verify accessible labels and live-region/status copy follow the selected product language.

## 6. Staging Verification

- [x] 6.1 Run Web unit/render tests and relevant auth-session/control-plane tests.
- [x] 6.2 Run Web typecheck, shared UI typecheck, lint, and changed-file formatting checks.
- [ ] 6.3 Deploy Web and Control Plane if needed after code changes.
- [ ] 6.4 Verify staging GitHub login still works after adding account login.
- [ ] 6.5 Verify staging email signup flow, including confirmation-required or immediate-session behavior as configured.
- [ ] 6.6 Verify staging email/password sign-in loads the authenticated workbench.
- [ ] 6.7 Verify staging forgot-password and reset-password flow reaches the AgentHub-owned reset page and can set a new password.
- [ ] 6.8 Verify sign-out clears private state and both GitHub and email login paths can sign in again.

## 7. OpenSpec Completion

- [x] 7.1 Run `openspec validate add-agenthub-account-login --strict`.
- [x] 7.2 Confirm `openspec instructions apply --change add-agenthub-account-login --json` reports the change ready for implementation or complete after tasks are done.
