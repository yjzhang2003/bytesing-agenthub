## 1. Audit And Baseline

- [x] 1.1 Compare Settings, Chat, and Agents rendered structure to identify oversized Settings typography, spacing, icon sizes, row heights, and radius values.
- [x] 1.2 Confirm the current AgentHub typography token values and list any Settings CSS rules that bypass them.

## 2. Settings Visual Implementation

- [x] 2.1 Update Settings category navigation typography, icon sizing, padding, row height, and gap values to use compact AgentHub workbench density.
- [x] 2.2 Update Settings grouped panel radius, header height, row height, padding, and spacing so groups remain readable without oversized preference-card treatment.
- [x] 2.3 Replace page-local Settings font sizes with `--agenthub-type-*` tokens for category labels, group headings, row titles, descriptions, metadata, and controls.
- [x] 2.4 Preserve language selection, theme toggle, enter-to-send toggle, permission review action, workspace metadata, runtime metadata, and localized labels.
- [x] 2.5 Verify narrow layout behavior keeps category navigation, grouped rows, and row controls readable without overlap or clipped Chinese labels.

## 3. Verification

- [x] 3.1 Update or add UI tests covering compact Settings structure, tokenized typography usage, and existing Settings interactions.
- [x] 3.2 Add rendered verification coverage for Settings desktop and narrow layouts in English and Simplified Chinese.
- [x] 3.3 Run `pnpm check`, `pnpm check:ui-boundaries`, `git diff --check`, and `openspec validate compact-settings-page --strict`.
