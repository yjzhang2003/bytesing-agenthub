## MODIFIED Requirements

### Requirement: Avoid marketing and generic AI aesthetics
The authenticated workbench UI SHALL avoid landing-page composition, decorative hero sections, oversized marketing cards, generic purple gradients, and decorative orb backgrounds. Public product pages MAY use product-homepage composition when they remain AgentHub-specific, product-accurate, and visually distinct from generic AI landing-page patterns.

#### Scenario: Developer opens the main workbench
- **WHEN** the main application view renders
- **THEN** the first viewport is the usable workspace workbench rather than a marketing or explanatory page

#### Scenario: Visitor opens the public homepage
- **WHEN** an unauthenticated visitor opens the public product homepage
- **THEN** the page may use product storytelling, conversion sections, and product visuals while avoiding generic purple gradients, decorative orb backgrounds, abstract-only visuals, oversized empty marketing cards, or claims outside MVP scope

### Requirement: Public product page visual QA
The Desktop/Web visual system SHALL verify public homepage and login layouts separately from authenticated workbench layouts.

#### Scenario: Public pages are ready for review
- **WHEN** homepage and login implementation is considered complete
- **THEN** screenshots or equivalent visual checks cover desktop homepage, mobile homepage, desktop login, mobile login, auth pending, auth error, and signed-in redirect behavior

#### Scenario: Public page text renders
- **WHEN** homepage or login content renders with long English or Simplified Chinese strings
- **THEN** headings, buttons, alerts, navigation items, and product evidence panels remain readable without overlap, clipping, or horizontal scrolling
