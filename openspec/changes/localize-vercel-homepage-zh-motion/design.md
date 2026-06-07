## Context

The web app already routes unauthenticated Supabase-mode visitors to a public homepage component and has English/Simplified Chinese translation catalogs. The homepage component currently defaults to English unless a locale prop is supplied, and its visual structure is a light, restrained AgentHub product page with product evidence cards.

This change refines that public homepage for the deployed Vercel entrypoint: Chinese-first copy, fewer words, and a simple motion background while preserving the existing style and product-accurate evidence.

## Goals / Non-Goals

**Goals:**
- Render the hosted unauthenticated web root in Simplified Chinese by default.
- Keep English available through the existing locale mechanisms and catalog coverage.
- Shorten public homepage copy without removing the sign-in path or concrete product evidence.
- Add a subtle CSS-only animated background that respects reduced-motion preferences and responsive layout constraints.
- Preserve the existing AgentHub visual language: light-first, thin borders, compact product evidence, restrained color, and no generic AI decoration.

**Non-Goals:**
- Redesign the authenticated workbench.
- Add a language picker to the public homepage unless the implementation can reuse existing locale state without expanding scope.
- Change authentication, Supabase callback behavior, or login form mechanics.
- Introduce animation libraries, images, videos, or network-loaded homepage assets.
- Claim future product capabilities beyond the current AgentHub MVP scope.

## Decisions

### Use locale plumbing instead of duplicating homepage components

The web entrypoint will pass a resolved public locale into `AgentHubProductHomepage` and `AgentHubLoginPage` rather than creating a Chinese-only component. This keeps the public homepage aligned with the shared UI component system and preserves English fallback behavior.

Alternative considered: hard-code Chinese strings in the homepage component. That would make the Vercel target faster to change but would bypass existing localization tests and create drift from the shared i18n catalog.

### Default public Vercel homepage to Simplified Chinese

When no stored user language preference is available for unauthenticated public pages, the hosted public homepage will resolve to Simplified Chinese. Existing persisted locale behavior can still override the public default when a supported value exists.

Alternative considered: use browser language auto-detection. That is broader than the requested Vercel homepage behavior and could create inconsistent first impressions across environments.

### Keep motion CSS-only and decorative

The animated background will be implemented with scoped CSS pseudo-elements or lightweight DOM-free layers. The product evidence panel remains the inspectable product representation; motion only adds atmosphere and must not carry required meaning.

Alternative considered: canvas, SVG animation, or generated image assets. Those add rendering and QA complexity without improving the core homepage requirement.

### Trim copy through translation catalog updates

Homepage text will be shortened by editing the public homepage translation keys and, if needed, reducing rendered feature density. The implementation should keep the AgentHub name, product category, one primary value line, and sign-in call to action visible in the first viewport.

Alternative considered: remove feature/product evidence sections entirely. That would reduce text but conflict with the existing product homepage requirement to show concrete AgentHub-relevant concepts.

## Risks / Trade-offs

- Animated background distracts from sign-in or product evidence -> Keep motion low-contrast, slow, behind content, and disabled under `prefers-reduced-motion: reduce`.
- Chinese default surprises English-speaking users -> Preserve supported English rendering through persisted locale and existing catalog fallback.
- Shorter copy becomes vague -> Keep concrete product evidence labels and avoid abstract marketing claims.
- Homepage text overlaps on mobile after Chinese copy changes -> Add responsive verification for desktop and narrow/mobile widths.
- This change overlaps with the active product homepage proposal -> Scope implementation to the current public homepage component and localization defaults so it can layer on the existing homepage work without changing auth architecture.
