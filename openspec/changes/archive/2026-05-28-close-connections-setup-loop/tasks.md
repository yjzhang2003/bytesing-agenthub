## 1. View Model And State Shape

- [x] 1.1 Update the Connections view model so the selectable list contains provider-level rows only, including Claude Code and disabled future providers.
- [x] 1.2 Move Claude Code capability discovery, runtime gating, memory dependency, workspace Claude files, MCP, plugins, skills, hooks, and managed profile metadata into grouped Claude Code detail data.
- [x] 1.3 Add normalized setup guidance fields for runtime-offline, provider-missing, provider-auth-required, provider-misconfigured, discovery-unavailable, and managed-profile issue states.
- [x] 1.4 Preserve existing check target IDs and checking state handling for provider and Claude Code discovery refreshes.

## 2. Connections UI

- [x] 2.1 Update the Connections list so `Claude Code capabilities` is no longer rendered as a separate selectable row.
- [x] 2.2 Render compact Claude Code detail groups for status, setup guidance, capabilities, profiles, and dependencies using existing AgentHub controls and current density.
- [x] 2.3 Add localized provider check and capability discovery refresh actions inside the Claude Code detail surface.
- [x] 2.4 Keep disabled future provider behavior for Codex and preserve existing narrow layout behavior without introducing a new page style.
- [x] 2.5 Keep raw diagnostics available as secondary detail while making recommended setup guidance the primary issue explanation.

## 3. Localization And Copy

- [x] 3.1 Add English and Simplified Chinese copy for setup guidance, capability refresh, profile status, dependency labels, and secondary diagnostics.
- [x] 3.2 Replace any new product-owned inline strings in Connections view-model or components with translation keys.

## 4. Verification

- [x] 4.1 Update component tests to assert one Claude Code provider row and capability metadata inside the selected Claude Code detail.
- [x] 4.2 Add or update tests for Desktop Runtime offline gating, provider missing, auth/setup required, misconfigured provider, discovery unavailable, checking state, and disabled future provider.
- [x] 4.3 Add or update localization tests for the new English and Simplified Chinese Connections copy.
- [x] 4.4 Run the relevant package tests for UI components, localization, and connection behavior.
- [x] 4.5 Perform rendered verification for connected provider state, failure/setup guidance, merged capability detail, narrow layout, and Simplified Chinese rendering.
