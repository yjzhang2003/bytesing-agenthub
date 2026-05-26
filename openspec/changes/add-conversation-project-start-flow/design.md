## Context

AgentHub already has workspace-scoped conversations, runtime workspace metadata, and an add-agent picker pattern inside chat information. New conversations can be created from an Agent detail surface, but Chat itself does not have a clear start flow that asks which agents should join and which local project directory the conversation should execute against. As a result, agent runs can inherit an implicit runtime working directory and appear to start working on a repository the user did not explicitly select for that conversation.

This change makes project binding explicit at conversation creation time while keeping the UI close to the existing IM-style sidebar and picker language.

## Goals / Non-Goals

**Goals:**
- Add a compact new-conversation button next to the Chat sidebar search field.
- Reuse the add-agent picker interaction model for selecting one or more participating agents.
- Add a project selection step that supports existing projects on all clients, while limiting local directory selection and AgentHub-managed default directory creation to Desktop.
- Persist the selected project binding on the conversation and show it in visible conversation context.
- Ensure run preparation resolves workspace path from the conversation project binding.
- Keep labels localized in English and Simplified Chinese.

**Non-Goals:**
- Implement a full sandbox/container runtime in this change.
- Upload source code or directory contents to the cloud.
- Replace the existing Agents detail "new conversation" entry point.
- Redesign global workspace navigation or account-level workspace management.

## Decisions

### Conversation creation becomes a two-step modal flow

The Chat sidebar new button opens a creation flow with agent selection followed by project selection. The agent selection step reuses the add-agent picker row density, search, multi-select state, empty states, and keyboard behavior so Chat does not gain a second contact-picker design. The project step is separate because local directory selection has different confirmation, validation, and runtime-availability concerns than agent selection.

Alternative considered: create the conversation immediately after choosing agents and ask for a project before the first run. That keeps creation shorter, but it leaves the conversation in an ambiguous state and does not solve the user's need to understand the directory before the agent starts working.

### Project binding is stored on the conversation

The selected project is persisted as conversation metadata instead of only as transient composer state. Runs, conversation detail, runtime routing, and future cross-client surfaces can all derive the same execution context. This also allows a user to return to an older conversation and see which directory it is about before sending another prompt.

Alternative considered: keep project binding only on the active workspace. That matches current workspace-first navigation, but it makes multiple conversations within one workspace unable to target different local project directories.

### New local projects are registered through Desktop Runtime

When the user chooses a local directory from the Desktop app, Desktop Runtime is responsible for opening the native directory picker, resolving the path, creating/validating any AgentHub-managed default directory, and publishing safe metadata to Control Plane. Control Plane stores identity, labels, owning runtime device, path label, and repository metadata, but never uploads source contents. Web and iOS clients cannot create local projects, open directory pickers, or request a remote Desktop Runtime to open a directory picker; they can only select projects that Desktop has already registered.

Alternative considered: let Web collect arbitrary path strings. That would be less reliable and less secure because Web cannot verify local path availability without the owning Desktop Runtime.

### Default project directory is explicit

The Desktop project picker can offer a default AgentHub-managed directory for users who want a clean starting place. Selecting it still creates a concrete project record and binds it to the conversation, so the UI can show "AgentHub default project" and its path label like any other project. Web and iOS treat that default directory as an existing project only after Desktop has registered it.

Alternative considered: silently use a default directory when no project is chosen. That repeats the original problem by hiding the execution context.

### Run commands resolve from conversation project binding

When a run starts, Control Plane resolves the conversation's project binding to a workspace/project record and queues a command for the bound Desktop Runtime with the selected workspace path. If the project is missing, offline, or owned by another runtime device, the run is rejected with an actionable error before provider execution starts.

Alternative considered: allow Desktop Runtime to choose cwd at execution time. That preserves flexibility but makes run behavior hard to audit and hard to explain in the UI.

## Risks / Trade-offs

- [Risk] The creation flow adds friction before the first message. → Mitigation: keep it two compact steps, remember recent projects, and allow the managed default directory for fast starts.
- [Risk] Existing workspace and project terminology may blur together. → Mitigation: use "Project" for the local directory bound to a conversation and keep "Workspace" for the account/runtime scope already present in navigation.
- [Risk] Directory picking is Desktop-only while Web and iOS may also create conversations. → Mitigation: Web and iOS can select existing Desktop-registered projects only; if no project exists, they explain that the user must open Desktop to add a local project.
- [Risk] Existing conversations may not have project bindings. → Mitigation: keep historical conversations readable, infer their current workspace binding where safe, and require explicit project selection before starting new local runs if no binding exists.
