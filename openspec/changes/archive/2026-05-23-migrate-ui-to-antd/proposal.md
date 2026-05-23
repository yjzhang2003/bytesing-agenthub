## Why

AgentHub Desktop/Web has reached the point where hand-rolled controls are slowing UI iteration: forms, tooltips, dropdowns, lists, empty states, loading states, and feedback surfaces are being rebuilt ad hoc. Migrating common UI foundations to Ant Design gives the product a stronger component base while preserving the custom IM/workbench shell that defines AgentHub's desktop client feel.

## What Changes

- Add Ant Design as the primary Desktop/Web component foundation for common controls and stateful UI primitives.
- Introduce an AgentHub Ant Design theme bridge that maps existing semantic tokens to Ant Design component tokens for dark/light modes, compact density, focus states, status colors, and border radii.
- Replace selected hand-rolled primitives with AgentHub-owned wrappers backed by Ant Design where appropriate, including buttons, inputs, text areas, selects, forms, modals, tooltips, dropdowns, badges, avatars, empty states, skeletons, notifications, tabs, and list rows.
- Keep AgentHub-owned layout shells for the left rail, resizable chat/agent sidebars, conversation timeline, agent directory page, connections page, composer layout, and runtime-aware workbench structure.
- Evaluate Ant Design X chat components for message bubbles, sender/composer, conversations, and avatars before adopting them; preserve custom implementation where Ant Design X cannot match the desktop IM requirements.
- Maintain existing Control Plane APIs, workbench view model shape, and Electron/Web startup behavior.
- No breaking API changes.

## Capabilities

### New Capabilities
- `antd-ui-foundation`: Defines Ant Design-backed UI foundation requirements, theming, wrapper usage, migration boundaries, and verification expectations for Desktop/Web.

### Modified Capabilities
- `visual-design-system`: Requires the visual system to map AgentHub semantic tokens to Ant Design tokens while retaining compact professional IM/workbench styling.
- `conversation-workbench`: Requires migrated workbench controls to preserve current conversation, agent, and runtime workflows while using shared component primitives where suitable.

## Impact

- Affected code: `packages/ui`, `apps/web`, and `apps/desktop` rendering surfaces that consume AgentHub UI components.
- Dependencies: add Ant Design and supporting style/runtime dependencies as needed; optionally evaluate Ant Design X in a scoped spike before adopting chat-specific components.
- Tests: update UI component tests for Ant Design-backed wrappers, keep workbench behavior tests, and add coverage for theme mapping, agent forms, connection status, composer controls, and message navigation.
- Visual QA: re-check dark/light themes, sidebar resizing, Agents page, Connections page, message timeline, composer, modals/dropdowns/tooltips, empty/offline states, and narrow desktop layouts.
