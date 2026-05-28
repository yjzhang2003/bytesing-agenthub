# CI/CD and Release Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first production-ready delivery loop for AgentHub: reliable CI, hosted login/control-plane services, web deployment, and signed desktop release artifacts.

**Architecture:** Keep the current local-first runtime model. Host account/login and shared state behind the Control Plane, deploy Web as the browser shell, and package Desktop as the local bridge that connects hosted UI to local runtime capabilities.

**Tech Stack:** pnpm workspace, TypeScript, Vitest, Vite, Electron, Supabase Auth, GitHub Actions, GitHub Releases, and a production host for Control Plane/Web.

---

## Current Findings

- There is no `.github/workflows` directory yet.
- Root scripts already provide a usable CI spine: `pnpm format:check`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm check:ui-boundaries`, and `pnpm build`.
- Desktop currently supports `build`, `check:electron`, and `dev`, but does not have installer packaging, signing, notarization, or release scripts.
- Control Plane already supports `AGENTHUB_AUTH_MODE=supabase` and verifies Supabase HS256 JWTs through `SUPABASE_JWT_SECRET`.
- Web currently sends a static local token by default through `VITE_AGENTHUB_LOCAL_AUTH_TOKEN`; production login needs a Supabase session source instead.

## File Structure

- Create `.github/workflows/ci.yml`: pull request and main-branch validation.
- Create `.github/workflows/release-desktop.yml`: tag-triggered desktop package build and release upload.
- Create `openspec/changes/production-auth-release-pipeline/*`: specification for auth, deployment, release, and update behavior.
- Modify `package.json`: add focused CI entrypoints if root `check` is too broad or unstable for CI.
- Modify `apps/web/src/control-plane-client.ts`: consume authenticated Supabase access tokens in production.
- Create `apps/web/src/auth-session.ts`: small Supabase session adapter for Web.
- Modify `apps/web/src/main.tsx`: gate private workbench loading on authenticated session when production auth is enabled.
- Modify `apps/desktop/package.json`: add packaging scripts.
- Create `apps/desktop/electron-builder.yml`: macOS packaging configuration first, leaving Windows/Linux for later changes.
- Modify `apps/desktop/src/shell-config.ts`: support a production web URL default at build/runtime.
- Modify `services/control-plane/package.json`: add `start` script for built production server.
- Create `services/control-plane/Dockerfile`: deployable Control Plane image.
- Modify `services/control-plane/src/config.ts`: fail closed when `AGENTHUB_AUTH_MODE=supabase` is set without `SUPABASE_JWT_SECRET`.
- Add tests next to changed code in `apps/web`, `apps/desktop`, and `services/control-plane` where behavior changes.

## Phase 1: OpenSpec Proposal

### Task 1: Specify Production Auth and Release Pipeline

**Files:**
- Create: `openspec/changes/production-auth-release-pipeline/proposal.md`
- Create: `openspec/changes/production-auth-release-pipeline/design.md`
- Create: `openspec/changes/production-auth-release-pipeline/tasks.md`
- Create: `openspec/changes/production-auth-release-pipeline/specs/account-sync/spec.md`
- Create: `openspec/changes/production-auth-release-pipeline/specs/local-runnable-topology/spec.md`
- Create: `openspec/changes/production-auth-release-pipeline/specs/desktop-capability-bridge/spec.md`

- [ ] **Step 1: Create the OpenSpec change skeleton**

Run:

```bash
mkdir -p openspec/changes/production-auth-release-pipeline/specs/account-sync
mkdir -p openspec/changes/production-auth-release-pipeline/specs/local-runnable-topology
mkdir -p openspec/changes/production-auth-release-pipeline/specs/desktop-capability-bridge
```

Expected: directories exist.

- [ ] **Step 2: Write `proposal.md`**

```markdown
# Production Auth and Release Pipeline

## Why

AgentHub needs a repeatable delivery path before more desktop features depend on account state, hosted login, and downloadable desktop builds.

## What Changes

- Add CI validation for pull requests and main.
- Add production Supabase login mode for Web/Desktop to call Control Plane with user JWTs.
- Make Control Plane deployable with fail-closed production auth configuration.
- Add macOS Desktop packaging and release artifact publishing.

## Impact

- Affects Web auth bootstrap, Control Plane config, Desktop packaging, and repository CI.
- Does not change the current local-demo development path.
```

- [ ] **Step 3: Write `tasks.md`**

```markdown
# Tasks

- [ ] Add CI workflow for install, format, typecheck, lint, tests, OpenSpec validation, and build.
- [ ] Add production Control Plane start configuration and Docker image.
- [ ] Add Web Supabase session adapter and production auth bootstrap.
- [ ] Add Desktop packaging scripts and macOS release workflow.
- [ ] Document required deployment secrets and release procedure.
- [ ] Verify local-demo mode still works without Supabase secrets.
```

- [ ] **Step 4: Validate proposal**

Run:

```bash
openspec validate production-auth-release-pipeline --strict
```

Expected: proposal validates or reports only missing delta details to fill before implementation.

- [ ] **Step 5: Commit proposal**

```bash
git add openspec/changes/production-auth-release-pipeline
git commit -m "docs(openspec): propose production auth release pipeline"
```

## Phase 2: CI Baseline

### Task 2: Add Pull Request CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Add workflow**

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Enable Corepack
        run: corepack enable

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Format
        run: pnpm format:check

      - name: Typecheck
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test

      - name: UI boundaries
        run: pnpm check:ui-boundaries

      - name: OpenSpec
        run: openspec validate --specs --strict

      - name: Build
        run: pnpm build
```

- [ ] **Step 2: Run equivalent checks locally**

Run:

```bash
pnpm format:check
pnpm typecheck
pnpm lint
pnpm test
openspec validate --specs --strict
pnpm build
```

Expected: all commands pass.

- [ ] **Step 3: Commit CI workflow**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add baseline verification workflow"
```

## Phase 3: Production Auth Server

### Task 3: Make Control Plane Production Deployable

**Files:**
- Modify: `services/control-plane/package.json`
- Modify: `services/control-plane/src/config.ts`
- Create: `services/control-plane/Dockerfile`
- Test: `services/control-plane/src/config.test.ts`

- [ ] **Step 1: Add production start script**

Change `services/control-plane/package.json` scripts to include:

```json
{
  "build": "tsc -p tsconfig.json",
  "dev": "AGENTHUB_CONTROL_PLANE_ENTRY=1 tsx src/index.ts",
  "start": "AGENTHUB_CONTROL_PLANE_ENTRY=1 node dist/index.js",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 2: Fail closed for missing Supabase secret**

In `services/control-plane/src/config.ts`, after reading `authMode`, add:

```ts
const jwtSecret = env.SUPABASE_JWT_SECRET ?? "";
if (authMode === "supabase" && !jwtSecret) {
  throw new Error("SUPABASE_JWT_SECRET is required when AGENTHUB_AUTH_MODE=supabase");
}
```

Return `jwtSecret: jwtSecret || "dev-only-secret"` so local-demo remains unchanged.

- [ ] **Step 3: Add config tests**

Create `services/control-plane/src/config.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { readControlPlaneConfig } from "./config";

describe("readControlPlaneConfig", () => {
  it("keeps local-demo mode usable without Supabase secrets", () => {
    const config = readControlPlaneConfig({});
    expect(config.authMode).toBe("local-demo");
    expect(config.jwtSecret).toBe("dev-only-secret");
  });

  it("requires SUPABASE_JWT_SECRET in Supabase mode", () => {
    expect(() => readControlPlaneConfig({ AGENTHUB_AUTH_MODE: "supabase" })).toThrow(
      "SUPABASE_JWT_SECRET is required",
    );
  });

  it("accepts Supabase mode with a JWT secret", () => {
    const config = readControlPlaneConfig({
      AGENTHUB_AUTH_MODE: "supabase",
      SUPABASE_JWT_SECRET: "secret",
    });
    expect(config.authMode).toBe("supabase");
    expect(config.jwtSecret).toBe("secret");
  });
});
```

- [ ] **Step 4: Add Dockerfile**

Create `services/control-plane/Dockerfile`:

```dockerfile
FROM node:24-bookworm-slim AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY services/control-plane/package.json services/control-plane/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN pnpm install --frozen-lockfile --filter @agenthub/control-plane...

FROM deps AS build
COPY packages/contracts packages/contracts
COPY services/control-plane services/control-plane
RUN pnpm --filter @agenthub/control-plane build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV AGENTHUB_CONTROL_PLANE_ENTRY=1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/control-plane/node_modules ./services/control-plane/node_modules
COPY --from=deps /app/packages/contracts/node_modules ./packages/contracts/node_modules
COPY --from=build /app/services/control-plane/dist ./services/control-plane/dist
COPY --from=build /app/services/control-plane/package.json ./services/control-plane/package.json
COPY --from=build /app/packages/contracts ./packages/contracts
CMD ["node", "services/control-plane/dist/index.js"]
```

- [ ] **Step 5: Verify**

Run:

```bash
pnpm --filter @agenthub/control-plane typecheck
pnpm vitest run services/control-plane/src/config.test.ts
docker build -f services/control-plane/Dockerfile .
```

Expected: typecheck and test pass; Docker image builds.

- [ ] **Step 6: Commit**

```bash
git add services/control-plane
git commit -m "feat(control-plane): add production deploy configuration"
```

## Phase 4: Web Login

### Task 4: Use Supabase Session Tokens in Production Web

**Files:**
- Create: `apps/web/src/auth-session.ts`
- Modify: `apps/web/src/control-plane-client.ts`
- Modify: `apps/web/src/main.tsx`
- Test: `apps/web/src/auth-session.test.ts`

- [ ] **Step 1: Add auth session adapter**

Create `apps/web/src/auth-session.ts`:

```ts
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

export interface WebAuthSession {
  readonly accessToken: string;
  readonly userId: string;
}

export function createWebSupabaseClient(env: ImportMetaEnv = import.meta.env): SupabaseClient | null {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    return null;
  }
  return createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
}

export function sessionFromSupabase(session: Session | null): WebAuthSession | null {
  if (!session?.access_token || !session.user.id) {
    return null;
  }
  return {
    accessToken: session.access_token,
    userId: session.user.id,
  };
}
```

- [ ] **Step 2: Add adapter tests**

Create `apps/web/src/auth-session.test.ts` with a focused `sessionFromSupabase` null/valid test using a minimal object cast to `Session`.

- [ ] **Step 3: Bootstrap Web client from session**

In `apps/web/src/main.tsx`, load the Supabase session before constructing the Control Plane client when `VITE_AGENTHUB_AUTH_MODE=supabase`. Keep the current local-demo client path unchanged.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm --filter @agenthub/web typecheck
pnpm vitest run apps/web/src/auth-session.test.ts
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add apps/web
git commit -m "feat(web): use Supabase session for production auth"
```

## Phase 5: Desktop Packaging

### Task 5: Add macOS Desktop Package Build

**Files:**
- Modify: `apps/desktop/package.json`
- Create: `apps/desktop/electron-builder.yml`
- Modify: `apps/desktop/src/shell-config.ts`

- [ ] **Step 1: Add packaging dependency and scripts**

Run:

```bash
pnpm --filter @agenthub/desktop add -D electron-builder
```

Then add scripts:

```json
{
  "pack": "pnpm build && electron-builder --dir",
  "dist": "pnpm build && electron-builder"
}
```

- [ ] **Step 2: Add macOS package config**

Create `apps/desktop/electron-builder.yml`:

```yaml
appId: com.agenthub.desktop
productName: AgentHub
directories:
  output: release
files:
  - dist/**
  - package.json
mac:
  category: public.app-category.developer-tools
  target:
    - dmg
    - zip
asar: true
```

- [ ] **Step 3: Make production web URL explicit**

In `apps/desktop/src/shell-config.ts`, keep local development default but allow release builds to set:

```ts
webUrl: process.env.AGENTHUB_WEB_URL ?? "http://127.0.0.1:5173",
```

The release workflow must pass `AGENTHUB_WEB_URL` as a secret or repository variable.

- [ ] **Step 4: Verify unsigned local packaging**

Run:

```bash
pnpm --filter @agenthub/desktop dist
```

Expected: unsigned local artifacts appear under `apps/desktop/release`.

- [ ] **Step 5: Commit**

```bash
git add apps/desktop pnpm-lock.yaml
git commit -m "feat(desktop): add macos package build"
```

## Phase 6: Desktop Release Workflow

### Task 6: Publish Desktop Artifacts on Tags

**Files:**
- Create: `.github/workflows/release-desktop.yml`

- [ ] **Step 1: Add tag-triggered release workflow**

```yaml
name: Release Desktop

on:
  push:
    tags:
      - "v*"

permissions:
  contents: write

jobs:
  macos:
    runs-on: macos-latest
    timeout-minutes: 30

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Enable Corepack
        run: corepack enable

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Verify
        run: pnpm check

      - name: Build Desktop
        env:
          AGENTHUB_WEB_URL: ${{ vars.AGENTHUB_WEB_URL }}
        run: pnpm --filter @agenthub/desktop dist

      - name: Publish GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: apps/desktop/release/*
```

- [ ] **Step 2: Configure repository variables and secrets**

Required repository variable:

```text
AGENTHUB_WEB_URL=https://app.agenthub.example
```

Required later for signed distribution:

```text
APPLE_ID
APPLE_APP_SPECIFIC_PASSWORD
APPLE_TEAM_ID
CSC_LINK
CSC_KEY_PASSWORD
```

- [ ] **Step 3: Verify release workflow syntax**

Run:

```bash
pnpm check
```

Expected: repository checks pass. Workflow runtime validation occurs on the first tag push.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/release-desktop.yml
git commit -m "ci: publish desktop release artifacts"
```

## Phase 7: Deployment Runbook

### Task 7: Document Server and Release Procedure

**Files:**
- Create: `docs/development/deployment-runbook.md`

- [ ] **Step 1: Add runbook**

```markdown
# Deployment Runbook

## Services

- Web: deploy `apps/web` with `VITE_CONTROL_PLANE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_AGENTHUB_AUTH_MODE=supabase`.
- Control Plane: deploy `services/control-plane` with `AGENTHUB_AUTH_MODE=supabase`, `SUPABASE_JWT_SECRET`, and `CONTROL_PLANE_PORT`.
- Desktop: publish macOS artifacts from GitHub Releases.

## Release

1. Confirm `pnpm check` passes on main.
2. Confirm `openspec list --json` has no unexpected active production-release changes.
3. Create tag: `git tag v0.1.0`.
4. Push tag: `git push origin v0.1.0`.
5. Download the GitHub Release artifact and run the smoke path: launch Desktop, sign in, check Claude Code connection, start one local run.

## Rollback

- Web: redeploy previous successful build.
- Control Plane: redeploy previous container image.
- Desktop: mark the broken GitHub Release as pre-release or remove the downloadable asset, then publish a patched tag.
```

- [ ] **Step 2: Commit**

```bash
git add docs/development/deployment-runbook.md
git commit -m "docs: add deployment runbook"
```

## Execution Order

1. Write OpenSpec proposal first.
2. Add CI baseline before changing production auth.
3. Deployable Control Plane comes before Web production login.
4. Web login comes before public Desktop release.
5. Desktop unsigned package comes before signed/notarized package.
6. Release workflow comes after local packaging works.

## Initial Server Recommendation

Start with one staging environment before production:

- `app.agenthub.example`: Web static app.
- `api.agenthub.example`: Control Plane service.
- Supabase project: Auth and owned account data.
- GitHub Releases: Desktop artifacts.

Keep Desktop local runtime and Claude Code execution on the user's machine. Do not move Claude Code execution to the hosted server unless a separate security and tenancy design is written.
