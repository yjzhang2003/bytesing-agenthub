export const componentSystemCss = `
.agenthub-theme-root {
  box-sizing: border-box;
  color: var(--agenthub-text);
  font-family: var(--agenthub-font);
  font-size: var(--agenthub-type-md);
  line-height: 1.5;
  letter-spacing: 0;
}
.agenthub-theme-root *, .agenthub-theme-root *::before, .agenthub-theme-root *::after {
  box-sizing: border-box;
}
.agenthub-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 30px;
  border: 1px solid transparent;
  border-radius: var(--agenthub-radius);
  background: transparent;
  color: inherit;
  font: inherit;
  padding: 0 11px;
  box-shadow: none;
  cursor: pointer;
  transition:
    background-color var(--agenthub-motion-fast),
    border-color var(--agenthub-motion-fast),
    color var(--agenthub-motion-fast),
    opacity var(--agenthub-motion-fast);
}
.agenthub-button[data-size="lg"] { min-height: 38px; padding-inline: 14px; }
.agenthub-button[data-size="sm"] { min-height: 28px; padding-inline: 9px; font-size: var(--agenthub-type-sm); }
.agenthub-button[data-variant="solid"] {
  border-color: var(--agenthub-accent);
  background: var(--agenthub-accent);
  color: var(--agenthub-accent-text);
}
.agenthub-button[data-variant="outline"] {
  border-color: var(--agenthub-border);
  background: var(--agenthub-surface);
}
.agenthub-button[data-variant="subtle"] {
  background: var(--agenthub-surface-hover);
}
.agenthub-button[data-tone="danger"] {
  color: var(--agenthub-danger);
}
.agenthub-button:not(:disabled):hover,
.agenthub-button:not(:disabled):focus-visible {
  border-color: var(--agenthub-border-strong);
  color: var(--agenthub-text);
  background: var(--agenthub-surface-hover);
}
.agenthub-button:disabled {
  color: var(--agenthub-text-muted);
  cursor: not-allowed;
  opacity: .58;
}
.agenthub-icon-button {
  width: 32px;
  padding: 0 !important;
  display: inline-grid;
  place-items: center;
}
.agenthub-input,
.agenthub-select {
  width: 100%;
  min-height: 34px;
  border-color: var(--agenthub-border);
  border-style: solid;
  border-width: 1px;
  border-radius: var(--agenthub-radius);
  background: var(--agenthub-surface);
  color: var(--agenthub-text);
  font: inherit;
  padding: 7px 10px;
  box-shadow: none;
}
.agenthub-input[data-size="sm"],
.agenthub-select[data-size="sm"] {
  min-height: 30px;
  padding-block: 5px;
  font-size: var(--agenthub-type-sm);
}
.agenthub-input[data-invalid="true"],
.agenthub-select[data-invalid="true"] {
  border-color: var(--agenthub-danger);
}
.agenthub-input:hover,
.agenthub-select:not(:disabled):hover {
  border-color: var(--agenthub-border-strong);
}
.agenthub-input:focus,
.agenthub-select:focus {
  border-color: var(--agenthub-accent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--agenthub-accent) 28%, transparent);
  outline: 0;
}
.agenthub-textarea {
  resize: none;
}
.agenthub-search-control {
  position: relative;
  display: inline-flex;
  width: 100%;
  min-width: 0;
}
.agenthub-search-input {
  padding-right: 32px;
}
.agenthub-search-clear {
  position: absolute;
  top: 50%;
  right: 6px;
  width: 22px;
  height: 22px;
  display: inline-grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  transform: translateY(-50%);
  background: transparent;
  color: var(--agenthub-text-muted);
  cursor: pointer;
}
.agenthub-search-clear:hover,
.agenthub-search-clear:focus-visible {
  background: var(--agenthub-surface-hover);
  color: var(--agenthub-text);
}
.agenthub-checkbox {
  accent-color: var(--agenthub-accent);
}
.agenthub-switch {
  position: relative;
  width: 38px;
  min-width: 38px;
  height: 22px;
  border: 1px solid var(--agenthub-border-strong);
  border-radius: 999px;
  background: var(--agenthub-surface-hover);
  cursor: pointer;
}
.agenthub-switch > span[aria-hidden="true"] {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--agenthub-surface);
  box-shadow: 0 1px 2px rgba(0, 0, 0, .18);
  transition: transform var(--agenthub-motion-fast), background-color var(--agenthub-motion-fast);
}
.agenthub-switch[data-state="checked"] {
  border-color: var(--agenthub-accent);
  background: var(--agenthub-accent);
}
.agenthub-switch[data-state="checked"] > span[aria-hidden="true"] {
  transform: translateX(16px);
  background: var(--agenthub-accent-text);
}
.agenthub-switch:disabled {
  cursor: not-allowed;
  opacity: .58;
}
.agenthub-switch-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
.agenthub-form-field {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
}
.agenthub-form-field small {
  color: var(--agenthub-text-muted);
}
.agenthub-form-error {
  color: var(--agenthub-danger);
}
.agenthub-tooltip {
  position: relative;
  display: inline-flex;
}
.agenthub-tooltip-content {
  position: absolute;
  z-index: 45;
  left: 50%;
  bottom: calc(100% + 7px);
  width: max-content;
  max-width: min(260px, 80vw);
  transform: translateX(-50%);
  border: 1px solid var(--agenthub-border);
  border-radius: var(--agenthub-radius);
  padding: 5px 8px;
  background: var(--agenthub-surface);
  color: var(--agenthub-text);
  box-shadow: 0 10px 28px rgba(0, 0, 0, .18);
  font-size: var(--agenthub-type-sm);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--agenthub-motion-fast);
  transition-delay: var(--agenthub-tooltip-delay, 400ms);
}
.agenthub-tooltip[data-side="bottom"] .agenthub-tooltip-content {
  top: calc(100% + 7px);
  bottom: auto;
}
.agenthub-tooltip:focus-within .agenthub-tooltip-content,
.agenthub-tooltip:hover .agenthub-tooltip-content {
  opacity: 1;
}
.agenthub-dropdown {
  position: relative;
  display: inline-flex;
}
.agenthub-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 42;
  min-width: 156px;
  display: grid;
  gap: 2px;
  padding: 5px;
  border: 1px solid var(--agenthub-border);
  border-radius: var(--agenthub-radius);
  background: var(--agenthub-surface);
  box-shadow: 0 18px 46px rgba(0, 0, 0, .22);
}
.agenthub-dropdown-menu[data-align="end"] {
  right: 0;
  left: auto;
}
.agenthub-dropdown-menu button {
  min-height: 30px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--agenthub-text);
  font: inherit;
  text-align: left;
  padding: 0 9px;
  cursor: pointer;
}
.agenthub-dropdown-menu button[data-tone="danger"] {
  color: var(--agenthub-danger);
}
.agenthub-dropdown-menu button:disabled {
  color: var(--agenthub-text-muted);
  cursor: not-allowed;
}
.agenthub-dropdown-menu button:not(:disabled):hover,
.agenthub-dropdown-menu button:not(:disabled):focus-visible {
  background: var(--agenthub-surface-hover);
  outline: 0;
}
.agenthub-dialog-root {
  color: var(--agenthub-text);
  font-family: var(--agenthub-font);
}
.agenthub-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 40;
  max-width: calc(100vw - 32px);
  transform: translate(-50%, -50%);
  background: var(--agenthub-surface);
  color: var(--agenthub-text);
  border-radius: 8px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, .22);
}
.agenthub-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 39;
  background: rgba(0, 0, 0, .42);
}
.agenthub-dialog-header {
  min-height: 54px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.agenthub-dialog-header h2 {
  margin: 0;
  font-size: var(--agenthub-type-title);
  line-height: 1.2;
  color: var(--agenthub-text);
}
.agenthub-dialog-description {
  margin: -6px 18px 12px;
  color: var(--agenthub-text-secondary);
}
.agenthub-dialog-close {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: var(--agenthub-radius);
  background: transparent;
  color: var(--agenthub-text-muted);
  cursor: pointer;
  font: inherit;
}
.agenthub-dialog-close:hover,
.agenthub-dialog-close:focus-visible {
  color: var(--agenthub-text);
  background: var(--agenthub-surface-hover);
}
.agenthub-dialog-body {
  padding: 0 18px 14px;
}
.agenthub-dialog-footer {
  padding: 0 18px 18px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.agenthub-tabs {
  display: grid;
  gap: 10px;
}
.agenthub-tabs [role="tablist"] {
  display: inline-flex;
  gap: 4px;
  padding: 3px;
  border-radius: var(--agenthub-radius);
  background: var(--agenthub-surface-hover);
}
.agenthub-tabs [role="tab"] {
  min-height: 28px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--agenthub-text-secondary);
  font: inherit;
  padding: 0 10px;
  cursor: pointer;
}
.agenthub-tabs [role="tab"][data-state="active"] {
  background: var(--agenthub-surface);
  color: var(--agenthub-text);
  box-shadow: 0 1px 2px rgba(0, 0, 0, .08);
}
.agenthub-avatar {
  width: 32px;
  height: 32px;
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 999px;
  background: color-mix(in srgb, var(--agenthub-accent) 12%, var(--agenthub-surface-hover));
  color: var(--agenthub-text);
  font-weight: 750;
}
.agenthub-avatar[data-shape="square"] {
  border-radius: var(--agenthub-radius);
}
.agenthub-badge {
  min-width: 18px;
  min-height: 18px;
  padding: 1px 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--agenthub-surface-hover);
  color: var(--agenthub-text-muted);
  font-size: 11px;
  font-weight: 700;
  box-shadow: none;
}
.agenthub-badge[data-tone="success"] { color: var(--agenthub-status); }
.agenthub-badge[data-tone="warning"] { color: var(--agenthub-warning); }
.agenthub-badge[data-tone="danger"] { color: var(--agenthub-danger); }
.agenthub-empty-state {
  color: var(--agenthub-text-muted);
}
.agenthub-loading-spinner,
.agenthub-loading-skeleton {
  display: inline-grid;
  gap: 6px;
  color: var(--agenthub-text-muted);
}
.agenthub-loading-spinner::before {
  content: "";
  width: 16px;
  height: 16px;
  border: 2px solid var(--agenthub-border);
  border-top-color: var(--agenthub-accent);
  border-radius: 999px;
  animation: agenthub-loading-spin 900ms linear infinite;
}
.agenthub-loading-skeleton > span {
  width: 100%;
  min-width: 120px;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--agenthub-surface-hover), var(--agenthub-border), var(--agenthub-surface-hover));
  background-size: 200% 100%;
  animation: agenthub-loading-skeleton 1100ms ease-in-out infinite;
}
.agenthub-toast-region {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 60;
  display: grid;
  gap: 8px;
}
.agenthub-toast {
  min-width: 220px;
  max-width: min(360px, calc(100vw - 36px));
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--agenthub-border);
  border-radius: var(--agenthub-radius);
  padding: 9px 10px;
  background: var(--agenthub-surface);
  color: var(--agenthub-text);
  box-shadow: 0 18px 46px rgba(0, 0, 0, .22);
}
.agenthub-toast[data-tone="error"] { border-color: var(--agenthub-danger); }
.agenthub-toast[data-tone="success"] { border-color: var(--agenthub-status); }
.agenthub-toast[data-tone="warning"] { border-color: var(--agenthub-warning); }
.agenthub-toast button {
  border: 0;
  border-radius: 5px;
  background: transparent;
  color: var(--agenthub-text-muted);
  cursor: pointer;
}
@keyframes agenthub-loading-spin {
  to { transform: rotate(360deg); }
}
@keyframes agenthub-loading-skeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .agenthub-loading-spinner::before,
  .agenthub-loading-skeleton > span {
    animation: none;
  }
}
`;

