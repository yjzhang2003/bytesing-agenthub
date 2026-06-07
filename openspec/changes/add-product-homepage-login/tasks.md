## 1. Route and Auth Flow Structure

- [x] 1.1 Audit the current web unauthenticated render flow, auth session initialization, callback handling, and signed-in workbench entry points.
- [x] 1.2 Introduce explicit web route/view states for public homepage, login page, OAuth callback processing, and authenticated workbench.
- [x] 1.3 Route unauthenticated `/` visitors to the product homepage while routing authenticated `/` visitors to the workspace workbench.
- [x] 1.4 Route unauthenticated `/login` visitors to the dedicated login page while routing authenticated `/login` visitors to the workspace workbench.
- [x] 1.5 Preserve existing GitHub OAuth callback behavior while ensuring callback processing does not show a premature sign-in failure.
- [x] 1.6 Add or verify Vercel SPA fallback/rewrite behavior so direct requests to `/login` and `/auth/callback` return the app shell instead of hosting-provider 404.
- [x] 1.7 Verify the staged Supabase GitHub authorize URL still redirects to GitHub with `redirect_to=https://agenthub-staging.vercel.app/auth/callback`.

## 2. Product Homepage

- [x] 2.1 Define AgentHub homepage content for product positioning, primary value proposition, and MVP-accurate feature sections.
- [x] 2.2 Build the homepage layout for desktop with product identity, navigation, first-viewport value proposition, primary sign-in CTA, and concrete product evidence.
- [x] 2.3 Build the homepage mobile layout with stacked content, readable typography, accessible CTAs, and no horizontal overflow.
- [x] 2.4 Add product evidence panels that represent workspaces, agents, permissions, runs, artifacts, or local runtime status without requiring authenticated data.
- [x] 2.5 Ensure homepage copy avoids unavailable MVP claims such as team spaces, hosted cloud runtime execution, deployment publishing, billing, or GitHub PR workflows.

## 3. Dedicated Login Page

- [x] 3.1 Build the login page as a focused trust surface with product identity, GitHub sign-in action, concise access explanation, and return link to the homepage.
- [x] 3.2 Implement ready, pending, callback/loading, success redirect, failure, and missing-configuration login states.
- [x] 3.3 Make retry clear transient auth failure state and return to a usable login state or restart the login flow.
- [x] 3.4 Prevent duplicate OAuth submissions while a login request or callback is pending.
- [x] 3.5 Ensure login errors are actionable and do not expose raw internal stack traces, secrets, or noisy implementation details.
- [x] 3.6 Ensure the initial unauthenticated state is presented as a normal sign-in prompt rather than a failed login.
- [x] 3.7 Distinguish OAuth/session failures from post-login Control Plane reachability failures in the UI state model.

## 4. Visual System and Shared UI

- [x] 4.1 Add or adapt shared UI primitives/styles needed for public product pages without disrupting compact authenticated workbench styling.
- [x] 4.2 Apply a product-homepage visual mode that is richer than the workbench but avoids generic AI landing-page tropes, purple gradients, decorative orb backgrounds, and abstract-only visuals.
- [x] 4.3 Keep button, alert, focus, spacing, text overflow, and responsive behavior aligned with AgentHub-owned tokens.
- [x] 4.4 Verify public homepage and login layouts do not introduce nested card-heavy composition or incoherent text overlap.

## 5. Localization

- [x] 5.1 Add English and Simplified Chinese translation keys for homepage navigation, hero copy, feature labels, CTAs, product evidence labels, and footer chrome.
- [x] 5.2 Add English and Simplified Chinese translation keys for login title, trust copy, GitHub sign-in action, pending state, callback state, error state, retry action, and homepage return link.
- [x] 5.3 Ensure provider names, URLs, commands, product identifiers, runtime names, and example workspace values remain source content rather than translated chrome.
- [x] 5.4 Extend localization coverage tests for homepage and login strings in English and Simplified Chinese.

## 6. Verification

- [x] 6.1 Add unit or render tests for unauthenticated homepage, unauthenticated login, signed-in root redirect, signed-in login redirect, callback processing, auth failure, retry, and missing configuration states.
- [x] 6.2 Run web typecheck and relevant test suites for auth-session, app-state, desktop API integration boundaries, and shared UI localization.
- [x] 6.3 Run browser verification against the local web app for desktop homepage, mobile homepage, desktop login, mobile login, pending/callback state, and auth error state.
- [x] 6.4 Verify `https://agenthub-staging.vercel.app/auth/callback` returns the SPA shell, not Vercel 404.
- [ ] 6.5 Verify the deployed `VITE_CONTROL_PLANE_URL` value matches the live Render service hostname and `${VITE_CONTROL_PLANE_URL}/health` returns the AgentHub health payload.
- [ ] 6.6 After deployment, verify the staging homepage no longer renders the bare login card and the login page remains reachable and usable.
- [x] 6.7 Document any required Supabase/GitHub redirect URL updates if route separation changes callback URLs.
