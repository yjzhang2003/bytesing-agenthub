# AgentHub Desktop and Web Workbench

## Default Layout

Desktop and Web use a three-column workbench at desktop width:

- Left: workspace navigation.
- Center: conversation timeline and composer.
- Right: Context Inspector.

Recommended starting widths:

- Left sidebar: 280-320px.
- Center timeline: fluid, minimum 520px.
- Right inspector: 360-440px.

The center column is the primary work surface. The right inspector is the default detail surface. The left sidebar keeps execution context visible.

## Left Sidebar

Order:

1. Workspace switcher.
2. Runtime status row.
3. Primary navigation: Conversations, Agents, Runs, Settings.
4. Conversation list.
5. Optional footer: account, sync, app status.

Conversation rows show:

- Conversation title.
- Participants or primary agent.
- Last activity.
- Active run indicator.
- Pending permission badge.

Agent rows or agent entry points show:

- Agent name.
- Role label.
- Provider label.
- Capability tags when space allows.

## Center Timeline

Timeline item types:

- User message.
- Agent message.
- Orchestrator message.
- Run event.
- Plan summary card.
- Permission card.
- Diff card.
- Artifact card.
- Final summary.

Message grouping:

- Consecutive messages from the same participant can group visually.
- Run events should be compact and scannable.
- Agent identity must remain visible when multiple agents participate.

Required timeline controls:

- Select item to open detail in Context Inspector.
- Copy code or command where applicable.
- Open diff or artifact detail.
- Jump to pending permission.
- Show current run state near related messages.

## Composer

Composer requirements:

- Supports plain message entry.
- Supports explicit agent mention or target selection.
- Distinguishes Orchestrator targeting from direct worker-agent targeting.
- Shows selected workspace context.
- Shows disabled state when runtime is required but offline.

Targeting behavior:

- `@Orchestrator` or coordinated execution starts Plan Mode.
- `@WorkerAgent` routes directly to that agent.
- No implicit Orchestrator takeover for normal group chat.

## Context Inspector

Inspector modes:

- `plan`: full plan, steps, agents, risks, actions, progress.
- `permission`: pending queue or selected permission detail.
- `diff`: changed file list, selected file diff, metadata, stale/offline states.
- `runtime`: device state, capabilities, active runs, workspace binding.
- `artifact`: code artifact metadata and actions.
- `empty`: helpful state when no detail is selected.

Selection behavior:

- Selecting a timeline card opens matching inspector mode.
- Selecting global pending permissions opens permission queue.
- Selecting runtime status opens runtime details.
- Inspector keeps the current conversation visible.

## Responsive Collapse

Breakpoints:

- `wide`: three columns visible.
- `standard`: sidebar and timeline visible; inspector can be toggled.
- `narrow`: timeline primary; sidebar and inspector become drawers or routes.
- `mobile-web`: use the same routing model as iOS where practical.

Collapse order:

1. Collapse Context Inspector into a drawer or detail route.
2. Collapse left sidebar into a workspace/navigation drawer.
3. Preserve a persistent pending permission affordance.
4. Keep the composer and timeline usable.

Pending permission access must never depend on the inspector being visible.