export const workbenchCss = `
html, body, #root {
  min-width: 0;
  width: 100%;
  min-height: 100%;
  margin: 0;
  background: #f4f4f1;
}
body { overflow: hidden; }
.agenthub-workbench {
  --agenthub-bg: #f4f4f1;
  --agenthub-surface: #ffffff;
  --agenthub-surface-2: #f8f8f6;
  --agenthub-surface-hover: #eeeeeb;
  --agenthub-border: #deded9;
  --agenthub-border-strong: #b9bbb4;
  --agenthub-text: #171817;
  --agenthub-text-secondary: #4f565f;
  --agenthub-text-muted: #747b83;
  --agenthub-accent: #20242c;
  --agenthub-accent-text: #ffffff;
  --agenthub-status: #287348;
  --agenthub-warning: #9a6400;
  --agenthub-danger: #a62a2a;
  --agenthub-radius: 7px;
  --agenthub-bubble-radius: 13px;
  --agenthub-motion-fast: 140ms ease;
  --agenthub-motion-medium: 220ms cubic-bezier(.2, .8, .2, 1);
  --agenthub-left-column: clamp(300px, 24vw, 340px);
  --agenthub-right-column: clamp(320px, 26vw, 380px);
  --agenthub-font: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  --agenthub-mono: "SFMono-Regular", "SF Mono", Consolas, "Liberation Mono", monospace;
  --agenthub-type-xs: 11px;
  --agenthub-type-sm: 12px;
  --agenthub-type-md: 13px;
  --agenthub-type-lg: 14px;
  --agenthub-type-title: 16px;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  display: grid;
  grid-template-columns: var(--agenthub-left-column) minmax(0, 1fr) var(--agenthub-right-column);
  background: var(--agenthub-bg);
  color: var(--agenthub-text);
  font-family: var(--agenthub-font);
  font-size: var(--agenthub-type-md);
  line-height: 1.5;
  letter-spacing: 0;
  transition: grid-template-columns var(--agenthub-motion-medium);
}
.agenthub-workbench[data-theme="dark"] {
  --agenthub-bg: #10110f;
  --agenthub-surface: #171815;
  --agenthub-surface-2: #1f211d;
  --agenthub-surface-hover: #282a26;
  --agenthub-border: #30322e;
  --agenthub-border-strong: #565a51;
  --agenthub-text: #f2f2ee;
  --agenthub-text-secondary: #bebfb7;
  --agenthub-text-muted: #8d9188;
  --agenthub-accent: #f2f2ee;
  --agenthub-accent-text: #11120f;
  --agenthub-status: #7fd29a;
  --agenthub-warning: #d6b25e;
  --agenthub-danger: #ff8a8a;
}
.agenthub-workbench *, .agenthub-workbench *::before, .agenthub-workbench *::after { box-sizing: border-box; }
.agenthub-icon { width: 14px; height: 14px; flex: 0 0 auto; stroke-width: 1.8; }
.agenthub-motion-left-panel, .agenthub-motion-right-panel,
.agenthub-left-nav, .agenthub-center, .agenthub-inspector {
  min-width: 0;
  background: var(--agenthub-surface);
}
.agenthub-motion-left-panel,
.agenthub-motion-right-panel {
  position: relative;
  min-height: 0;
  overflow: hidden;
}
.agenthub-motion-left-panel[aria-hidden="true"],
.agenthub-motion-right-panel[aria-hidden="true"] {
  pointer-events: none;
}
.agenthub-motion-left-panel > .agenthub-left-nav,
.agenthub-motion-right-panel > .agenthub-inspector {
  width: 100%;
  height: 100%;
}
.agenthub-left-nav {
  position: relative;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  padding: 0;
  border-right: 1px solid var(--agenthub-border);
  min-height: 0;
  overflow: hidden;
}
.agenthub-left-nav[data-compact="true"] {
  grid-template-columns: 58px;
}
.agenthub-left-rail {
  min-width: 0;
  min-height: 0;
  padding: 12px 9px;
  border-right: 1px solid var(--agenthub-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  background: color-mix(in srgb, var(--agenthub-surface) 92%, var(--agenthub-bg));
}
.agenthub-chat-list-panel {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: 64px minmax(0, 1fr);
}
.agenthub-center {
  display: grid;
  grid-template-rows: 64px minmax(0, 1fr) auto;
  height: 100vh;
  height: 100dvh;
  min-height: 100vh;
  min-height: 100dvh;
  min-width: 0;
  overflow: hidden;
  background: var(--agenthub-bg);
}
.agenthub-inspector {
  border-left: 1px solid var(--agenthub-border);
  min-width: 0;
  overflow: hidden;
}
.agenthub-conversation-header, .agenthub-inspector > header {
  min-height: 64px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--agenthub-border);
  gap: 12px;
  background: color-mix(in srgb, var(--agenthub-surface) 96%, var(--agenthub-bg));
}
.agenthub-header-actions { display: inline-flex; align-items: center; gap: 8px; }
.agenthub-mobile-panel-actions { display: none; align-items: center; gap: 8px; }
.agenthub-title-cluster { display: inline-flex; align-items: center; gap: 10px; min-width: 0; }
.agenthub-title-cluster > div,
.agenthub-chat-title-button {
  display: grid;
  gap: 1px;
  min-width: 0;
}
.agenthub-chat-title-button {
  padding: 4px 6px;
  border: 1px solid transparent;
  border-radius: var(--agenthub-radius);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color var(--agenthub-motion-fast),
    border-color var(--agenthub-motion-fast);
}
.agenthub-chat-title-button:hover,
.agenthub-chat-title-button:focus-visible {
  border-color: var(--agenthub-border-strong);
  background: var(--agenthub-surface-hover);
}
.agenthub-workspace-status {
  display: grid;
  gap: 7px;
  padding: 4px 4px 10px;
}
.agenthub-workspace-status strong { font-size: 13px; font-weight: 650; }
.agenthub-row-main, .agenthub-workspace-status strong, .agenthub-conversation-header strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.agenthub-conversation-header strong {
  font-size: 14px;
  font-weight: 700;
}
.agenthub-muted, .agenthub-workbench small {
  color: var(--agenthub-text-muted);
  font-size: 11px;
}
.agenthub-separator {
  height: 1px;
  background: var(--agenthub-border);
  margin: 4px 0;
}
.agenthub-scroll-root { min-height: 0; flex: 1 1 auto; overflow: hidden; }
.agenthub-chat-list-panel > .agenthub-scroll-root { padding: 0 0 14px; }
.agenthub-scroll-viewport { width: 100%; height: 100%; }
.agenthub-scrollbar { width: 8px; padding: 2px; }
.agenthub-scroll-thumb { border-radius: 999px; background: var(--agenthub-border-strong); }
.agenthub-nav-bottom {
  flex: 0 0 auto;
  margin-top: auto;
  display: grid;
  gap: 9px;
}
.agenthub-hover-control {
  min-height: 30px;
  border: 1px solid transparent;
  border-radius: var(--agenthub-radius);
  background: transparent;
  color: inherit;
  font: inherit;
  padding: 0 11px;
  transition:
    background-color var(--agenthub-motion-fast),
    border-color var(--agenthub-motion-fast),
    color var(--agenthub-motion-fast),
    opacity var(--agenthub-motion-fast);
}
.agenthub-hover-control:hover:not(:disabled),
.agenthub-hover-control:focus-visible,
.agenthub-hover-control[aria-current="page"],
.agenthub-hover-control[aria-pressed="true"] {
  border-color: var(--agenthub-border-strong);
  background: var(--agenthub-surface-hover);
}
.agenthub-hover-control:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: 1px solid var(--agenthub-accent);
  outline-offset: 2px;
}
.agenthub-hover-control:disabled, .agenthub-composer textarea:disabled {
  color: var(--agenthub-text-muted);
  background: transparent;
  opacity: .58;
}
.agenthub-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 30px;
  border: 1px solid transparent;
  border-radius: var(--agenthub-radius);
  background: transparent;
  color: inherit;
  font: inherit;
  padding: 0 11px;
  box-shadow: none;
  cursor: pointer;
  transition:
    background-color var(--agenthub-motion-fast),
    border-color var(--agenthub-motion-fast),
    color var(--agenthub-motion-fast),
    opacity var(--agenthub-motion-fast);
}
.agenthub-button[data-variant="solid"] {
  border-color: var(--agenthub-accent);
  background: var(--agenthub-accent);
  color: var(--agenthub-accent-text);
}
.agenthub-button[data-variant="outline"] {
  border-color: var(--agenthub-border);
  background: var(--agenthub-surface);
}
.agenthub-button[data-tone="danger"] {
  color: var(--agenthub-danger);
}
.agenthub-button.agenthub-agent-contact-row,
.agenthub-button.agenthub-provider-row,
.agenthub-button.agenthub-composer-suggestion {
  display: grid;
  height: auto;
  justify-content: initial;
}
.agenthub-button.agenthub-composer-send,
.agenthub-button.agenthub-icon-button {
  display: inline-grid;
}
.agenthub-button:not(:disabled):hover,
.agenthub-button:not(:disabled):focus-visible {
  border-color: var(--agenthub-border-strong);
  color: var(--agenthub-text);
  background: var(--agenthub-surface-hover);
}
.agenthub-button:disabled {
  color: var(--agenthub-text-muted);
  cursor: not-allowed;
  opacity: .58;
}
.agenthub-input,
.agenthub-select {
  width: 100%;
  border-color: var(--agenthub-border);
  border-style: solid;
  border-width: 1px;
  border-radius: var(--agenthub-radius);
  background: var(--agenthub-surface);
  color: var(--agenthub-text);
  font: inherit;
  padding: 7px 10px;
  box-shadow: none;
}
.agenthub-search-control {
  position: relative;
  display: inline-flex;
  width: 100%;
  min-width: 0;
}
.agenthub-search-clear {
  position: absolute;
  top: 50%;
  right: 6px;
  width: 22px;
  height: 22px;
  display: inline-grid;
  place-items: center;
  border: 0;
  border-radius: 999px;
  transform: translateY(-50%);
  background: transparent;
  color: var(--agenthub-text-muted);
  cursor: pointer;
}
.agenthub-search-clear:hover,
.agenthub-search-clear:focus-visible {
  background: var(--agenthub-surface-hover);
  color: var(--agenthub-text);
}
.agenthub-input,
.agenthub-select {
  min-height: 34px;
}
.agenthub-input,
.agenthub-workbench textarea {
  resize: none;
}
.agenthub-input:hover,
.agenthub-select:not(:disabled):hover {
  border-color: var(--agenthub-border-strong);
}
.agenthub-input:focus,
.agenthub-select:focus {
  border-color: var(--agenthub-accent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--agenthub-accent) 28%, transparent);
}
.agenthub-avatar {
  width: 32px;
  height: 32px;
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 999px;
  background: color-mix(in srgb, var(--agenthub-accent) 12%, var(--agenthub-surface-hover));
  color: var(--agenthub-text);
  font-weight: 750;
}
.agenthub-avatar[data-shape="square"] {
  border-radius: var(--agenthub-radius);
}
.agenthub-badge {
  min-width: 18px;
  min-height: 18px;
  padding: 1px 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--agenthub-surface-hover);
  color: var(--agenthub-text-muted);
  font-size: 11px;
  font-weight: 700;
  box-shadow: none;
}
.agenthub-badge[data-tone="success"] { color: var(--agenthub-status); }
.agenthub-badge[data-tone="warning"] { color: var(--agenthub-warning); }
.agenthub-badge[data-tone="danger"] { color: var(--agenthub-danger); }
.agenthub-empty-state {
  color: var(--agenthub-text-muted);
}
.agenthub-form-field {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
}
.agenthub-sidebar-toggle {
  width: 30px;
  min-height: 30px;
  padding: 0;
  display: inline-grid;
  place-items: center;
}
.agenthub-rail-button {
  position: relative;
  width: 40px;
  min-height: 40px;
  padding: 0;
  display: inline-grid;
  place-items: center;
}
.agenthub-rail-button small {
  position: absolute;
  top: 3px;
  right: 3px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 999px;
  display: inline-grid;
  place-items: center;
  background: var(--agenthub-surface-hover);
  color: var(--agenthub-text-muted);
  font-size: 9px;
  line-height: 1;
}
.agenthub-rail-status-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--agenthub-text-muted);
}
.agenthub-rail-status-dot[data-status="online"],
.agenthub-rail-status-dot[data-status="active-running"] { background: var(--agenthub-status); }
.agenthub-rail-status-dot[data-status="offline"],
.agenthub-rail-status-dot[data-status="degraded"] { background: var(--agenthub-warning); }
.agenthub-sidebar-search {
  min-height: 34px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: var(--agenthub-radius);
  background: var(--agenthub-surface-hover);
  color: var(--agenthub-text-muted);
  transition:
    border-color var(--agenthub-motion-fast),
    background-color var(--agenthub-motion-fast),
    box-shadow var(--agenthub-motion-fast);
}
.agenthub-chat-list-header {
  min-height: 64px;
  padding: 12px 7px;
  display: flex;
  align-items: center;
  gap: 7px;
  border-bottom: 1px solid var(--agenthub-border);
}
.agenthub-chat-list-header .agenthub-sidebar-search {
  flex: 1 1 auto;
}
.agenthub-sidebar-search:focus-within {
  border-color: var(--agenthub-border-strong);
  outline: 1px solid var(--agenthub-accent);
  outline-offset: 2px;
}
.agenthub-sidebar-search input {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--agenthub-text);
  font: inherit;
}
.agenthub-nav-row {
  width: 100%;
  min-width: 0;
  min-height: 34px;
  text-align: left;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}
.agenthub-nav-row small, .agenthub-row-meta { justify-self: end; color: var(--agenthub-text-muted); }
.agenthub-conversation-list {
  display: grid;
  gap: 0;
  padding-top: 0;
}
.agenthub-conversation-row {
  position: relative;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    "title status"
    "participants status";
  align-items: start;
  min-height: 64px;
  padding: 10px 14px;
  border-color: transparent;
  border-radius: 0;
  gap: 2px 10px;
  line-height: 1.25;
  transition:
    background-color var(--agenthub-motion-fast);
}
.agenthub-conversation-row:hover:not(:disabled),
.agenthub-conversation-row[aria-current="page"] {
  border-color: transparent;
  background: var(--agenthub-surface-hover);
}
.agenthub-conversation-row .agenthub-row-main { grid-area: title; }
.agenthub-conversation-row small {
  grid-area: participants;
  justify-self: start;
}
.agenthub-conversation-row .agenthub-row-meta {
  grid-area: status;
  align-self: end;
}
.agenthub-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--agenthub-text-secondary);
  font-size: 11px;
}
.agenthub-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--agenthub-text-muted);
  flex: 0 0 auto;
}
.agenthub-status-badge[data-status="online"] .agenthub-status-dot,
.agenthub-status-badge[data-status="active-running"] .agenthub-status-dot { background: var(--agenthub-status); }
.agenthub-status-badge[data-status="offline"] .agenthub-status-dot,
.agenthub-status-badge[data-status="degraded"] .agenthub-status-dot { background: var(--agenthub-warning); }
.agenthub-chat-thread {
  list-style: none;
  margin: 0;
  padding: 22px 28px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  min-width: 0;
  min-height: 0;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--agenthub-bg) 92%, var(--agenthub-surface)) 0%, var(--agenthub-bg) 100%);
}
.agenthub-chat-thread > li { display: grid; min-width: 0; }
.agenthub-chat-thread > li:first-child { margin-top: auto; }
.agenthub-message-row {
  grid-template-columns: 26px minmax(0, 1fr);
  align-items: start;
  max-width: min(82%, 820px);
  display: grid;
  gap: 10px;
  justify-self: start;
}
.agenthub-message-row[data-author="user"] {
  justify-self: end;
  direction: rtl;
}
.agenthub-message-row[data-author="user"] .agenthub-message-content {
  direction: ltr;
  align-items: end;
}
.agenthub-message-meta {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  color: var(--agenthub-text-muted);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.2;
}
.agenthub-message-agent-link {
  min-height: 18px;
  padding: 0 2px;
  border-radius: 4px;
}
.agenthub-message-content {
  display: grid;
  gap: 5px;
  min-width: 0;
}
.agenthub-message-avatar {
  width: 26px;
  height: 26px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--agenthub-accent) 12%, var(--agenthub-surface-hover));
  color: var(--agenthub-text);
  font-size: 10px;
  font-weight: 750;
  margin-top: 17px;
}
.agenthub-message-bubble {
  border: 1px solid var(--agenthub-border);
  border-radius: var(--agenthub-bubble-radius);
  padding: 10px 12px;
  background: var(--agenthub-surface);
  box-shadow: 0 1px 0 rgba(17, 24, 39, .04);
  overflow-wrap: anywhere;
  transition:
    border-color var(--agenthub-motion-fast),
    background-color var(--agenthub-motion-fast),
    box-shadow var(--agenthub-motion-fast);
}
.agenthub-message-bubble[data-author="user"] {
  border-color: var(--agenthub-accent);
  background: var(--agenthub-accent);
  color: var(--agenthub-accent-text);
}
.agenthub-message-row[data-author="agent"] .agenthub-message-bubble:has(.agenthub-message-loading) {
  min-width: 148px;
}
.agenthub-message-loading {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 18px;
  margin-bottom: 6px;
}
.agenthub-message-loading-dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--agenthub-text-muted);
  animation: agenthub-message-loading 1s infinite ease-in-out;
}
.agenthub-message-loading-dot:nth-child(2) { animation-delay: .16s; }
.agenthub-message-loading-dot:nth-child(3) { animation-delay: .32s; }
.agenthub-message-bubble p { margin: 0; }
.agenthub-markdown {
  display: grid;
  gap: 8px;
  min-width: 0;
}
.agenthub-markdown > :first-child { margin-top: 0; }
.agenthub-markdown > :last-child { margin-bottom: 0; }
.agenthub-markdown p,
.agenthub-markdown h1,
.agenthub-markdown h2,
.agenthub-markdown h3,
.agenthub-markdown h4,
.agenthub-markdown ul,
.agenthub-markdown ol,
.agenthub-markdown blockquote,
.agenthub-markdown pre {
  margin: 0;
}
.agenthub-markdown h1,
.agenthub-markdown h2,
.agenthub-markdown h3,
.agenthub-markdown h4 {
  font-size: 1em;
  line-height: 1.35;
  font-weight: 750;
}
.agenthub-markdown ul,
.agenthub-markdown ol {
  display: grid;
  gap: 4px;
  padding-left: 18px;
}
.agenthub-markdown li > p { display: inline; }
.agenthub-markdown code {
  border: 1px solid color-mix(in srgb, var(--agenthub-border) 82%, transparent);
  border-radius: 4px;
  padding: 1px 4px;
  background: color-mix(in srgb, var(--agenthub-bg) 72%, var(--agenthub-surface));
  font-family: var(--agenthub-mono);
  font-size: .92em;
}
.agenthub-markdown pre {
  overflow-x: auto;
  border: 1px solid var(--agenthub-border);
  border-radius: 6px;
  padding: 9px 10px;
  background: color-mix(in srgb, var(--agenthub-bg) 86%, #000);
}
.agenthub-markdown pre code {
  border: 0;
  padding: 0;
  background: transparent;
  white-space: pre;
}
.agenthub-markdown blockquote {
  border-left: 2px solid var(--agenthub-border-strong);
  padding-left: 10px;
  color: var(--agenthub-text-secondary);
}
.agenthub-markdown a {
  color: var(--agenthub-accent);
  text-decoration: none;
}
.agenthub-markdown a:hover { text-decoration: underline; }
.agenthub-markdown hr {
  width: 100%;
  border: 0;
  border-top: 1px solid var(--agenthub-border);
}
.agenthub-markdown-table {
  overflow-x: auto;
  max-width: 100%;
}
.agenthub-markdown table {
  width: max-content;
  min-width: 100%;
  border-collapse: collapse;
}
.agenthub-markdown th,
.agenthub-markdown td {
  border: 1px solid var(--agenthub-border);
  padding: 5px 7px;
  text-align: left;
}
@keyframes agenthub-message-loading {
  0%, 80%, 100% { opacity: .36; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-2px); }
}
.agenthub-event-pill {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  min-height: 26px;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--agenthub-surface-hover);
  color: var(--agenthub-text-secondary);
  font-size: 11px;
}
.agenthub-event-pill[data-state="blocked"] { color: var(--agenthub-warning); }
.agenthub-event-pill[data-state="error"] { color: var(--agenthub-danger); }
.agenthub-compact-timeline-card {
  justify-self: stretch;
  width: min(100%, 760px);
  min-height: 44px;
  text-align: left;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 4px 10px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--agenthub-surface) 94%, var(--agenthub-bg));
}
.agenthub-compact-timeline-card[data-kind="permission"][data-state="blocked"] { color: var(--agenthub-warning); }
.agenthub-compact-timeline-card[data-kind="diff"] { font-family: var(--agenthub-font); }
.agenthub-timeline-line {
  grid-column: 1 / -1;
  display: block;
  color: var(--agenthub-text-secondary);
  overflow-wrap: anywhere;
  min-width: 0;
}
.agenthub-composer {
  position: sticky;
  bottom: 0;
  z-index: 2;
  padding: 0 16px 14px;
  background: var(--agenthub-bg);
}
.agenthub-composer-box {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: "input actions";
  align-items: center;
  gap: 8px;
  border: 1px solid var(--agenthub-border);
  border-radius: 18px;
  min-height: 46px;
  padding: 7px 10px 7px 14px;
  background: var(--agenthub-surface);
  box-shadow: 0 1px 0 rgba(17, 24, 39, .04);
  transition:
    border-color var(--agenthub-motion-fast),
    box-shadow var(--agenthub-motion-fast),
    padding var(--agenthub-motion-medium),
    min-height var(--agenthub-motion-medium);
}
.agenthub-composer-box[data-multiline="true"] {
  align-items: end;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    "input"
    "actions";
  padding-block: 10px;
}
.agenthub-composer-box:focus-within {
  border-color: var(--agenthub-border-strong);
}
.agenthub-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.agenthub-composer .agenthub-input,
.agenthub-composer textarea {
  grid-area: input;
  width: 100%;
  min-height: 28px;
  max-height: 128px;
  resize: none;
  overflow-y: auto;
  border: 0;
  border-radius: 0;
  padding: 3px 0;
  background: transparent;
  color: var(--agenthub-text);
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  transition: height var(--agenthub-motion-medium);
}
.agenthub-composer .agenthub-input,
.agenthub-composer .agenthub-input:hover,
.agenthub-composer .agenthub-input:focus {
  border-color: transparent;
  box-shadow: none;
  outline: 0;
}
.agenthub-composer textarea:focus-visible {
  outline: 0;
}
.agenthub-composer-actions {
  grid-area: actions;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  transition: transform var(--agenthub-motion-medium), opacity var(--agenthub-motion-medium);
}
.agenthub-composer-send {
  width: 36px;
  min-height: 36px;
  padding: 0;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
}
.agenthub-composer-suggestions {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: calc(100% + 8px);
  z-index: 5;
  display: grid;
  gap: 4px;
  padding: 6px;
  border: 1px solid var(--agenthub-border);
  border-radius: 12px;
  background: var(--agenthub-surface);
  box-shadow: 0 18px 46px rgba(0, 0, 0, .26);
}
.agenthub-composer-suggestion {
  min-height: 34px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  text-align: left;
}
.agenthub-icon-button {
  width: 32px;
  padding: 0 !important;
  display: inline-grid;
  place-items: center;
}
.agenthub-mode-label { color: var(--agenthub-text-secondary); font-size: 11px; }
.agenthub-warning { color: var(--agenthub-warning); }
.agenthub-center[data-view="settings"],
.agenthub-center[data-view="agents"],
.agenthub-center[data-view="connections"] { grid-template-rows: 64px minmax(0, 1fr); }
.agenthub-center[data-view="connections"] .agenthub-settings-panel {
  width: min(100%, 1120px);
}
.agenthub-settings-panel {
  width: min(100%, 820px);
  border-top: 1px solid var(--agenthub-border);
  padding-top: 16px;
  display: grid;
  gap: 13px;
}
.agenthub-settings-panel:first-child {
  border-top: 0;
  padding-top: 0;
}
.agenthub-settings-panel > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}
.agenthub-settings-panel > header strong {
  display: block;
  font-size: 13px;
  font-weight: 650;
}
.agenthub-settings-panel > header p { margin: 2px 0 0; }
.agenthub-settings-switch {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--agenthub-text-secondary);
  font-size: 12px;
}
.agenthub-settings-switch small {
  display: block;
  margin-top: 2px;
  color: var(--agenthub-text-muted);
}
.agenthub-settings-stack {
  display: grid;
  gap: 10px;
}
.agenthub-agents-page {
  position: relative;
  min-width: 0;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--agenthub-bg);
  overflow: hidden;
}
.agenthub-agent-directory-sidebar {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: 64px minmax(0, 1fr);
  border-right: 1px solid var(--agenthub-border);
  background: var(--agenthub-surface);
}
.agenthub-resize-handle {
  touch-action: none;
}
.agenthub-panel-resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  bottom: 0;
  z-index: 4;
  width: 6px;
  cursor: col-resize;
}
.agenthub-directory-resize-handle {
  min-width: 6px;
  width: 6px;
  cursor: col-resize;
  background: transparent;
}
.agenthub-directory-resize-handle::after {
  content: "";
  display: block;
  width: 1px;
  height: 100%;
  margin: 0 auto;
  background: var(--agenthub-border);
}
.agenthub-panel-resize-handle::before {
  content: "";
  position: absolute;
  inset: 0;
}
.agenthub-directory-resize-handle:hover::after,
.agenthub-directory-resize-handle:focus-visible::after {
  background: var(--agenthub-border-strong);
}
.agenthub-agent-directory-header {
  min-width: 0;
  min-height: 64px;
  padding: 12px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--agenthub-border);
}
.agenthub-agent-directory-header .agenthub-sidebar-search {
  flex: 1 1 auto;
}
.agenthub-agent-directory-list {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  display: grid;
  align-content: start;
  gap: 0;
  padding: 0;
}
.agenthub-agent-directory-group {
  padding: 7px 18px;
  color: var(--agenthub-text-muted);
  font-weight: 650;
  text-transform: uppercase;
}
.agenthub-agent-contact-row {
  width: 100%;
  min-height: 64px;
  padding: 9px 14px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  border: 0;
  border-radius: 0;
  text-align: left;
}
.agenthub-agent-contact-row[aria-pressed="true"] {
  background: var(--agenthub-surface-hover);
}
.agenthub-agent-avatar,
.agenthub-agent-profile-avatar {
  display: inline-grid;
  place-items: center;
  border-radius: var(--agenthub-radius);
  background: color-mix(in srgb, var(--agenthub-accent) 12%, var(--agenthub-surface-hover));
  color: var(--agenthub-text);
  font-weight: 750;
}
.agenthub-agent-avatar {
  width: 42px;
  height: 42px;
  font-size: 12px;
}
.agenthub-agent-contact-copy {
  min-width: 0;
  display: grid;
  gap: 1px;
}
.agenthub-agent-contact-copy .agenthub-row-main {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.agenthub-agent-detail {
  --agenthub-agent-detail-x: min(5vw, 56px);
  position: relative;
  min-width: 0;
  width: 100%;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 28px var(--agenthub-agent-detail-x) 104px;
  display: grid;
  align-content: start;
  gap: 18px;
}
.agenthub-agent-profile {
  min-width: 0;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}
.agenthub-agent-profile-avatar {
  width: 52px;
  height: 52px;
  font-size: var(--agenthub-type-title);
}
.agenthub-agent-profile-avatar .agenthub-icon {
  width: 20px;
  height: 20px;
}
.agenthub-agent-profile-copy {
  min-width: 0;
  display: grid;
  justify-items: start;
  gap: 6px;
}
.agenthub-agent-profile-copy strong {
  font-size: 22px;
  line-height: 1.14;
  letter-spacing: 0;
}
.agenthub-agent-profile-copy p {
  margin: 0;
}
.agenthub-agent-status-pill {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  padding: 2px 8px;
  border: 1px solid var(--agenthub-border);
  border-radius: 999px;
  color: var(--agenthub-text-secondary);
  font-size: var(--agenthub-type-sm);
  line-height: 1.2;
}
.agenthub-section-heading {
  min-width: 0;
  display: grid;
  gap: 4px;
}
.agenthub-section-heading strong,
.agenthub-section-heading h3 {
  margin: 0;
  font-size: var(--agenthub-type-title);
  line-height: 1.2;
}
.agenthub-section-heading small {
  color: var(--agenthub-text-secondary);
  font-size: var(--agenthub-type-md);
}
.agenthub-agent-template-section {
  display: grid;
}
.agenthub-agent-template-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  padding: 14px 18px 16px;
}
.agenthub-button.agenthub-agent-template-option {
  min-width: 0;
  height: auto;
  min-height: 76px;
  padding: 11px;
  display: grid;
  justify-content: stretch;
  align-content: start;
  gap: 5px;
  border: 1px solid var(--agenthub-border);
  border-radius: var(--agenthub-radius);
  text-align: left;
}
.agenthub-agent-template-option > span {
  font-size: var(--agenthub-type-md);
  font-weight: 700;
}
.agenthub-agent-template-option > small {
  color: var(--agenthub-text-secondary);
  font-size: var(--agenthub-type-sm);
  line-height: 1.35;
  white-space: normal;
}
.agenthub-agent-template-option[aria-pressed="true"] {
  border-color: var(--agenthub-border-strong);
  background: var(--agenthub-surface-hover);
}
.agenthub-agent-advanced {
  padding: 0;
}
.agenthub-agent-settings-group > header,
.agenthub-agent-advanced summary {
  min-height: 50px;
  padding: 0 18px;
  display: flex;
  align-items: center;
}
.agenthub-agent-advanced summary {
  cursor: pointer;
  color: var(--agenthub-text);
  list-style: none;
}
.agenthub-agent-advanced summary::-webkit-details-marker {
  display: none;
}
.agenthub-agent-settings-group > header h3,
.agenthub-agent-advanced summary h3 {
  margin: 0;
  font-size: var(--agenthub-type-title);
  line-height: 1.2;
}
.agenthub-agent-advanced-grid {
  display: grid;
}
.agenthub-agent-form-actions {
  width: min(100%, 820px);
  justify-content: flex-end;
  margin: 0;
}
.agenthub-button.agenthub-agent-delete-button {
  min-height: 34px;
  padding-inline: 12px;
  border-color: transparent;
  background: color-mix(in srgb, var(--agenthub-surface) 96%, transparent);
  color: var(--agenthub-text);
  font-size: var(--agenthub-type-md);
  font-weight: 700;
  transition:
    background-color var(--agenthub-motion-fast),
    border-color var(--agenthub-motion-fast),
    color var(--agenthub-motion-fast);
}
.agenthub-button.agenthub-agent-delete-button:hover,
.agenthub-button.agenthub-agent-delete-button:focus-visible {
  border-color: var(--agenthub-danger);
  background: color-mix(in srgb, var(--agenthub-danger) 10%, var(--agenthub-surface));
  color: var(--agenthub-danger);
}
.agenthub-agents-layout,
.agenthub-connections-layout {
  display: grid;
  grid-template-columns: var(--agenthub-directory-column) 6px minmax(0, 1fr);
  gap: 0;
  align-items: start;
}
.agenthub-agent-list,
.agenthub-provider-list {
  display: grid;
  gap: 6px;
  min-width: 0;
}
.agenthub-agent-row,
.agenthub-provider-row {
  min-width: 0;
  width: 100%;
  min-height: 52px;
  padding: 8px 10px;
  text-align: left;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2px 10px;
  align-items: start;
  border-color: var(--agenthub-border);
}
.agenthub-provider-row {
  grid-template-columns: auto minmax(0, 1fr) auto;
}
.agenthub-agent-row .agenthub-timeline-line,
.agenthub-provider-row .agenthub-timeline-line {
  grid-column: 1 / -1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.agenthub-agent-editor {
  display: grid;
  gap: 14px;
}
.agenthub-agent-settings-group {
  width: min(100%, 820px);
  overflow: hidden;
  border: 1px solid var(--agenthub-border);
  border-radius: var(--agenthub-radius);
  background: color-mix(in srgb, var(--agenthub-surface) 92%, var(--agenthub-bg));
}
.agenthub-agent-settings-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
}
.agenthub-agent-settings-body > .agenthub-detail-section {
  padding: 12px 18px;
}
.agenthub-agent-editor label,
.agenthub-role-form label,
.agenthub-agent-readonly-row {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(136px, 28%) minmax(0, 1fr);
  align-items: center;
  gap: 14px;
  min-height: 54px;
  padding: 10px 18px;
  color: var(--agenthub-text-secondary);
  font-size: var(--agenthub-type-sm);
  font-weight: 700;
}
.agenthub-agent-readonly-row > strong,
.agenthub-agent-readonly-row > code {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--agenthub-text);
  font: 650 var(--agenthub-type-md)/1.45 var(--agenthub-font);
}
.agenthub-agent-readonly-row > code {
  font-family: var(--agenthub-mono);
}
.agenthub-settings-control-value {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--agenthub-text);
  font: 650 var(--agenthub-type-md)/1.45 var(--agenthub-font);
}
.agenthub-settings-control-copy {
  min-width: 0;
  color: var(--agenthub-text-secondary);
  font: 600 var(--agenthub-type-sm)/1.45 var(--agenthub-font);
  overflow-wrap: anywhere;
}
.agenthub-settings-control-value .agenthub-select {
  min-width: 172px;
  max-width: 260px;
}
.agenthub-settings-category-row .agenthub-avatar .agenthub-icon {
  width: 18px;
  height: 18px;
}
.agenthub-agent-editor label:has(textarea) {
  align-items: start;
}
.agenthub-agent-editor label:has(textarea) > span {
  padding-top: 8px;
}
.agenthub-agent-editor input,
.agenthub-agent-editor select,
.agenthub-agent-editor textarea,
.agenthub-role-form input,
.agenthub-role-form textarea {
  width: 100%;
  min-width: 0;
  border: 1px solid transparent;
  border-radius: var(--agenthub-radius);
  background: var(--agenthub-surface);
  color: var(--agenthub-text);
  font: 600 var(--agenthub-type-md)/1.45 var(--agenthub-font);
  padding: 8px 10px;
  min-height: 34px;
}
.agenthub-agent-editor .agenthub-select {
  font-size: var(--agenthub-type-md);
}
.agenthub-agent-editor .agenthub-select {
  font: 600 var(--agenthub-type-md)/1.45 var(--agenthub-font);
}
.agenthub-agent-editor .agenthub-input,
.agenthub-agent-editor .agenthub-select {
  border-color: transparent;
}
.agenthub-agent-editor .agenthub-input:hover,
.agenthub-agent-editor textarea:hover,
.agenthub-agent-editor .agenthub-select:not(:disabled):hover {
  border-color: var(--agenthub-border-strong);
}
.agenthub-agent-editor .agenthub-input:focus,
.agenthub-agent-editor textarea:focus,
.agenthub-agent-editor .agenthub-select:focus {
  border-color: var(--agenthub-accent);
}
.agenthub-agent-editor [aria-invalid="true"] {
  border-color: var(--agenthub-danger);
}
.agenthub-form-error {
  color: var(--agenthub-danger);
  font-size: 11px;
}
.agenthub-agent-editor textarea,
.agenthub-role-form textarea {
  max-height: 150px;
  overflow-y: auto;
  resize: none;
  font-family: var(--agenthub-font);
  line-height: 1.5;
}
.agenthub-agent-editor-wide {
  grid-column: auto;
}
.agenthub-connections-panel {
  width: min(100%, 960px);
}
.agenthub-provider-row[data-tone="disabled"] {
  opacity: .68;
}
@media (max-width: 860px) {
  .agenthub-agents-page,
  .agenthub-settings-page,
  .agenthub-agents-layout,
  .agenthub-connections-layout,
  .agenthub-agent-editor {
    grid-template-columns: minmax(0, 1fr);
  }
  .agenthub-agent-settings-group {
    border-radius: var(--agenthub-radius);
  }
  .agenthub-agent-settings-group > header,
  .agenthub-agent-advanced summary {
    padding-inline: 16px;
  }
  .agenthub-agent-settings-body {
    grid-template-columns: minmax(0, 1fr);
  }
  .agenthub-agent-editor label,
  .agenthub-role-form label,
  .agenthub-agent-readonly-row {
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: 8px;
    padding: 12px 16px;
    font-size: var(--agenthub-type-sm);
  }
  .agenthub-agent-editor label:has(textarea) > span {
    padding-top: 0;
  }
  .agenthub-agent-template-grid,
  .agenthub-agent-settings-body > .agenthub-detail-section {
    padding: 16px;
  }
  .agenthub-settings-control-value {
    width: 100%;
    align-items: flex-start;
    justify-content: flex-start;
  }
  .agenthub-directory-resize-handle {
    display: none;
  }
  .agenthub-agent-directory-sidebar {
    min-height: 280px;
  }
  .agenthub-agent-detail {
    --agenthub-agent-detail-x: 18px;
    padding: 24px var(--agenthub-agent-detail-x) 132px;
  }
  .agenthub-agent-profile {
    grid-template-columns: 52px minmax(0, 1fr);
  }
  .agenthub-agent-profile-avatar {
    width: 52px !important;
    height: 52px !important;
    font-size: var(--agenthub-type-title);
  }
  .agenthub-agent-template-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
.agenthub-inspector-body {
  padding: 16px;
  display: grid;
  gap: 16px;
  overflow: auto;
  max-height: calc(100dvh - 64px);
}
.agenthub-inspector-body h3, .agenthub-detail-section h4 { margin: 0; }
.agenthub-inspector-body h3 { font-size: 13px; font-weight: 650; }
.agenthub-detail-section {
  display: grid;
  gap: 9px;
  border-top: 1px solid var(--agenthub-border);
  padding-top: 13px;
}
.agenthub-detail-section dl {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 8px 12px;
  margin: 0;
}
.agenthub-detail-section dt { color: var(--agenthub-text-muted); }
.agenthub-detail-section dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
.agenthub-detail-section code {
  font-family: var(--agenthub-mono);
  font-size: 12px;
  overflow-wrap: anywhere;
}
.agenthub-chat-participant-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.agenthub-chat-participant-tile {
  position: relative;
  min-width: 0;
  min-height: 96px;
  display: grid;
  align-content: start;
  justify-items: center;
  gap: 6px;
  padding: 10px 8px;
  border: 1px solid transparent;
  border-radius: var(--agenthub-radius);
  background: transparent;
  text-align: center;
}
.agenthub-chat-participant-tile .agenthub-avatar {
  width: 42px;
  height: 42px;
  line-height: 42px;
  border-radius: var(--agenthub-radius);
}
.agenthub-chat-participant-tile > span {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 650;
}
.agenthub-chat-participant-tile-add {
  border-color: var(--agenthub-border);
  border-style: dashed;
  padding: 0;
}
.agenthub-chat-add-agent-button {
  width: 100%;
  min-height: 94px;
  display: inline-grid;
  place-items: center;
  border: 0;
  border-radius: var(--agenthub-radius);
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: 10px 8px;
}
.agenthub-chat-add-agent-button:disabled {
  color: var(--agenthub-text-muted);
  cursor: not-allowed;
}
.agenthub-chat-add-agent-button .agenthub-icon {
  width: 20px;
  height: 20px;
}
.agenthub-chat-add-agent-button:not(:disabled):hover {
  background: var(--agenthub-surface-hover);
}
.agenthub-chat-add-agent-button:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 1px var(--agenthub-accent);
}
.agenthub-chat-add-agent-dialog {
  display: grid;
  gap: 14px;
  padding-top: 2px;
  min-width: 0;
}
.agenthub-chat-add-agent-dialog .agenthub-sidebar-search {
  min-height: 40px;
  border: 0;
  border-radius: 7px;
  background: var(--agenthub-surface-hover);
  padding: 0 12px;
}
.agenthub-chat-add-agent-dialog .agenthub-sidebar-search .agenthub-icon {
  width: 16px;
  height: 16px;
  color: var(--agenthub-text-muted);
}
.agenthub-chat-add-agent-dialog .agenthub-sidebar-search input {
  min-height: 40px;
  font-size: 15px;
  font-weight: 650;
}
.agenthub-chat-add-agent-list {
  display: grid;
  gap: 2px;
  max-height: min(52vh, 420px);
  overflow: auto;
  padding: 4px 0;
}
.agenthub-chat-add-agent-option {
  width: 100%;
  min-width: 0;
  min-height: 56px;
  display: grid;
  grid-template-columns: 30px 40px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  border: 0;
  border-radius: var(--agenthub-radius);
  background: transparent;
  color: var(--agenthub-text);
  cursor: pointer;
  font: inherit;
  padding: 8px 6px;
  text-align: left;
}
.agenthub-chat-add-agent-option:hover,
.agenthub-chat-add-agent-option:focus-visible {
  background: var(--agenthub-surface-hover);
  outline: 0;
}
.agenthub-chat-add-agent-option:focus-visible {
  box-shadow: inset 0 0 0 1px var(--agenthub-accent);
}
.agenthub-chat-add-agent-option .agenthub-avatar {
  width: 40px;
  height: 40px;
  line-height: 40px;
  border-radius: 7px;
}
.agenthub-chat-add-agent-check {
  width: 24px;
  height: 24px;
  display: inline-grid;
  place-items: center;
  border: 2px solid var(--agenthub-border-strong);
  border-radius: 999px;
  background: var(--agenthub-surface);
}
.agenthub-chat-add-agent-check::after {
  content: "";
  width: 10px;
  height: 6px;
  border-left: 2px solid var(--agenthub-accent-text);
  border-bottom: 2px solid var(--agenthub-accent-text);
  opacity: 0;
  transform: rotate(-45deg) translate(1px, -1px);
}
.agenthub-chat-add-agent-option[data-selected="true"] .agenthub-chat-add-agent-check {
  border-color: var(--agenthub-accent);
  background: var(--agenthub-accent);
}
.agenthub-chat-add-agent-option[data-selected="true"] .agenthub-chat-add-agent-check::after {
  opacity: 1;
}
.agenthub-chat-add-agent-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
}
.agenthub-chat-add-agent-empty {
  min-height: 112px;
  display: grid;
  place-items: center;
  margin: 0;
  border-radius: var(--agenthub-radius);
  color: var(--agenthub-text-muted);
  text-align: center;
  padding: 18px;
}
.agenthub-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 40;
  max-width: calc(100vw - 32px);
  transform: translate(-50%, -50%);
  background: var(--agenthub-surface);
  color: var(--agenthub-text);
  border-radius: 8px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, .22);
}
.agenthub-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 39;
  background: rgba(0, 0, 0, .42);
}
.agenthub-dialog-header {
  min-height: 54px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.agenthub-dialog-header h2 {
  margin: 0;
  font-size: var(--agenthub-type-title);
  line-height: 1.2;
  color: var(--agenthub-text);
}
.agenthub-dialog-close {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: var(--agenthub-radius);
  background: transparent;
  color: var(--agenthub-text-muted);
  cursor: pointer;
  font: inherit;
}
.agenthub-dialog-close:hover {
  color: var(--agenthub-text);
  background: var(--agenthub-surface-hover);
}
.agenthub-dialog-body {
  padding: 0 18px 14px;
}
.agenthub-dialog-footer {
  padding: 0 18px 18px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.agenthub-chat-add-agent-modal .agenthub-modal-confirm-button:not(:disabled) {
  border-color: var(--agenthub-accent);
  background: var(--agenthub-accent);
  color: var(--agenthub-accent-text);
}
.agenthub-chat-add-agent-modal .agenthub-modal-confirm-button:not(:disabled):hover,
.agenthub-chat-add-agent-modal .agenthub-modal-confirm-button:not(:disabled):focus-visible {
  border-color: var(--agenthub-accent);
  background: color-mix(in srgb, var(--agenthub-accent) 88%, var(--agenthub-surface));
  color: var(--agenthub-accent-text);
}
.agenthub-chat-add-agent-modal .agenthub-dialog-body {
  max-height: min(72vh, 600px);
  overflow: hidden;
}
.agenthub-file-list {
  display: grid;
  gap: 7px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.agenthub-file-list li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  border: 1px solid var(--agenthub-border);
  border-radius: var(--agenthub-radius);
  padding: 8px 10px;
}
.agenthub-file-list span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--agenthub-mono);
  font-size: 12px;
}
.agenthub-card {
  border: 1px solid var(--agenthub-border);
  border-radius: 8px;
  padding: 12px;
  display: grid;
  gap: 10px;
  background: var(--agenthub-surface);
}
.agenthub-card header, .agenthub-card footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.agenthub-state-panel {
  align-self: start;
  margin: 24px;
  padding: 16px;
  border: 1px solid var(--agenthub-border);
  border-radius: var(--agenthub-radius);
  background: var(--agenthub-surface);
  display: grid;
  gap: 8px;
}
.agenthub-fullscreen-diff {
  position: fixed;
  inset: 16px;
  z-index: 20;
  display: grid;
  grid-template-rows: auto 1fr;
  background: var(--agenthub-surface);
  border: 1px solid var(--agenthub-border-strong);
  border-radius: var(--agenthub-radius);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.38);
  overflow: auto;
}
.agenthub-fullscreen-diff > header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--agenthub-border);
}
.agenthub-workbench[data-left-collapsed="true"][data-right-collapsed="true"] { grid-template-columns: 58px minmax(0, 1fr) 0px; }
.agenthub-workbench[data-left-collapsed="true"][data-right-collapsed="false"] { grid-template-columns: 58px minmax(0, 1fr) var(--agenthub-right-column); }
.agenthub-workbench[data-left-collapsed="false"][data-right-collapsed="true"] { grid-template-columns: var(--agenthub-left-column) minmax(0, 1fr) 0px; }
.agenthub-workbench[data-center-view="agents"],
.agenthub-workbench[data-center-view="settings"] {
  grid-template-columns: var(--agenthub-left-column) minmax(0, 1fr) 0px;
}
.agenthub-workbench[data-center-view="agents"][data-left-collapsed="true"],
.agenthub-workbench[data-center-view="settings"][data-left-collapsed="true"] {
  grid-template-columns: 58px minmax(0, 1fr) 0px;
}
.agenthub-workbench[data-center-view="connections"] {
  grid-template-columns: 58px minmax(0, 1fr) 0px;
}
.agenthub-workbench[data-center-view="connections"][data-left-collapsed="true"] {
  grid-template-columns: 58px minmax(0, 1fr) 0px;
}
.agenthub-sidebar-toggle { align-self: end; }
.agenthub-workbench[data-layout="standard"] { grid-template-columns: var(--agenthub-left-column) minmax(0, 1fr); }
.agenthub-workbench[data-layout="standard"][data-left-collapsed="true"] { grid-template-columns: 58px minmax(0, 1fr); }
.agenthub-workbench[data-layout="standard"][data-center-view="agents"],
.agenthub-workbench[data-layout="standard"][data-center-view="settings"] {
  grid-template-columns: var(--agenthub-left-column) minmax(0, 1fr) 0px;
}
.agenthub-workbench[data-layout="standard"][data-center-view="agents"][data-left-collapsed="true"],
.agenthub-workbench[data-layout="standard"][data-center-view="settings"][data-left-collapsed="true"] {
  grid-template-columns: 58px minmax(0, 1fr) 0px;
}
.agenthub-workbench[data-layout="standard"][data-center-view="connections"] {
  grid-template-columns: 58px minmax(0, 1fr) 0px;
}
.agenthub-workbench[data-layout="standard"][data-center-view="connections"][data-left-collapsed="true"] {
  grid-template-columns: 58px minmax(0, 1fr) 0px;
}
.agenthub-workbench[data-layout="narrow"], .agenthub-workbench[data-layout="mobile-web"] { grid-template-columns: minmax(0, 1fr); }
.agenthub-workbench[data-layout="narrow"] .agenthub-mobile-panel-actions,
.agenthub-workbench[data-layout="mobile-web"] .agenthub-mobile-panel-actions { display: inline-flex; }
.agenthub-workbench[data-layout="narrow"] .agenthub-motion-left-panel,
.agenthub-workbench[data-layout="mobile-web"] .agenthub-motion-left-panel {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 30;
  width: min(86vw, 340px);
  height: 100dvh;
  box-shadow: 0 20px 70px rgba(0, 0, 0, .32);
}
.agenthub-workbench[data-layout="standard"] .agenthub-motion-right-panel,
.agenthub-workbench[data-layout="narrow"] .agenthub-motion-right-panel,
.agenthub-workbench[data-layout="mobile-web"] .agenthub-motion-right-panel {
  position: fixed;
  inset: 0 0 0 auto;
  z-index: 30;
  width: min(86vw, 380px);
  min-width: min(86vw, 380px);
  max-width: min(86vw, 380px);
  height: 100dvh;
  box-shadow: 0 20px 70px rgba(0, 0, 0, .32);
  contain: layout paint;
  will-change: transform, opacity;
}
.agenthub-workbench[data-layout="narrow"] .agenthub-chat-add-agent-modal .agenthub-dialog,
.agenthub-workbench[data-layout="mobile-web"] .agenthub-chat-add-agent-modal .agenthub-dialog {
  width: min(430px, calc(100vw - 20px)) !important;
}
.agenthub-workbench[data-layout="narrow"] .agenthub-chat-add-agent-option,
.agenthub-workbench[data-layout="mobile-web"] .agenthub-chat-add-agent-option {
  grid-template-columns: 28px 38px minmax(0, 1fr);
  gap: 10px;
  min-height: 54px;
}
.agenthub-workbench[data-layout="narrow"] .agenthub-chat-add-agent-name,
.agenthub-workbench[data-layout="mobile-web"] .agenthub-chat-add-agent-name {
  font-size: 15px;
}
@media (prefers-reduced-motion: reduce) {
  .agenthub-workbench,
  .agenthub-workbench *,
  .agenthub-workbench *::before,
  .agenthub-workbench *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 1ms !important;
  }
}
`;
