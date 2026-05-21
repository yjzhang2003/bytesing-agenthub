# AgentHub UI Foundation

## Product Character

AgentHub is a light-first professional console for developers coordinating local and remote agent work. The default view is the usable workbench, not a landing page. The interface should feel closer to a focused developer control surface than a casual messenger, marketing dashboard, or IDE clone.

Core qualities:

- Dense but legible: compact controls, concise copy, predictable alignment.
- Operational: runtime status, workspace context, agent activity, permissions, and diffs are always easy to locate.
- Calm: neutral surfaces, limited accent color, no decorative gradients, no orb backgrounds, no oversized feature cards.
- Code-aware: diffs, commands, paths, run states, and agent roles use precise typography and status treatment.
- Multi-client consistent: Desktop, Web, and iOS use the same object names, state names, and action labels.

## Default Theme

MVP default theme is light.

Dark mode is allowed later through the same semantic tokens, but MVP visual QA only requires the light theme. The light theme should use soft neutral backgrounds, crisp panel borders, readable code surfaces, and semantic status colors. Avoid generic purple-blue AI gradients and decorative color effects.

## Typography

Use a professional UI/body family with strong legibility at small sizes and a separate monospace family for code, commands, paths, diffs, and run logs.

Recommended hierarchy:

- App title and workspace name: 15-16px, medium or semibold.
- Section labels: 11-12px, medium, muted, uppercase only when it improves scanning.
- Message body: 13-14px, regular.
- Metadata, timestamps, run labels: 11-12px, muted.
- Code and diff: 12-13px monospace, line-height tuned for scanning.

Do not scale font size with viewport width. Text must not overflow cards, buttons, or navigation rows.

## Semantic Tokens

### Color Tokens

- `color.background.app`: outer app background.
- `color.background.surface`: primary panel and timeline background.
- `color.background.subtle`: grouped rows, secondary panels, empty states.
- `color.background.elevated`: popovers, drawers, inspector overlays.
- `color.border.default`: standard panel and card borders.
- `color.border.strong`: selected panels and important boundaries.
- `color.text.primary`: main readable text.
- `color.text.secondary`: metadata and helper text.
- `color.text.muted`: timestamps and low-emphasis labels.
- `color.text.inverse`: text on strong status fills.
- `color.accent.primary`: selected item, primary action, active focus.
- `color.status.online`: runtime available.
- `color.status.offline`: runtime unavailable.
- `color.status.running`: active run.
- `color.status.warning`: permission, stale diff, degraded runtime.
- `color.status.danger`: deny, failed run, destructive request.
- `color.status.success`: completed run, approved plan, allowed permission.
- `color.diff.added`: added code line background and marker.
- `color.diff.removed`: removed code line background and marker.
- `color.diff.context`: unchanged code line background.

### Spacing Tokens

- `space.1`: 4px.
- `space.2`: 8px.
- `space.3`: 12px.
- `space.4`: 16px.
- `space.5`: 20px.
- `space.6`: 24px.
- `space.8`: 32px.

Default component spacing should favor `space.2` and `space.3`; use larger spacing only for page-level separation.

### Radius, Border, Elevation

- `radius.control`: 6px.
- `radius.card`: 8px maximum for cards and inspector panels.
- `radius.full`: only for avatars, status dots, and pills.
- `border.default`: 1px solid semantic border.
- `shadow.popover`: only for floating overlays and menus.
- `shadow.panel`: restrained elevation for inspector drawers, not regular page sections.

Do not nest cards inside cards. Page sections should be unframed layouts or panels, not stacked decorative cards.

### Density Tokens

- `density.compact.row`: 32-36px list row height.
- `density.default.row`: 40-44px list row height.
- `density.timeline.gap`: 8-12px between timeline items.
- `density.inspector.section`: 12-16px between inspector sections.
- `density.button.icon`: 28-32px square icon button.
- `density.button.text`: 32-36px height.

## Component States

Every core component must define these semantic states:

- `loading`: content is being fetched or streamed.
- `empty`: no records exist for the selected scope.
- `offline`: required Desktop Runtime is not reachable.
- `blocked`: user or permission action is required before progress can continue.
- `error`: an operation failed and cannot continue without retry or user action.
- `success`: operation completed.
- `warning`: state is degraded, stale, risky, or needs attention.
- `selected`: item is the active navigation or inspector target.
- `focused`: keyboard focus is visible.
- `disabled`: action is unavailable and has an accessible explanation.

Offline is not a generic error. Blocked is not generic loading. Permission pending is blocked, not warning.

## Accessibility

- All interactive controls must have accessible labels.
- Desktop/Web must support keyboard navigation for workspace navigation, conversation list, composer, pending permission queue, plan actions, and diff file list.
- Focus indicators must be visible against the light theme.
- Status cannot rely on color alone; pair color with icon, label, or text.
- Destructive and high-risk actions need explicit labels such as `Deny`, `Cancel plan`, or `Run command`.

## SwiftUI Token Mapping

iOS uses native SwiftUI components but maps to the same semantic token names:

- Color tokens map to `Color` assets or generated constants.
- Typography tokens map to SwiftUI font styles with explicit size/weight.
- Spacing tokens map to numeric constants.
- Radius and border tokens map to view modifiers.
- State names are identical to React state names.

iOS may use native navigation bars, sheets, lists, and context menus, but Plan, Permission, Diff, Runtime, Workspace, Agent, Run, and Artifact names must match Desktop/Web.
