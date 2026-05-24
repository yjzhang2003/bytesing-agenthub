# AgentHub Component System

This document is the implementation reference for AgentHub Desktop/Web UI components. It exists to replace the failed Ant Design wrapper boundary with first-party component contracts owned by AgentHub.

## Principles

- AgentHub owns the visual language. Component color, spacing, density, typography, radius, focus, elevation, and motion come from AgentHub semantic tokens, not from a styled vendor framework.
- Common controls use AgentHub components. Feature code should not import from `antd`, `@ant-design/icons`, `@ant-design/x`, or any styled component framework.
- Component APIs are product contracts. Do not pass through third-party prop shapes as the public API.
- Feature code must not depend on vendor DOM classes or generated markup. Use AgentHub classes, props, slots, and `data-*` attributes.
- The default density is compact desktop workbench density. Oversized marketing-style cards, decorative empty art, and loose form spacing are not defaults.
- Components must support Simplified Chinese and English labels through props or feature-owned localization.
- Complex behavior may use unstyled primitives, but styling, tokens, state names, and public API remain AgentHub-owned.

## Semantic Tokens

Tokens are applied by `ThemeRoot` as CSS variables on the workbench root or the nearest component-system root. Components should consume these variables directly.

| Token | Purpose |
| --- | --- |
| `--agenthub-bg` | App background behind primary surfaces. |
| `--agenthub-surface` | Main panels, dialogs, menus, and inputs. |
| `--agenthub-surface-2` | Secondary panels, subtle rows, and grouped regions. |
| `--agenthub-surface-hover` | Hovered rows, ghost buttons, and selected affordance backgrounds. |
| `--agenthub-border` | Default dividers and control borders. |
| `--agenthub-border-strong` | Focus-adjacent borders, active outlines, and prominent separators. |
| `--agenthub-text` | Primary text. |
| `--agenthub-text-secondary` | Secondary labels and metadata. |
| `--agenthub-text-muted` | Placeholder, disabled copy, and timestamps. |
| `--agenthub-accent` | Primary action fill, selected foreground, and focus ring color. |
| `--agenthub-accent-text` | Text on accent fills. |
| `--agenthub-status` | Online, success, and healthy states. |
| `--agenthub-warning` | Degraded, caution, and pending states. |
| `--agenthub-danger` | Destructive and error states. |
| `--agenthub-radius` | Default control radius. |
| `--agenthub-bubble-radius` | Chat bubbles and message surfaces. |
| `--agenthub-motion-fast` | Hover/focus transitions. |
| `--agenthub-motion-medium` | Panel and overlay transitions. |
| `--agenthub-type-xs` | Compact counters and metadata. |
| `--agenthub-type-sm` | Labels and secondary text. |
| `--agenthub-type-md` | Default controls and body copy. |
| `--agenthub-type-lg` | Section labels and compact headings. |
| `--agenthub-type-title` | Workbench titles. |

Light and dark themes must define the same token names. Components must not branch on theme mode except where a token cannot express behavior.

## API Conventions

Shared prop names should stay consistent across components:

| Prop | Meaning |
| --- | --- |
| `variant` | Structural treatment: `solid`, `outline`, `ghost`, `subtle`, or component-specific equivalents. |
| `tone` | Semantic intent: `neutral`, `accent`, `danger`, `warning`, `success`, or `muted`. |
| `size` | Control scale: `sm`, `md`, or `lg`. Default is `md`; most workbench controls use `sm` or `md`. |
| `density` | Layout compactness: `compact` or `comfortable`. Default is `compact`. |
| `disabled` | Non-interactive state. Must set native disabled where possible. |
| `loading` | Async state. Must prevent duplicate submit where applicable and expose `data-loading`. |
| `invalid` | Validation state. Must expose `aria-invalid` where applicable and `data-invalid`. |
| `ariaLabel` | Required for icon-only or unlabeled controls. Maps to `aria-label`. |
| `className` | Optional escape hatch for AgentHub-owned classes only. It must not target vendor internals. |
| `value` / `onValueChange` | Controlled value convention for selects, switches, tabs, and text controls where useful. |

Stable state attributes:

