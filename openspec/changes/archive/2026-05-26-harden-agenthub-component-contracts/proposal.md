## Why

The first AntD removal pass established an AgentHub-owned component foundation, but code review found that several exported component contracts are still compatibility-shaped or behavior-light. AgentHub needs a focused hardening pass before treating the component system as a dependable product surface.

## What Changes

- Harden behavior-heavy components so Dialog, DropdownMenu, Tooltip, Tabs, SearchInput, Toast, and LoadingState match the documented component contracts.
- Align canonical public APIs with `packages/ui/COMPONENT_SYSTEM.md`, keeping old `AgentHub*` compatibility names only as adapters where needed.
- Make `ThemeRoot` self-contained by providing component-system styling outside the full workbench shell.
- Strengthen accessibility for modal overlays, keyboard navigation, focus return, switch/icon labels, live feedback, localized loading text, and clear affordances.
- Strengthen vendor-boundary guardrails to catch forbidden class name strings as well as imports, dependencies, lockfile entries, resolved graph entries, and CSS selectors.
- Add behavior-oriented verification for high-risk component contracts instead of relying only on static server-render assertions.

## Capabilities

### New Capabilities
- `agenthub-component-contract-hardening`: Defines hardened AgentHub component-system behavior and API contracts after the initial AntD removal.
- `component-behavior-verification`: Defines behavioral verification expectations for AgentHub component contracts, including keyboard interaction, focus management, live regions, and negative vendor-boundary guard tests.

### Modified Capabilities
- `workbench-mvp-ui`: Extends MVP verification expectations to include component behavior checks for current workbench surfaces that depend on Dialog, Settings switches, search, feedback, and overlay behavior.

## Impact

- `packages/ui/src/components/system.tsx` component APIs and behavior implementations.
- `packages/ui/src/index.tsx` exports for canonical components and compatibility aliases.
- `packages/ui/src/styles.ts` or a split component CSS module so `ThemeRoot` can render styled components outside `AgentHubWorkbench`.
- `packages/ui/test/**` behavior tests for component contracts.
- `scripts/check-ui-vendor-boundaries.mjs` guardrail coverage and negative guardrail tests.
- `packages/ui/COMPONENT_SYSTEM.md` API and behavior documentation.
