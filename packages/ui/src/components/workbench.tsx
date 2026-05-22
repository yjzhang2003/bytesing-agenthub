import type { WorkbenchSnapshot } from "@agenthub/contracts";
import { Moon, PanelLeftClose, PanelRightClose, Sun } from "lucide-react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import React from "react";
import type { InspectorSelection, WorkbenchLayoutMode, WorkbenchViewModel } from "../types.js";
import { createWorkbenchViewModel, workbenchLayoutForWidth } from "../view-model.js";
import { workbenchCss } from "../styles.js";
import { AgentMentionComposer } from "./composer.js";
import { ContextInspector, DiffDetail } from "./inspector.js";
import { LeftNavigation } from "./navigation.js";
import { HoverButton, Icon, RuntimeStatusBadge } from "./primitives.js";
import { SettingsPage } from "./settings.js";
import { ChatTimeline } from "./timeline.js";

type CenterView = "conversation" | "settings";

export function AgentHubWorkbench(props: {
  readonly snapshot?: WorkbenchSnapshot;
  readonly viewModel?: WorkbenchViewModel;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly layoutMode?: WorkbenchLayoutMode;
  readonly initialInspectorSelection?: InspectorSelection | null;
  readonly initialFullScreenDiffId?: string | null;
  readonly initialCenterView?: CenterView;
  readonly onRetry?: () => void;
  readonly onSend?: (message: string, target?: string) => void;
}): React.ReactElement {
  const model = props.viewModel ?? createWorkbenchViewModel(props.snapshot);
  const [selection, setSelection] = React.useState<InspectorSelection | null>(
    props.initialInspectorSelection ?? model.inspector.selection,
  );
  const [fullScreenDiffId, setFullScreenDiffId] = React.useState<string | null>(
    props.initialFullScreenDiffId ?? null,
  );
  const [centerView, setCenterView] = React.useState<CenterView>(props.initialCenterView ?? "conversation");
  const [theme, setTheme] = React.useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "dark";
    }
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashTheme = hashParams.get("agenthubTheme");
    if (hashTheme === "light" || hashTheme === "dark") {
      return hashTheme;
    }
    const storedTheme = window.localStorage.getItem("agenthub.theme");
    return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
  });
  const [leftCollapsed, setLeftCollapsed] = React.useState(false);
  const [rightCollapsed, setRightCollapsed] = React.useState(false);
  const [mobileLeftOpen, setMobileLeftOpen] = React.useState(false);
  const [mobileRightOpen, setMobileRightOpen] = React.useState(false);
  const [detectedLayoutMode, setDetectedLayoutMode] = React.useState<WorkbenchLayoutMode>("wide");
  React.useEffect(() => {
    if (props.layoutMode) {
      return;
    }

    const updateLayoutMode = () => setDetectedLayoutMode(workbenchLayoutForWidth(window.innerWidth));
    updateLayoutMode();
    window.addEventListener("resize", updateLayoutMode);
    return () => window.removeEventListener("resize", updateLayoutMode);
  }, [props.layoutMode]);
  React.useEffect(() => {
    window.localStorage.setItem("agenthub.theme", theme);
  }, [theme]);
  const layoutMode = props.layoutMode ?? detectedLayoutMode;
  const reduceMotion = useReducedMotion();
  const motionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] as const };
  const mobileLayout = layoutMode === "narrow" || layoutMode === "mobile-web";
  const renderLeftNavigation = !mobileLayout;
  const renderMobileLeftNavigation = mobileLayout && mobileLeftOpen;
  const renderInspector = !mobileLayout && layoutMode === "wide";
  const renderMobileInspector = mobileLayout && mobileRightOpen;
  const fullScreenDiff =
    fullScreenDiffId && model.inspector.diff?.id === fullScreenDiffId ? model.inspector.diff : null;

  if (props.loading) {
    return (
      <main className="agenthub-workbench" data-layout={layoutMode} data-state="loading" data-theme={theme}>
        <WorkbenchStyle />
        <section aria-label="Loading workbench" className="agenthub-state-panel">
          <strong>Loading AgentHub</strong>
          <p>Fetching the latest Control Plane snapshot.</p>
        </section>
      </main>
    );
  }

  if (props.error) {
    return (
      <main className="agenthub-workbench" data-layout={layoutMode} data-state="error" data-theme={theme}>
        <WorkbenchStyle />
        <section aria-label="Connection error" className="agenthub-state-panel">
          <strong>Control Plane offline</strong>
          <p>{props.error}</p>
          <HoverButton onClick={props.onRetry} type="button">
            Retry
          </HoverButton>
        </section>
      </main>
    );
  }

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "never"} transition={motionTransition}>
      <main
        className="agenthub-workbench"
        data-left-collapsed={leftCollapsed ? "true" : "false"}
        data-layout={layoutMode}
        data-mobile-left-open={mobileLeftOpen ? "true" : "false"}
        data-mobile-right-open={mobileRightOpen ? "true" : "false"}
        data-right-collapsed={rightCollapsed ? "true" : "false"}
        data-state={model.runtime.status}
        data-theme={theme}
      >
        <WorkbenchStyle />
        {renderLeftNavigation ? (
          <div aria-hidden={leftCollapsed ? "true" : undefined} className="agenthub-motion-left-panel">
            <LeftNavigation
              collapsed={leftCollapsed}
              model={model}
              onOpenSettings={() => {
                setCenterView("settings");
                setMobileLeftOpen(false);
              }}
              onSelect={(nextSelection) => {
                setCenterView("conversation");
                setSelection(nextSelection);
              }}
              settingsActive={centerView === "settings"}
              onToggleCollapsed={() => {
                setMobileLeftOpen(false);
                setLeftCollapsed((current) => !current);
              }}
            />
          </div>
        ) : null}
        <AnimatePresence initial={false}>
          {renderMobileLeftNavigation ? (
            <motion.div
              className="agenthub-motion-left-panel"
              key="mobile-left-navigation"
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
            >
              <LeftNavigation
                collapsed={leftCollapsed}
                model={model}
                onOpenSettings={() => {
                  setCenterView("settings");
                  setMobileLeftOpen(false);
                }}
                onSelect={(nextSelection) => {
                  setCenterView("conversation");
                  setSelection(nextSelection);
                  setMobileLeftOpen(false);
                }}
                settingsActive={centerView === "settings"}
                onToggleCollapsed={() => {
                  setMobileLeftOpen(false);
                  setLeftCollapsed((current) => !current);
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
        <section
          aria-label="Conversation workbench"
          className="agenthub-center"
          data-view={centerView}
        >
        <header className="agenthub-conversation-header">
          <div className="agenthub-title-cluster">
            {leftCollapsed ? (
              <HoverButton
                aria-label="Expand workspace navigation"
                className="agenthub-icon-button"
                onClick={() => setLeftCollapsed(false)}
                type="button"
              >
                <Icon icon={PanelLeftClose} />
              </HoverButton>
            ) : null}
            <div>
              <strong>{centerView === "settings" ? "Settings" : model.activeConversationTitle}</strong>
              <small>{model.workspace.workspaceName}</small>
            </div>
          </div>
          <div className="agenthub-header-actions">
            <div className="agenthub-mobile-panel-actions" aria-label="Mobile panel controls">
              <HoverButton
                aria-label="Open workspace navigation"
                className="agenthub-icon-button"
                onClick={() => {
                  setLeftCollapsed(false);
                  setMobileLeftOpen(true);
                  setMobileRightOpen(false);
                }}
                type="button"
              >
                <Icon icon={PanelLeftClose} />
              </HoverButton>
              <HoverButton
                aria-label="Open conversation details"
                className="agenthub-icon-button"
                onClick={() => {
                  setRightCollapsed(false);
                  setMobileRightOpen(true);
                  setMobileLeftOpen(false);
                }}
                type="button"
              >
                <Icon icon={PanelRightClose} />
              </HoverButton>
            </div>
            <RuntimeStatusBadge status={model.runtime.status} />
            {rightCollapsed ? (
              <HoverButton
                aria-label="Expand Context Inspector"
                className="agenthub-icon-button"
                onClick={() => setRightCollapsed(false)}
                type="button"
              >
                <Icon icon={PanelRightClose} />
              </HoverButton>
            ) : null}
            <HoverButton
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="agenthub-icon-button"
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              type="button"
            >
              <Icon icon={theme === "dark" ? Sun : Moon} />
            </HoverButton>
          </div>
        </header>
        {centerView === "settings" ? (
          <SettingsPage
            model={model}
            onSelect={(nextSelection) => {
              setCenterView("conversation");
              setSelection(nextSelection);
            }}
            onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            theme={theme}
          />
        ) : (
          <>
            <ChatTimeline items={model.timeline} selected={selection} onSelect={setSelection} />
            <AgentMentionComposer
              disabled={model.composer.disabled}
              disabledReason={model.composer.disabledReason}
              modeLabel={model.composer.modeLabel}
              {...(props.onSend ? { onSend: props.onSend } : {})}
              selectedTarget={model.composer.selectedTarget}
              targets={model.composer.targets}
            />
          </>
        )}
        </section>
        {renderInspector ? (
          <div aria-hidden={rightCollapsed ? "true" : undefined} className="agenthub-motion-right-panel">
            <ContextInspector
              collapsed={rightCollapsed}
              model={model}
              onOpenFullScreenDiff={() => {
                if (model.inspector.diff) {
                  setFullScreenDiffId(model.inspector.diff.id);
                }
              }}
              onSelect={setSelection}
              onToggleCollapsed={() => {
                setMobileRightOpen(false);
                setRightCollapsed((current) => !current);
              }}
              selection={selection}
            />
          </div>
        ) : null}
        <AnimatePresence initial={false}>
          {renderMobileInspector ? (
            <motion.div
              className="agenthub-motion-right-panel"
              key="mobile-context-inspector"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
            >
              <ContextInspector
                collapsed={rightCollapsed}
                model={model}
                onOpenFullScreenDiff={() => {
                  if (model.inspector.diff) {
                    setFullScreenDiffId(model.inspector.diff.id);
                  }
                }}
                onSelect={setSelection}
                onToggleCollapsed={() => {
                  setMobileRightOpen(false);
                  setRightCollapsed((current) => !current);
                }}
                selection={selection}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
        {fullScreenDiff ? (
          <section aria-label="Full-screen diff review" className="agenthub-fullscreen-diff">
            <header>
              <strong>Full-screen diff review</strong>
              <HoverButton onClick={() => setFullScreenDiffId(null)} type="button">
                Return to conversation
              </HoverButton>
            </header>
            <DiffDetail diff={fullScreenDiff} fullScreen onOpenFullScreen={() => setFullScreenDiffId(null)} />
          </section>
        ) : null}
      </main>
    </MotionConfig>
  );
}

function WorkbenchStyle(): React.ReactElement {
  return <style>{workbenchCss}</style>;
}
