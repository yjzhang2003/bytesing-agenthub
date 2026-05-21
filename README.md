# AgentHub

AgentHub is a personal multi-agent control plane for developer workflows. Desktop, Web, and iOS clients share one account-backed experience, while local execution runs through a Desktop Runtime that can launch Claude Code in user-owned workspaces.

## Current Scope

- Account-first platform using Supabase.
- Desktop Runtime for local execution and git/diff access.
- Claude Code local process adapter as the first real provider.
- Multi-agent IM conversations with Orchestrator-led Plan Mode.
- Permission gateway for risky file and command actions.
- Code and diff artifacts with local-first source privacy.

## Repository Layout

- `apps/web`: Web client.
- `apps/desktop`: Electron desktop shell.
- `apps/ios`: iOS placeholder for the future SwiftUI client.
- `packages/contracts`: shared TypeScript domain types, events, and schemas.
- `packages/ui`: shared React UI package for Desktop/Web.
- `services/control-plane`: Node control plane API.
- `runtimes/desktop`: Desktop Runtime process.
- `adapters/claude-code`: Claude Code local process adapter.
- `supabase`: migrations and seed data.
- `docs`: product, UI, and developer documentation.

## Development

```bash
pnpm install
pnpm check
```

See `docs/development/local-setup.md` for environment and process topology.