- `data-variant`
- `data-tone`
- `data-size`
- `data-density`
- `data-state`
- `data-disabled`
- `data-loading`
- `data-invalid`
- `data-selected`

Use native attributes such as `disabled`, `aria-disabled`, `aria-invalid`, `aria-expanded`, `aria-selected`, and `aria-current` whenever the element semantics require them.

## Behavior Primitive Policy

AgentHub component implementations may use local behavior code or unstyled behavior primitives. In either case, public APIs, class names, state attributes, tokens, copy, and visual treatment remain AgentHub-owned.

Current hardened implementations:

- `Dialog` uses AgentHub-owned portal, app-level background isolation, focus trap, focus return, Escape handling, and title/description wiring.
- `DropdownMenu` uses AgentHub-owned open state, roving menu focus, Escape handling, disabled items, destructive tone, and focus return.
- `Tooltip` uses AgentHub-owned accessible tooltip content and CSS timing instead of relying only on native `title`.
- `Tabs`, `SearchInput`, `Toast`, and `LoadingState` are local AgentHub implementations.

Allowed dependencies are behavior-only and must not own AgentHub styling:

- React for rendering and state.
- Lucide for icons.
- Motion for product-owned animation where already used.
- Marked for markdown rendering where already used.
- Radix Scroll Area and Separator may remain.
- Radix Tooltip may remain for tooltip behavior.
- Radix Dialog, Select, Dropdown/Menu, Portal, Slot, and VisuallyHidden may be introduced only if future review shows local behavior is insufficient and styling remains fully AgentHub-owned.

Forbidden for common controls:

- `antd`, `@ant-design/icons`, `@ant-design/x`, and AntD subpaths.
- Styled vendor component frameworks as visual foundations.
- CSS selectors targeting `.ant-*`, generated vendor classes, or `agenthub-antd-*` compatibility classes.

## Component Contracts

### ThemeRoot

Purpose: applies AgentHub theme variables, density, and typography context.

Use when mounting the workbench or rendering isolated component tests. Do not use it as a bridge to a vendor theme provider.

Props: `children`, `mode: "light" | "dark"`, optional `density`, optional `className`.

States and attributes: `data-theme`, `data-density`.

Tests: renders identical token names in light and dark mode; preserves children; injects component-system CSS for isolated controls; does not import AntD.

### Button

Purpose: command actions such as send, refresh, create, save, cancel, delete, and row actions.

Do not use for navigation tabs, text fields, select triggers, or decorative labels.

Props: `children`, `variant`, `tone`, `size`, `density`, `disabled`, `loading`, `type`, `onClick`, `className`.

Variants: `solid`, `outline`, `ghost`, `subtle`. Tones: `neutral`, `accent`, `danger`, `warning`, `success`.

Accessibility: native `button`; loading buttons set `aria-busy`; disabled buttons use `disabled`.

Tests: variants render stable classes and state attributes; disabled/loading prevent activation; danger does not rely on vendor `danger` props.

### IconButton

Purpose: compact icon-only commands such as collapse, close, send, theme toggle, refresh, and settings.

Props: all `Button` props except visible text is optional; `ariaLabel` is required.

Accessibility: always maps `ariaLabel` to `aria-label`; fixed square hit area; development builds warn when an icon-only button has no accessible name.

Tests: fails review if unlabeled; renders fixed dimensions; exposes hover/focus states.

### TextInput

Purpose: single-line text entry for names, filters, paths, labels, and settings.

Props: native input-compatible subset plus `invalid`, `size`, `density`, `ariaLabel`, `placeholder`.

Accessibility: native input; `aria-invalid` when invalid; visible label through `FormField` where possible.

Tests: disabled, invalid, placeholder, value, and focus style.

### SearchInput

Purpose: filter/search entry in side panels.

Props: `value`, `defaultValue`, `onValueChange`, `placeholder`, `ariaLabel`, `clearLabel`, `disabled`, `size`, `density`.

Behavior: owns clear affordance when value is non-empty. Do not use AntD search input.

Tests: clear action fires value change; accessible labels render in Chinese and English.

### TextArea

