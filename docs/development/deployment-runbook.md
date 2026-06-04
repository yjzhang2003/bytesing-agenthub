# Deployment Runbook

## Service Layout

Staging and production use the same shape:

- Web: hosted static app for `apps/web`.
- Control Plane: hosted Node service for `services/control-plane`.
- Supabase: Auth provider and account-owned data backend.
- Desktop: macOS package artifacts published from GitHub Releases.

Desktop Runtime and Claude Code execution stay on the user's machine. Hosted services coordinate identity, account-scoped metadata, runtime registration, command delivery, and Web shell access.

## Staging Baseline

The completed `add-cross-platform-github-login` and `production-auth-release-pipeline` changes are the staging baseline. Keep both changes unarchived until staging smoke has proved the hosted login and release flow, then archive them with the staging evidence available for reference.

Initial staging provider choices:

- Web: Vercel static deployment for `apps/web`.
- Control Plane: Render Web Service for `services/control-plane`.
- Supabase: dedicated staging Supabase project with GitHub Auth enabled.
- Desktop artifacts: GitHub Releases from the existing tag-triggered workflow.

Initial staging URLs:

```text
Web: https://agenthub-staging.vercel.app
Control Plane: https://agenthub-control-plane-staging.onrender.com
Supabase: https://ymzmsdwxmgmwxwtexvow.supabase.co
Desktop callback: agenthub://auth/callback
iOS callback: agenthub-ios://auth/callback
Local Web callback: http://127.0.0.1:5173/auth/callback
```

Secrets and non-committed values:

```text
Supabase JWT secret: Render secret environment variable SUPABASE_JWT_SECRET
Supabase publishable key: Vercel encrypted environment variable VITE_SUPABASE_ANON_KEY and GitHub repository variable VITE_SUPABASE_ANON_KEY
Supabase project URL: Vercel encrypted environment variable VITE_SUPABASE_URL and GitHub repository variable VITE_SUPABASE_URL
GitHub OAuth client secret: Supabase Auth provider dashboard
Deployment provider tokens: Vercel, Render, and GitHub secret stores only
```

## Environment

Local-demo development:

```text
AGENTHUB_AUTH_MODE=local-demo
AGENTHUB_LOCAL_AUTH_TOKEN=agenthub-local-demo-token
AGENTHUB_CONTROL_PLANE_URL=http://127.0.0.1:5310
AGENTHUB_WEB_URL=http://127.0.0.1:5173
VITE_CONTROL_PLANE_URL=http://127.0.0.1:5310
VITE_AGENTHUB_LOCAL_AUTH_TOKEN=agenthub-local-demo-token
```

Staging and production Web:

```text
VITE_AGENTHUB_AUTH_MODE=supabase
VITE_CONTROL_PLANE_URL=https://agenthub-control-plane-staging.onrender.com
VITE_SUPABASE_URL=https://ymzmsdwxmgmwxwtexvow.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_f1y1Jdh3IZYu0WCCq8wzSQ_yomvF0ff
```

Vercel must serve the SPA shell for browser-owned routes such as `/login` and `/auth/callback`.
The web project keeps this fallback in `apps/web/vercel.json`; direct requests to
`https://agenthub-staging.vercel.app/auth/callback` should return the app shell rather than a
Vercel `404`.

Staging and production Control Plane:

```text
AGENTHUB_AUTH_MODE=supabase
SUPABASE_JWT_SECRET=<supabase-jwt-secret>
CONTROL_PLANE_PORT=5310
AGENTHUB_PROVIDER_MODE=claude-code
```

The Control Plane URL configured in Vercel must match the live Render service hostname. Verify
`${VITE_CONTROL_PLANE_URL}/health` from the public internet; it should return the AgentHub Control
Plane health payload. A Render routing response such as `x-render-routing: no-server` means the URL
or hostname binding is stale even if the latest Render build succeeded.

Supabase GitHub Auth:

- Enable the GitHub provider in Supabase Auth with the GitHub OAuth app client ID and secret.
- Add the hosted Web callback to the Supabase allowed redirect URLs:
  `https://agenthub-staging.vercel.app/auth/callback`.
- Add the Desktop callback URL used by packaged builds:
  `agenthub://auth/callback`.
- Add the iOS callback URL scheme configured in the native app:
  `agenthub-ios://auth/callback`.
- For local Web verification, add the Vite dev callback:
  `http://127.0.0.1:5173/auth/callback`.
- Keep provider names such as `github` and callback URLs unchanged in diagnostics so redirect mismatches can be copied directly into Supabase or GitHub OAuth settings.

Current staging Supabase status:

- Project ref `ymzmsdwxmgmwxwtexvow` is linked through Supabase CLI.
- Remote Auth `site_url` and redirect allow list are synced from `supabase/config.toml`.
- Initial database migration `202605210001_initial_agenthub_schema.sql` is applied to the remote project.
- GitHub provider is enabled with OAuth client ID `Ov23liyQA7u7WwWQqz2L`; the client secret is injected during `supabase config push` through `SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET` and is not committed.
- Supabase GitHub authorize verification returns a GitHub OAuth redirect for the staging Web callback.

Desktop release repository variables:

```text
AGENTHUB_CONTROL_PLANE_URL=https://agenthub-control-plane-staging.onrender.com
AGENTHUB_WEB_URL=https://agenthub-staging.vercel.app
```

Future signed macOS release secrets:

```text
APPLE_ID=<apple-id-email>
APPLE_APP_SPECIFIC_PASSWORD=<app-specific-password>
APPLE_TEAM_ID=<team-id>
CSC_LINK=<base64-or-url-certificate>
CSC_KEY_PASSWORD=<certificate-password>
```

## Release Procedure

1. Confirm the main branch is clean and current.
2. Run `pnpm check`.
3. Run `openspec validate --specs --strict`.
4. Deploy Control Plane with production auth configuration.
5. Deploy Web with Supabase and Control Plane environment variables.
6. Create a release tag: `git tag v0.1.0`.
7. Push the release tag: `git push origin v0.1.0`.
8. Wait for the Desktop release workflow to publish GitHub Release artifacts.

## Smoke Checks

Staging smoke:

1. Open the hosted Web URL.
2. Confirm the unauthenticated root renders the public product homepage rather than the workbench or
   the bare login card.
3. Open `/login` and confirm the dedicated login page is reachable.
4. Open `/auth/callback` directly and confirm Vercel serves the app shell rather than `404`.
5. Confirm `${VITE_CONTROL_PLANE_URL}/health` returns the Control Plane health payload.
6. Sign in through Supabase.
7. Confirm private workbench data does not load before authentication.
8. Launch Desktop from the packaged artifact.
9. Confirm Desktop loads the configured Web shell.
10. Confirm Connections can check Claude Code.
11. Start one local run and verify output returns through Control Plane.

Local release build smoke:

```bash
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm --filter @agenthub/desktop run pack
pnpm smoke:desktop-bridge
```

## Rollback

Web rollback:

- Redeploy the previous successful Web build.
- Verify the previous build still points to the intended Control Plane URL.

Control Plane rollback:

- Redeploy the previous service image or artifact.
- Confirm `AGENTHUB_AUTH_MODE=supabase` still has `SUPABASE_JWT_SECRET` configured.

Desktop rollback:

- Mark the broken GitHub Release as pre-release or remove the broken downloadable assets.
- Publish a patched tag after local package and bridge smoke verification pass.

## First Tag Dry Run

Use a staging tag such as `v0.1.0-staging.1` only after repository variables are configured. The expected result is a GitHub Release with macOS artifacts under `apps/desktop/release`. Public distribution remains gated on signed and notarized artifacts.
