## Context

AgentHub's deployed web root currently renders the authentication gate directly. That is useful for internal staging, but it does not explain the product, establish trust, or give unauthenticated visitors a path to understand AgentHub before signing in. The authenticated app already has strong workbench-oriented constraints: compact density, workspace-first navigation, restrained console styling, and no marketing composition inside the main app.

This change separates the public web surface from the authenticated workbench. The public root becomes a product homepage. Authentication moves to a dedicated login page. Signed-in users continue to reach the workspace workbench without passing through marketing content.

Staging investigation found two deployment prerequisites that must be treated as part of this change, not as cosmetic follow-up work:

- `https://agenthub-staging.vercel.app/auth/callback` currently returns Vercel `404`, so a successful Supabase GitHub OAuth redirect cannot be processed by the SPA.
- The Vercel bundle points to `https://agenthub-control-plane-staging.onrender.com`, but that hostname currently returns Render routing `404 x-render-routing: no-server` for `/health`, while the Control Plane code exposes `/health` without authentication. The configured URL must be corrected or rebound before login can lead to a usable workbench.

## Goals / Non-Goals

**Goals:**

- Present AgentHub as a real product on the public web root.
- Provide a focused login page for GitHub OAuth with trustworthy loading, callback, error, and retry states.
- Preserve the authenticated workbench as the first screen for signed-in users.
- Keep the public homepage visually distinct from the compact app shell while still using AgentHub-owned tokens and components.
- Support English and Simplified Chinese product-owned copy.
- Verify desktop and mobile web layouts with browser screenshots or equivalent checks.
- Ensure hosted callback and Control Plane reachability are verified before treating the homepage/login deployment as healthy.

**Non-Goals:**

- Add pricing, billing, team management, cloud runtime execution, hosted preview publishing, or GitHub pull request workflows.
- Redesign the authenticated workbench.
- Add new authentication providers beyond GitHub.
- Change Supabase project configuration or GitHub OAuth application settings except where needed to support the route split.
- Build a documentation site or long-form marketing CMS.

## Decisions

### Use route-level separation between public product and app entry

The web root SHALL render the public product homepage for anonymous visitors. A dedicated `/login` route SHALL own the GitHub OAuth entry and auth error states. Authenticated users who open `/` or `/login` SHALL be routed to the workspace workbench.

Alternative considered: keep the login card as the homepage and make it visually richer. That would still make authentication the product's first impression and would not give the product room to explain itself.

### Add SPA fallback for hosted web routes

The Vercel deployment SHALL serve the web SPA for browser-owned routes such as `/login` and `/auth/callback`. A direct request to `/auth/callback` must return the app shell, not Vercel `404`, so Supabase can complete URL session detection and route the user into the app.

Alternative considered: rely only on hash-based callback URLs. That would avoid server fallback configuration but would require changing OAuth callback conventions across Supabase, Desktop, iOS, and local web behavior.

### Treat Control Plane URL reachability as deployment health

The implementation SHALL verify that `VITE_CONTROL_PLANE_URL` points to the actual Render service URL and that `${VITE_CONTROL_PLANE_URL}/health` returns the Control Plane health payload from outside Render. The product homepage can load without Control Plane access, but successful login must not route users into a workbench that immediately fails due to an invalid hostname.

Alternative considered: defer Control Plane checks to smoke testing only. That allows the public page to ship, but it hides the fact that the existing "login failed" experience is partly caused by deployment wiring rather than page design.

### Keep homepage content product-specific and implementation-realistic

The homepage SHALL describe AgentHub around workspaces, AI agent coordination, local runtime control, permission gates, and reviewable artifacts. It SHALL avoid implying unavailable MVP features such as team spaces, hosted cloud execution, deployment publishing, or GitHub PR automation.

Alternative considered: broader marketing language around "agent teams" or "cloud automation." That would look more polished but would misrepresent current product scope.

### Use a refined product-page visual mode, not the workbench shell

The public homepage MAY use a richer editorial/product composition than the authenticated workbench, including a first-viewport product narrative, product screenshots or simulated product panels, and conversion sections. It SHALL still avoid generic purple gradients, decorative orb backgrounds, dark stock imagery, and uninspectable abstract visuals.

Alternative considered: reuse the exact workbench visual system. That would be consistent, but too utilitarian for a public product page and would repeat the current "control-plane gate" feel.

### Make login a focused trust surface

The login page SHALL be concise and operational: product identity, clear GitHub sign-in action, what access means, callback/loading state, retryable error state, and a path back to the homepage. Error details SHALL be actionable without exposing internal implementation noise.

Alternative considered: place login inside a large marketing hero. That mixes conversion and recovery states and makes OAuth errors feel like homepage content.

### Localize product-owned copy through existing catalogs

Homepage and login copy SHALL use the same product localization mechanism as the web workbench. Technical values, provider names, URLs, and code-like text SHALL remain source content.

Alternative considered: hard-code homepage copy in React. That would be faster initially but would violate existing localization governance.

## Risks / Trade-offs

- Product page over-promises MVP scope -> Mitigate by tying copy to capabilities already present or explicitly framed as local-first/workspace coordination.
- Homepage design diverges too far from app identity -> Mitigate by sharing tokens, type scale primitives, and product terminology while allowing different layout composition.
- Route split breaks OAuth callback handling -> Mitigate with tests for `/`, `/login`, callback success, callback failure, retry, and signed-in redirect.
- Vercel serves direct SPA routes as 404 -> Mitigate with a Vercel rewrite/fallback check for `/login` and `/auth/callback`.
- Vercel points to a stale Render hostname -> Mitigate with a deployment health check that requires `${VITE_CONTROL_PLANE_URL}/health` to return the Control Plane service payload.
- Public page adds visual QA burden -> Mitigate with focused desktop and mobile screenshots covering only homepage and login states.
- Auth errors continue to appear from stale callback URLs -> Mitigate by making login error rendering resilient and by documenting required redirect URLs in the deployment runbook if implementation discovers missing config.