Purpose: multi-line entry for composer prompts, system prompts, descriptions, and long notes.

Props: textarea-compatible subset, `minRows`, `maxRows`, `invalid`, `disabled`, `ariaLabel`, `onSubmitShortcut` where needed by composer.

Behavior: composer keyboard behavior remains feature-owned, but the component must not expose AntD `TextAreaRef`.

Tests: ref works with native textarea, disabled state renders, shortcut hooks can be invoked, Enter-to-send features remain covered in composer tests.

### Select

Purpose: choosing one value from a compact option set such as language, provider, role, or agent.

Props: `value`, `onValueChange`, `options`, `placeholder`, `ariaLabel`, `disabled`, `invalid`, `size`.

Behavior choice: native select is preferred for simple settings and forms. Use an unstyled select primitive only when custom trigger/listbox behavior is required.

Accessibility: native select or ARIA combobox/listbox semantics; Escape closes custom overlays; focus returns to trigger.

Tests: option rendering, selected value, keyboard change, disabled/invalid, overlay theme inheritance when custom.

### Checkbox

Purpose: multiple independent boolean selections.

Props: `checked`, `defaultChecked`, `onCheckedChange`, `disabled`, `invalid`, `children`.

Accessibility: native checkbox preferred; label association required.

Tests: checked/unchecked/disabled states and label activation.

### Switch

Purpose: immediate settings toggles such as theme and Enter-to-send.

Props: `checked`, `onCheckedChange`, `disabled`, `ariaLabel`, optional visible label.

Accessibility: `role="switch"` if not native checkbox; Space toggles; accessible name required.

Tests: checked state uses `data-state`, keyboard toggles, disabled prevents changes.

### FormField

Purpose: label, hint, error, required marker, and compact vertical form layout.

Props: `label`, `htmlFor`, `hint`, `error`, `required`, `children`.

Accessibility: error text is linked with `aria-describedby`; required is exposed consistently.

Tests: label association, error localization, compact spacing.

### Tooltip

Purpose: short helper labels for icon-only controls.

Props: `content`, legacy `title`, `children`, `side`, `delay`, `disabled`.

Behavior: visible tooltip content uses `role="tooltip"` and `aria-describedby`; visual treatment is AgentHub-owned.

Tests: trigger preserves child semantics; tooltip content inherits theme variables.

### DropdownMenu

Purpose: compact command menus.

Props: `trigger`, `items`, `align`, `open`, `defaultOpen`, `onOpenChange`, `onSelect`, optional item `tone`.

Behavior: unstyled menu primitive is allowed; destructive items use AgentHub danger tone.

Accessibility: menu role, roving focus, Escape close, focus return to trigger.

Tests: keyboard navigation, disabled items, destructive styling, focus return.

### Dialog

Purpose: modal decisions and focused workflows such as add-agent.

Props: `open`, `onOpenChange`, `title`, `description`, `children`, `footer`, `initialFocusRef`, `className`, `closeLabel`, `cancelLabel`, `confirmLabel`, `onConfirm`, `closeOnEscape`, `closeOnOverlayClick`.

Behavior: owns portal root, overlay, app-level isolation via `inert`/`aria-hidden`, focus trap, Escape close where allowed, close button labeling, initial focus, and focus return.

Accessibility: `role="dialog"`, `aria-modal`, labelled title, optional description. Dialog overlays must inherit AgentHub theme variables.

Tests: open/close, Escape, close button, focus return, theme inheritance, no vendor primary-color leakage.

### Tabs

Purpose: compact mode switching inside a panel.

Props: `value`, `onValueChange`, `items`. Legacy `activeKey`/`onChange` remains only through compatibility usage during migration.

Accessibility: tablist, tab, tabpanel semantics; selected tab uses `aria-selected` and `data-state="active"`.

Tests: selected state, keyboard movement, compact layout.

### Badge

Purpose: small status, count, and metadata indicators.

Props: `children`, `count`, `tone`, `status`, `size`, `title`.

Do not use vendor count bubble defaults.

Tests: tones map to semantic tokens; count is readable and compact.

### Avatar

Purpose: agent, provider, and participant identity.

