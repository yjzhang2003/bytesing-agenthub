## Why

The deployed web entrypoint currently shows a sparse authentication card and error state, which makes AgentHub look like an internal control-plane gate rather than a real product. Now that staging web, Supabase auth, and hosted Control Plane deployment are coming online, the public web surface needs a clear product homepage and a dedicated login page that introduce AgentHub before asking users to authenticate.

## What Changes

- Add a public product homepage as the unauthenticated web root for AgentHub.
- Add a dedicated login page that keeps GitHub authentication focused, trustworthy, and recoverable without doubling as the homepage.
- Separate marketing/product content from the authenticated workspace workbench so signed-in users still land in the app rather than a promotional page.
- Improve unauthenticated error, loading, callback, and retry states for GitHub sign-in.
- Fix the deployed web callback route so Supabase can return to `/auth/callback` without Vercel serving a 404.
- Verify the deployed Control Plane URL used by Vercel resolves to a Render service whose `/health` endpoint is publicly reachable.
- Add bilingual product-owned copy for the homepage and login page.
- Add responsive visual QA expectations for desktop and mobile web sizes.

## Capabilities

### New Capabilities

- `product-homepage`: Public AgentHub product homepage content, navigation, responsive layout, and conversion paths.
- `authentication-landing-experience`: Dedicated unauthenticated login page, OAuth entry, callback/error handling, and signed-in redirect behavior.

### Modified Capabilities

- `visual-design-system`: Clarify that public product/marketing pages may use a distinct product-homepage composition while the authenticated workbench keeps the compact console visual system.
- `localized-product-experience`: Require English and Simplified Chinese coverage for public homepage and login page product chrome.

## Impact

- Affected web app routes and render flow in `apps/web`.
- Affected Vercel static hosting fallback/rewrite configuration for SPA routes such as `/auth/callback`.
- Affected staging environment verification for `VITE_CONTROL_PLANE_URL` and the Render service hostname.
- Affected shared UI components, styles, and translation catalogs in `packages/ui`.
- GitHub OAuth start/callback handling and auth-session tests in `apps/web`.
- Visual QA screenshots or browser checks for public homepage, login page, auth error, callback/loading, signed-in redirect, and mobile layouts.
