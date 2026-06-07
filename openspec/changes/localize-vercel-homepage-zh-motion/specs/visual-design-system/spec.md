## ADDED Requirements

### Requirement: Restrained public homepage motion
The visual system SHALL allow public homepage background motion only when it remains subtle, accessible, product-adjacent, and consistent with AgentHub's light-first restrained style.

#### Scenario: Public homepage animation renders
- **WHEN** the public homepage renders decorative background motion
- **THEN** the animation uses low-contrast visual treatment behind content and does not obscure text, controls, focus states, or product evidence

#### Scenario: Reduced motion is requested
- **WHEN** the user environment requests reduced motion
- **THEN** public homepage decorative animation is disabled or reduced without changing the page structure or sign-in path

### Requirement: Public homepage responsive text safety
The visual system SHALL keep concise Chinese and English public homepage text readable across desktop and mobile layouts.

#### Scenario: Chinese homepage renders on mobile
- **WHEN** the public homepage renders in Simplified Chinese at mobile width
- **THEN** headline, supporting copy, navigation, sign-in action, and product evidence text remain readable without overlap, clipping, or horizontal scrolling

#### Scenario: English homepage renders with preserved fallback
- **WHEN** the public homepage renders in English after a supported locale preference is applied
- **THEN** text remains within its containers and the animated background does not cause layout shift
