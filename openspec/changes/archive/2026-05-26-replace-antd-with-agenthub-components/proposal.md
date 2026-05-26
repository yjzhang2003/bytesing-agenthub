## Why

The current Ant Design wrapper approach is leaking vendor behavior, styling, and interaction defaults into AgentHub surfaces, forcing feature code to patch around AntD internals instead of expressing AgentHub's own product language. AgentHub needs a first-party component standard so Desktop/Web UI can stay compact, predictable, localized, and visually coherent without depending on AntD theme behavior.

## What Changes

- **BREAKING** Remove `antd`, `@ant-design/icons`, and `@ant-design/x` from the `@agenthub/ui` runtime dependency graph.
- **BREAKING** Replace `components/antd-primitives.tsx` with AgentHub-owned component primitives whose public APIs are defined by AgentHub rather than AntD prop passthroughs.
- Introduce a formal Desktop/Web component standard covering tokens, density, control variants, modal behavior, form fields, overlays, states, accessibility, localization, and testing expectations.
- Migrate existing workbench surfaces to the first-party component standard: composer, Agents, Connections, Settings, chat information, inspector actions, cards, dialogs, and feedback messages.
- Keep low-level unstyled primitives where they provide behavior without visual language ownership, such as Radix scroll area, separator, tooltip, dialog/select primitives if adopted, and Lucide icons.
- Remove CSS that targets AntD internal class names and replace it with AgentHub-owned classes, data attributes, and component-level state contracts.
- Update OpenSpec requirements that currently mandate Ant Design-backed controls so they instead require AgentHub-owned components and explicitly forbid vendor design-language leakage.

## Capabilities

### New Capabilities
- `agenthub-component-system`: Defines AgentHub's first-party Desktop/Web component standard, including primitive ownership, component APIs, states, accessibility, localization, styling boundaries, and verification expectations.

### Modified Capabilities
- `antd-ui-foundation`: Retires the Ant Design-backed UI foundation and replaces its requirements with a vendor-independent AgentHub component foundation.
- `visual-design-system`: Changes vendor token mapping and wrapper isolation requirements into first-party semantic token and component styling requirements.
- `conversation-workbench`: Changes common workbench control requirements from Ant Design-backed wrappers to AgentHub-owned controls while preserving current workbench behavior.
- `workbench-mvp-ui`: Updates MVP verification expectations to cover the first-party component system and removal of AntD visual leakage.

## Impact

- `packages/ui/package.json` and lockfile dependency graph remove AntD packages and any unused Ant Design X packages.
- `packages/ui/src/components/antd-primitives.tsx` is removed or replaced by AgentHub-owned component modules.
- Feature components using `AgentHubButton`, `AgentHubSelect`, `AgentHubModal`, `AgentHubAvatar`, `AgentHubBadge`, `AgentHubTextInput`, `AgentHubTextArea`, `AgentHubSwitch`, tabs, dropdowns, tooltips, and message feedback are migrated to first-party implementations.
- `packages/ui/src/styles.ts` removes `.ant-*` and `.agenthub-antd-*` selectors and defines component styling through AgentHub classes/data-state attributes.
- Tests are updated to assert AgentHub component contracts instead of AntD wrapper classes or DOM structure.
- No Control Plane API behavior should change; the work is UI implementation and OpenSpec contract migration.
