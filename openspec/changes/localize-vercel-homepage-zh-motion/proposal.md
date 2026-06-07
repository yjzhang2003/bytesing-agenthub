## Why

The deployed Vercel homepage should feel ready for a Chinese-speaking audience without changing the established AgentHub product-homepage style. The current public homepage work already has bilingual foundations, but the hosted entrypoint still needs a concise Simplified Chinese-first presentation and lightweight motion treatment.

## What Changes

- Make the unauthenticated Vercel web root render Simplified Chinese product chrome by default while preserving supported English rendering.
- Shorten homepage copy so the first viewport focuses on AgentHub, one clear value proposition, and sign-in.
- Add a subtle animated background treatment that matches the existing light, restrained AgentHub homepage style.
- Keep concrete product evidence visible through the existing AgentHub concepts: workspace, agents, runtime status, permissions, and artifacts.
- Preserve product and technical identifiers such as AgentHub, GitHub, Desktop Runtime, URLs, commands, and provider names.

## Capabilities

### New Capabilities
- `zh-public-homepage-presentation`: Chinese-first public homepage presentation, concise copy, motion background, and Vercel root behavior.

### Modified Capabilities
- `localized-product-experience`: Public homepage default language behavior and Chinese product chrome coverage are refined for hosted web entrypoints.
- `visual-design-system`: Public homepage motion treatment is allowed when it remains subtle, product-relevant, accessible, and consistent with AgentHub's restrained visual language.

## Impact

- Affected web entry rendering in `apps/web`.
- Affected shared public homepage component and localization catalogs in `packages/ui`.
- Affected homepage CSS for responsive, reduced-motion, and animated background states.
- Affected UI/auth/localization tests for unauthenticated Vercel root behavior and Chinese homepage rendering.