Props: `name`, `initials`, `icon`, `src`, `shape`, `size`, `ariaLabel`.

Behavior: initials fallback is deterministic; square shape is allowed for agent tiles.

Tests: initials fallback, icon rendering, shape/size attributes.

### EmptyState

Purpose: quiet empty panels and list placeholders.

Props: `title`, `description`, optional `action`.

Do not use decorative vendor illustrations by default.

Tests: compact rendering and localized copy.

### LoadingState

Purpose: loading skeletons and small spinners.

Props: `active`, `variant`, `rows`, `size`, `density`, `tone`, `label`.

Accessibility: `aria-busy` or `role="status"` where appropriate; expose `aria-live="polite"` and localized labels; respect reduced motion.

Tests: spinner/skeleton variants, accessible label, rows.

### Toast / Feedback

Purpose: transient success, error, warning, and info feedback.

Props: `content`, `tone`, `duration`, `dismissLabel`, or `items` for controlled rendering.

Behavior: placement, duration, theme, and localization are AgentHub-owned. Do not use AntD `message`. `agentHubMessage` remains only as a compatibility event bridge that emits `agenthub:feedback`.

Tests: live region, tone rendering, dismiss behavior, event bridge behavior, and no duplicate live regions.

## Migration Map

| Current wrapper | Target component |
| --- | --- |
| `AgentHubThemeProvider` | `ThemeRoot` |
| `AgentHubButton` | `Button` |
| `AgentHubIconButton` | `IconButton` |
| `AgentHubTextInput` | `TextInput` |
| `AgentHubSearchInput` | `SearchInput` |
| `AgentHubTextArea` | `TextArea` |
| `AgentHubSelect` | `Select` |
| `AgentHubCheckbox` | `Checkbox` |
| `AgentHubSwitch` | `Switch` |
| `AgentHubFormItem` | `FormField` |
| `AgentHubTooltip` | `Tooltip` |
| `AgentHubDropdown` | `DropdownMenu` |
| `AgentHubModal` | `Dialog` |
| `AgentHubTabs` | `Tabs` |
| `AgentHubBadge` | `Badge` |
| `AgentHubAvatar` | `Avatar` |
| `AgentHubEmptyState` | `EmptyState` |
| `AgentHubLoadingState` | `LoadingState` |
| `agentHubMessage` | `Toast` / `Feedback` |

Temporary aliases may exist during migration, but they must call AgentHub-owned implementations and must not expose AntD types or props.

New feature code should import canonical names. Legacy aliases may accept old prop names such as `okText`, `cancelText`, `activeKey`, or `onChange`, but the canonical components must expose AgentHub names such as `confirmLabel`, `cancelLabel`, `value`, and `onValueChange`.

## Surface Review

Before broad migration, confirm these workbench needs map to documented components:

| Surface | Required components |
| --- | --- |
| Composer | `TextArea`, `Button`, `IconButton`, `Badge`, `Tooltip`, `LoadingState` |
| Chat Info | `Avatar`, `Badge`, `IconButton`, `Dialog`, `Select`, `Button`, `EmptyState` |
| Agents | `SearchInput`, `Avatar`, `Badge`, `Button`, `TextInput`, `TextArea`, `Select`, `FormField`, `EmptyState` |
| Connections | `Avatar`, `Badge`, `Button`, `LoadingState`, `EmptyState` |
| Settings | `Select`, `Switch`, `Button`, `FormField` |
| Inspector | `Avatar`, `Badge`, `Button`, `Tabs`, `EmptyState`, `LoadingState` |

Any missing need must either extend this component system or document a local exception in the same change.

## Verification

Component-system verification must include:

- Unit/render tests for component variants, tones, disabled, loading, invalid, selected, focused, and localized labels.
- Overlay tests for `Dialog`, `DropdownMenu`, `Tooltip`, and custom `Select` overlays.
- Source scans proving no direct AntD imports or AntD subpaths.
- CSS scans proving no `.ant-*` selectors and no `agenthub-antd-*` classes.
- Representative workbench renders for Composer, Chat Info, Agents, Connections, Settings, Inspector, narrow layout, Simplified Chinese, and dark/light theme.
