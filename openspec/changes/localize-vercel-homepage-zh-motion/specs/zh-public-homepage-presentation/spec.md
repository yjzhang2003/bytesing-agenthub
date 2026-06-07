## ADDED Requirements

### Requirement: Chinese-first hosted homepage
The web app SHALL render the unauthenticated hosted public homepage in Simplified Chinese by default when no supported persisted public locale preference is available.

#### Scenario: Anonymous visitor opens Vercel root without locale preference
- **WHEN** an unauthenticated visitor opens the hosted web root and no supported public locale preference exists
- **THEN** the homepage navigation, hero copy, primary action, product evidence labels, and footer chrome render in Simplified Chinese

#### Scenario: Supported English preference exists
- **WHEN** an unauthenticated visitor opens the hosted web root with a persisted English locale preference
- **THEN** the homepage renders product-owned chrome in English without changing source content values such as AgentHub or GitHub

### Requirement: Concise homepage copy
The public homepage SHALL keep first-viewport copy concise while preserving AgentHub positioning and a clear sign-in path.

#### Scenario: Visitor scans the first viewport
- **WHEN** the public homepage first viewport renders on desktop or mobile
- **THEN** it shows AgentHub, a short product category or value line, one concise supporting sentence, and a visible sign-in action without requiring scrolling

#### Scenario: Homepage feature copy renders
- **WHEN** homepage feature or evidence sections render
- **THEN** their labels and descriptions use short product-owned phrases rather than long marketing paragraphs

### Requirement: Lightweight animated background
The public homepage SHALL include a subtle animated background treatment that supports the existing AgentHub homepage style without replacing concrete product evidence.

#### Scenario: Motion-capable visitor opens homepage
- **WHEN** the public homepage renders in a browser that allows motion
- **THEN** the background shows a low-contrast, lightweight animation behind the homepage content while preserving readable text and usable sign-in controls

#### Scenario: Visitor prefers reduced motion
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** the homepage disables or freezes decorative background animation while keeping the visual layout coherent

### Requirement: Product evidence remains inspectable
The public homepage SHALL continue to show concrete AgentHub-relevant product evidence even when copy is shortened and background motion is added.

#### Scenario: Visitor evaluates homepage content
- **WHEN** the public homepage renders
- **THEN** it presents inspectable concepts such as workspace, agents, runtime status, permissions, or artifacts instead of relying only on animated decoration

#### Scenario: Product evidence renders on mobile
- **WHEN** the public homepage renders at mobile width
- **THEN** product evidence remains readable without clipping, overlap, or horizontal scrolling
