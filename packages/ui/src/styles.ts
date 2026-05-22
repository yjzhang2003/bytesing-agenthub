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
  font-size: 13px;
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
.agenthub-title-cluster > div {
  display: grid;
  gap: 1px;
  min-width: 0;
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
.agenthub-chat-list-panel > .agenthub-scroll-root { padding: 8px 7px 14px; }
.agenthub-scroll-viewport { width: 100%; height: 100%; }
.agenthub-scrollbar { width: 8px; padding: 2px; }
.agenthub-scroll-thumb { border-radius: 999px; background: var(--agenthub-border-strong); }
.agenthub-nav-bottom {
  flex: 0 0 auto;
  margin-top: auto;
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
    opacity var(--agenthub-motion-fast),
    transform var(--agenthub-motion-fast);
}
.agenthub-hover-control:hover:not(:disabled),
.agenthub-hover-control:focus-visible,
.agenthub-hover-control[aria-current="page"],
.agenthub-hover-control[aria-pressed="true"] {
  border-color: var(--agenthub-border-strong);
  background: var(--agenthub-surface-hover);
}
.agenthub-hover-control:hover:not(:disabled) { transform: translateY(-1px); }
.agenthub-hover-control:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: 1px solid var(--agenthub-accent);
  outline-offset: 2px;
}
.agenthub-hover-control:disabled, .agenthub-composer textarea:disabled {
  color: var(--agenthub-text-muted);
  background: transparent;
  opacity: .58;
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
.agenthub-conversation-search {
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
  border-bottom: 1px solid var(--agenthub-border);
}
.agenthub-chat-list-header .agenthub-conversation-search {
  width: 100%;
}
.agenthub-conversation-search:focus-within {
  border-color: var(--agenthub-border-strong);
  outline: 1px solid var(--agenthub-accent);
  outline-offset: 2px;
}
.agenthub-conversation-search input {
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
  gap: 4px;
  padding-top: 4px;
}
.agenthub-conversation-row {
  position: relative;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas:
    "title status"
    "participants status";
  align-items: start;
  min-height: 50px;
  padding: 6px 9px 6px 12px;
  border-color: transparent;
  border-radius: 6px;
  gap: 2px 10px;
  line-height: 1.25;
  transition:
    background-color var(--agenthub-motion-fast),
    transform var(--agenthub-motion-fast);
}
.agenthub-conversation-row:hover:not(:disabled) { transform: translateX(2px); }
.agenthub-conversation-row:hover:not(:disabled),
.agenthub-conversation-row[aria-current="page"] {
  border-color: transparent;
  background: color-mix(in srgb, var(--agenthub-surface-hover) 58%, transparent);
}
.agenthub-conversation-row[aria-current="page"]::before {
  content: "";
  position: absolute;
  left: 2px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  border-radius: 999px;
  background: var(--agenthub-border-strong);
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
  padding: 22px 28px;
  display: grid;
  align-content: end;
  gap: 12px;
  overflow: auto;
  min-width: 0;
  min-height: 0;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--agenthub-bg) 92%, var(--agenthub-surface)) 0%, var(--agenthub-bg) 100%);
}
.agenthub-chat-thread > li { display: grid; min-width: 0; }
.agenthub-message-row {
  max-width: min(76%, 760px);
  display: grid;
  gap: 4px;
  justify-self: start;
}
.agenthub-message-row[data-author="user"] { justify-self: end; }
.agenthub-message-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--agenthub-text-muted);
  font-size: 11px;
}
.agenthub-message-row[data-author="user"] .agenthub-message-meta { justify-content: flex-end; }
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
.agenthub-message-bubble p { margin: 0; }
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
  padding: 10px 16px 14px;
  background: var(--agenthub-bg);
}
.agenthub-composer-box {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: "input actions";
  align-items: end;
  gap: 8px;
  border: 1px solid var(--agenthub-border);
  border-radius: 18px;
  padding: 10px 10px 10px 14px;
  background: var(--agenthub-surface);
  box-shadow: 0 1px 0 rgba(17, 24, 39, .04);
  transition:
    border-color var(--agenthub-motion-fast),
    box-shadow var(--agenthub-motion-fast),
    padding var(--agenthub-motion-medium),
    min-height var(--agenthub-motion-medium);
}
.agenthub-composer-box[data-multiline="true"] {
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    "input"
    "actions";
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
.agenthub-composer textarea {
  grid-area: input;
  width: 100%;
  min-height: 22px;
  max-height: 128px;
  resize: none;
  overflow-y: auto;
  border: 0;
  border-radius: 0;
  padding: 7px 0;
  background: transparent;
  color: var(--agenthub-text);
  font: inherit;
  line-height: 1.45;
  transition: height var(--agenthub-motion-medium);
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
.agenthub-center[data-view="settings"] { grid-template-rows: 64px minmax(0, 1fr); }
.agenthub-settings-page {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 22px 28px 32px;
  display: grid;
  align-content: start;
  gap: 14px;
  background: var(--agenthub-bg);
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
.agenthub-workbench[data-left-collapsed="true"][data-right-collapsed="true"] { grid-template-columns: 0px minmax(0, 1fr) 0px; }
.agenthub-workbench[data-left-collapsed="true"][data-right-collapsed="false"] { grid-template-columns: 0px minmax(0, 1fr) var(--agenthub-right-column); }
.agenthub-workbench[data-left-collapsed="false"][data-right-collapsed="true"] { grid-template-columns: var(--agenthub-left-column) minmax(0, 1fr) 0px; }
.agenthub-sidebar-toggle { align-self: end; }
.agenthub-workbench[data-layout="standard"] { grid-template-columns: var(--agenthub-left-column) minmax(0, 1fr); }
.agenthub-workbench[data-layout="standard"][data-left-collapsed="true"] { grid-template-columns: 0px minmax(0, 1fr); }
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
.agenthub-workbench[data-layout="narrow"] .agenthub-motion-right-panel,
.agenthub-workbench[data-layout="mobile-web"] .agenthub-motion-right-panel {
  position: fixed;
  inset: 0 0 0 auto;
  z-index: 30;
  width: min(86vw, 340px);
  height: 100dvh;
  box-shadow: 0 20px 70px rgba(0, 0, 0, .32);
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
