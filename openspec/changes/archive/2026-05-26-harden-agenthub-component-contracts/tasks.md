## 1. API And Architecture Alignment

- [x] 1.1 Decide and document which behavior primitives to add for Dialog, DropdownMenu, Tooltip, and related overlay behavior.
- [x] 1.2 Refactor `packages/ui/src/components/system.tsx` so canonical components own the implementation and compatibility aliases adapt legacy `AgentHub*` props.
- [x] 1.3 Align canonical props for Button, IconButton, Select, Switch, Tabs, Dialog, Badge, LoadingState, Toast, Tooltip, DropdownMenu, SearchInput, TextInput, and TextArea with `packages/ui/COMPONENT_SYSTEM.md`.
- [x] 1.4 Update public exports in `packages/ui/src/index.tsx` so canonical names are primary and compatibility aliases remain clearly temporary.
- [x] 1.5 Update `packages/ui/COMPONENT_SYSTEM.md` to reflect the hardened API, behavior primitives, and compatibility migration rules.

## 2. Component Behavior Hardening

- [x] 2.1 Implement Dialog with app-level overlay isolation, focus trap, focus return, Escape handling, title/description labelling, localized close/cancel labels, custom footer, and initial focus support.
- [x] 2.2 Implement DropdownMenu with open/close state, Escape handling, roving keyboard focus, disabled items, destructive item tone, and focus return.
- [x] 2.3 Implement Tooltip behavior with accessible relationships, AgentHub-owned styling, delay control, disabled behavior, and theme inheritance.
- [x] 2.4 Implement Tabs canonical `value`/`onValueChange` API with keyboard movement and selected tabpanel semantics.
- [x] 2.5 Implement SearchInput clear affordance with localized `clearLabel`, keyboard access, and no text/icon overflow in compact sidebars.
- [x] 2.6 Implement Toast or Feedback rendering with live region, tone, duration, dismiss behavior, and localized content support.
- [x] 2.7 Implement LoadingState localized labels, spinner/skeleton accessibility, theme support, density support, and reduced-motion behavior.
- [x] 2.8 Tighten IconButton accessible-name typing or runtime development validation.

## 3. Styling And ThemeRoot

- [x] 3.1 Split component-system CSS from workbench layout CSS or otherwise make component CSS available through `ThemeRoot`.
- [x] 3.2 Verify `ThemeRoot` renders styled Button, Select, Dialog, Switch, SearchInput, Tabs, Badge, Avatar, LoadingState, and Toast outside `AgentHubWorkbench`.
- [x] 3.3 Preserve existing workbench visual output while moving shared control styles to the component-system boundary.

## 4. Guardrails

- [x] 4.1 Strengthen `scripts/check-ui-vendor-boundaries.mjs` to catch forbidden class-name strings such as `ant-btn` and `agenthub-antd-button` in TSX/JS/MD fixtures and source files.
- [x] 4.2 Add negative guardrail fixtures or test mode proving the script fails on forbidden imports, package dependencies, lockfile entries, CSS selectors, and class strings.
- [x] 4.3 Keep the guardrail wired into `pnpm check`.

## 5. Verification

- [x] 5.1 Add DOM-capable behavior tests for Dialog focus trap, focus return, Escape close, label/description wiring, and Chat Info add-agent workflow.
- [x] 5.2 Add behavior tests for Settings switches, SearchInput clear behavior, Select value changes, TextArea refs, Tabs keyboard movement, DropdownMenu keyboard behavior, Tooltip rendering, Toast live region, and LoadingState labels.
- [x] 5.3 Add isolated `ThemeRoot` tests proving component CSS and variables work outside `AgentHubWorkbench`.
- [x] 5.4 Update rendered workbench tests for Chat Info, Settings, Chat/Agents search, dark/light themes, and Simplified Chinese labels after behavior hardening.
- [x] 5.5 Run `pnpm check`, `pnpm check:ui-boundaries`, `git diff --check`, and `openspec validate harden-agenthub-component-contracts --strict`.
