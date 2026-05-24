import type { WorkbenchSnapshot } from "@agenthub/contracts";
import { Moon, PanelLeftClose, PanelRightClose, Sun } from "lucide-react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import React from "react";
import type { AgentHubLocale } from "../i18n.js";
import {
  AgentHubI18nProvider,
  createAgentHubI18n,
  readStoredAgentHubLocale,
  writeStoredAgentHubLocale,
} from "../i18n.js";
import type { InspectorSelection, WorkbenchLayoutMode, WorkbenchViewModel } from "../types.js";
import { createWorkbenchViewModel, workbenchLayoutForWidth } from "../view-model.js";
import { workbenchCss } from "../styles.js";
import { AgentMentionComposer } from "./composer.js";
import { AgentsPage, type AgentRoleMutationInput } from "./agents.js";
import { ConnectionsPage } from "./connections.js";
import { ContextInspector, DiffDetail } from "./inspector.js";
import { LeftNavigation } from "./navigation.js";
import { AgentHubThemeProvider } from "./system.js";
import { HoverButton, Icon, RuntimeStatusBadge } from "./primitives.js";
import { SettingsPage } from "./settings.js";
import { ChatTimeline } from "./timeline.js";

type CenterView = "conversation" | "agents" | "connections" | "settings";
const ENTER_TO_SEND_STORAGE_KEY = "agenthub.keyboard.enterToSend";

function clampPanelWidth(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function AgentHubWorkbench(props: {
  readonly snapshot?: WorkbenchSnapshot;
  readonly viewModel?: WorkbenchViewModel;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly layoutMode?: WorkbenchLayoutMode;
  readonly initialInspectorSelection?: InspectorSelection | null;
  readonly initialFullScreenDiffId?: string | null;
  readonly initialCenterView?: CenterView;
  readonly initialLeftCollapsed?: boolean;
  readonly locale?: AgentHubLocale | undefined;
  readonly onRetry?: () => void;
  readonly onSend?: (message: string, target?: string) => void;
  readonly onCreateAgentRole?: (input: Omit<AgentRoleMutationInput, "agentId">) => void;
  readonly onUpdateAgentRole?: (
    input: AgentRoleMutationInput & { readonly agentId: string },
  ) => void;
  readonly onArchiveAgentRole?: (agentId: string) => void;
  readonly onCreateAgentConversation?: (agentId: string) => void | Promise<void>;
  readonly onOpenConversation?: (conversationId: string) => void;
  readonly onAddAgentToChat?: (conversationId: string, agentId: string) => void;
  readonly onRemoveAgentFromChat?: (conversationId: string, agentId: string) => void;
  readonly onRefreshConnections?: () => void;
}): React.ReactElement {
  const [storedLocale, setStoredLocale] = React.useState<AgentHubLocale>(() => {
    if (props.locale) {
      return props.locale;
    }
    if (typeof window === "undefined") {
      return "en-US";
    }
    return readStoredAgentHubLocale(window.localStorage);
  });
  const activeLocale = props.locale ?? storedLocale;
  const i18n = React.useMemo(() => createAgentHubI18n(activeLocale), [activeLocale]);
  const [activeConversationIdOverride, setActiveConversationIdOverride] = React.useState<
    string | null
  >(null);
  const effectiveSnapshot = React.useMemo(() => {
    if (!props.snapshot || !activeConversationIdOverride) {
      return props.snapshot;
    }
    if (
      !props.snapshot.conversations.some(
        (conversation) => conversation.id === activeConversationIdOverride,
      )
    ) {
      return props.snapshot;
    }
    return {
      ...props.snapshot,
      activeConversationId: activeConversationIdOverride,
    };
  }, [activeConversationIdOverride, props.snapshot]);
  const model = props.viewModel ?? createWorkbenchViewModel(effectiveSnapshot);
  const [selection, setSelection] = React.useState<InspectorSelection | null>(
    props.initialInspectorSelection ?? model.inspector.selection,
  );
  const [fullScreenDiffId, setFullScreenDiffId] = React.useState<string | null>(
    props.initialFullScreenDiffId ?? null,
  );
  const [centerView, setCenterView] = React.useState<CenterView>(
    props.initialCenterView ?? "conversation",
  );
  const [selectedAgentId, setSelectedAgentId] = React.useState<string | null>(
    model.agentsPage.selectedAgentId ?? model.agentsPage.agents[0]?.id ?? null,
  );
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
  const [enterToSend, setEnterToSend] = React.useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return window.localStorage.getItem(ENTER_TO_SEND_STORAGE_KEY) !== "false";
  });
  const [leftCollapsed, setLeftCollapsed] = React.useState(props.initialLeftCollapsed ?? false);
  const [rightCollapsed, setRightCollapsed] = React.useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = React.useState(316);
  const [directoryPanelWidth, setDirectoryPanelWidth] = React.useState(316);
  const [mobileLeftOpen, setMobileLeftOpen] = React.useState(false);
  const [mobileRightOpen, setMobileRightOpen] = React.useState(false);
  const [detectedLayoutMode, setDetectedLayoutMode] = React.useState<WorkbenchLayoutMode>("wide");
  React.useEffect(() => {
    if (props.layoutMode) {
      return;
    }

    const updateLayoutMode = () =>
      setDetectedLayoutMode(workbenchLayoutForWidth(window.innerWidth));
    updateLayoutMode();
    window.addEventListener("resize", updateLayoutMode);
    return () => window.removeEventListener("resize", updateLayoutMode);
  }, [props.layoutMode]);
  React.useEffect(() => {
    window.localStorage.setItem("agenthub.theme", theme);
  }, [theme]);
  React.useEffect(() => {
    window.localStorage.setItem(ENTER_TO_SEND_STORAGE_KEY, enterToSend ? "true" : "false");
  }, [enterToSend]);
  React.useEffect(() => {
    if (!props.locale) {
      return;
    }
    setStoredLocale(props.locale);
  }, [props.locale]);
  React.useEffect(() => {
    const firstAgentId = model.agentsPage.agents[0]?.id;
    if (selectedAgentId === null && centerView !== "agents" && firstAgentId) {
      setSelectedAgentId(firstAgentId);
    }
  }, [centerView, model.agentsPage.agents, selectedAgentId]);
  React.useEffect(() => {
    if (
      activeConversationIdOverride &&
      props.snapshot &&
      !props.snapshot.conversations.some(
        (conversation) => conversation.id === activeConversationIdOverride,
      )
    ) {
      setActiveConversationIdOverride(null);
    }
  }, [activeConversationIdOverride, props.snapshot]);
  const setLocale = React.useCallback((nextLocale: AgentHubLocale) => {
    setStoredLocale(nextLocale);
    if (typeof window !== "undefined") {
      writeStoredAgentHubLocale(window.localStorage, nextLocale);
    }
  }, []);
  const layoutMode = props.layoutMode ?? detectedLayoutMode;
  const reduceMotion = useReducedMotion();
  const motionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] as const };
  const mobileLayout = layoutMode === "narrow" || layoutMode === "mobile-web";
  const overlayInspectorLayout = mobileLayout || layoutMode === "standard";
  const managementPage = centerView !== "conversation";
  const compactLeftNavigation = centerView === "connections" || centerView === "settings";
  const renderLeftNavigation = !mobileLayout;
  const renderMobileLeftNavigation = mobileLayout && mobileLeftOpen;
  const renderInspector = !managementPage && !mobileLayout && layoutMode === "wide";
  const renderOverlayInspector = !managementPage && overlayInspectorLayout && mobileRightOpen;
  const fullScreenDiff =
    fullScreenDiffId && model.inspector.diff?.id === fullScreenDiffId ? model.inspector.diff : null;
  const openChatInfo = React.useCallback(() => {
    if (!model.inspector.chatInfo) {
      return;
    }
    setCenterView("conversation");
    setSelection({ id: model.inspector.chatInfo.id, mode: "chat-info" });
    setRightCollapsed(false);
    if (overlayInspectorLayout) {
      setMobileRightOpen(true);
      setMobileLeftOpen(false);
    }
  }, [model.inspector.chatInfo, overlayInspectorLayout]);
  const beginHorizontalResize = React.useCallback(
    (
      event: React.PointerEvent,
      options: {
        readonly startWidth: number;
        readonly min: number;
        readonly max: number;
        readonly onResize: (width: number) => void;
      },
    ) => {
      if (mobileLayout) {
        return;
      }
      event.preventDefault();
      const startX = event.clientX;
      const pointerId = event.pointerId;
      event.currentTarget.setPointerCapture(pointerId);
      const onPointerMove = (moveEvent: PointerEvent) => {
        const nextWidth = clampPanelWidth(
          options.startWidth + moveEvent.clientX - startX,
          options.min,
          Math.min(options.max, window.innerWidth - 520),
        );
        options.onResize(nextWidth);
      };
      const onPointerUp = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [mobileLayout],
  );
  const workbenchStyle = {
    "--agenthub-left-column": `${leftPanelWidth}px`,
    "--agenthub-directory-column": `${directoryPanelWidth}px`,
  } as React.CSSProperties;
  const openConversation = React.useCallback(
    (conversationId?: string) => {
      if (conversationId) {
        setActiveConversationIdOverride(conversationId);
        props.onOpenConversation?.(conversationId);
        if (selection?.mode === "chat-info") {
          setSelection({ id: conversationId, mode: "chat-info" });
        } else {
          setSelection(null);
        }
      }
      setCenterView("conversation");
      setMobileLeftOpen(false);
    },
    [props.onOpenConversation, selection?.mode],
  );

  if (props.loading) {
    return (
      <AgentHubI18nProvider locale={activeLocale}>
        <AgentHubThemeProvider mode={theme}>
          <main
            className="agenthub-workbench"
            data-layout={layoutMode}
            data-state="loading"
            data-theme={theme}
          >
            <WorkbenchStyle />
            <section
              aria-label={i18n.t("state.loadingWorkbench", { fallback: "Loading workbench" })}
              className="agenthub-state-panel"
            >
              <strong>{i18n.t("state.loadingAgentHub", { fallback: "Loading AgentHub" })}</strong>
              <p>
                {i18n.t("state.fetchingSnapshot", {
                  fallback: "Fetching the latest Control Plane snapshot.",
                })}
              </p>
            </section>
          </main>
        </AgentHubThemeProvider>
      </AgentHubI18nProvider>
    );
  }

  if (props.error) {
    return (
      <AgentHubI18nProvider locale={activeLocale}>
        <AgentHubThemeProvider mode={theme}>
          <main
            className="agenthub-workbench"
            data-layout={layoutMode}
            data-state="error"
            data-theme={theme}
          >
            <WorkbenchStyle />
            <section
              aria-label={i18n.t("state.connectionError", { fallback: "Connection error" })}
              className="agenthub-state-panel"
            >
              <strong>
                {i18n.t("state.controlPlaneOffline", { fallback: "Control Plane offline" })}
              </strong>
              <p>{props.error}</p>
              <HoverButton onClick={props.onRetry} type="button">
                {i18n.t("actions.retry", { fallback: "Retry" })}
              </HoverButton>
            </section>
          </main>
        </AgentHubThemeProvider>
      </AgentHubI18nProvider>
    );
  }

  return (
    <AgentHubI18nProvider locale={activeLocale}>
      <AgentHubThemeProvider mode={theme}>
        <MotionConfig
          reducedMotion={reduceMotion ? "always" : "never"}
          transition={motionTransition}
        >
          <main
            className="agenthub-workbench"
            data-left-collapsed={leftCollapsed ? "true" : "false"}
            data-layout={layoutMode}
            data-center-view={centerView}
            data-mobile-left-open={mobileLeftOpen ? "true" : "false"}
            data-mobile-right-open={mobileRightOpen ? "true" : "false"}
            data-right-collapsed={rightCollapsed ? "true" : "false"}
            data-state={model.runtime.status}
            data-theme={theme}
            style={workbenchStyle}
          >
            <WorkbenchStyle />
            {renderLeftNavigation ? (
              <div className="agenthub-motion-left-panel">
                <LeftNavigation
                  collapsed={leftCollapsed}
                  compact={compactLeftNavigation}
                  model={model}
                  onOpenConversation={() => {
                    openConversation();
                  }}
                  onSelectConversation={openConversation}
                  onOpenSettings={() => {
                    setCenterView("settings");
                    setMobileLeftOpen(false);
                  }}
                  onOpenAgents={() => {
                    setCenterView("agents");
                    setMobileLeftOpen(false);
                  }}
                  onOpenConnections={() => {
                    setCenterView("connections");
                    setMobileLeftOpen(false);
                  }}
                  onSelect={(nextSelection) => {
                    setCenterView("conversation");
                    setSelection(nextSelection);
                  }}
                  selectedAgentId={selectedAgentId}
                  onSelectAgent={(agentId) => {
                    setSelectedAgentId(agentId);
                    setCenterView("agents");
                  }}
                  conversationActive={centerView === "conversation"}
                  settingsActive={centerView === "settings"}
                  agentsActive={centerView === "agents"}
                  connectionsActive={centerView === "connections"}
                  onToggleCollapsed={() => {
                    setMobileLeftOpen(false);
                    setLeftCollapsed((current) => !current);
                  }}
                />
                {!leftCollapsed && !compactLeftNavigation ? (
                  <div
                    aria-label={
                      centerView === "agents"
                        ? i18n.t("nav.resizeAgentDirectory")
                        : i18n.t("nav.resizeConversationList")
                    }
                    className="agenthub-resize-handle agenthub-panel-resize-handle"
                    onPointerDown={(event) =>
                      beginHorizontalResize(event, {
                        startWidth: leftPanelWidth,
                        min: 260,
                        max: 500,
                        onResize: setLeftPanelWidth,
                      })
                    }
                    role="separator"
                    tabIndex={0}
                  />
                ) : null}
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
                    compact={compactLeftNavigation}
                    model={model}
                    onOpenConversation={() => {
                      openConversation();
                    }}
                    onSelectConversation={openConversation}
                    onOpenSettings={() => {
                      setCenterView("settings");
                      setMobileLeftOpen(false);
                    }}
                    onOpenAgents={() => {
                      setCenterView("agents");
                      setMobileLeftOpen(false);
                    }}
                    onOpenConnections={() => {
                      setCenterView("connections");
                      setMobileLeftOpen(false);
                    }}
                    onSelect={(nextSelection) => {
                      setCenterView("conversation");
                      setSelection(nextSelection);
                      setMobileLeftOpen(false);
                    }}
                    selectedAgentId={selectedAgentId}
                    onSelectAgent={(agentId) => {
                      setSelectedAgentId(agentId);
                      setCenterView("agents");
                      setMobileLeftOpen(false);
                    }}
                    conversationActive={centerView === "conversation"}
                    settingsActive={centerView === "settings"}
                    agentsActive={centerView === "agents"}
                    connectionsActive={centerView === "connections"}
                    onToggleCollapsed={() => {
                      setMobileLeftOpen(false);
                      setLeftCollapsed((current) => !current);
                    }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
            <section
              aria-label={i18n.t("nav.conversationWorkbench")}
              className="agenthub-center"
              data-view={centerView}
            >
              <header className="agenthub-conversation-header">
                <div className="agenthub-title-cluster">
                  {leftCollapsed && !managementPage ? (
                    <HoverButton
                      aria-label={i18n.t("nav.expandWorkspace", {
                        fallback: "Expand workspace navigation",
                      })}
                      className="agenthub-icon-button"
                      onClick={() => setLeftCollapsed(false)}
                      type="button"
                    >
                      <Icon icon={PanelLeftClose} />
                    </HoverButton>
                  ) : null}
                  {centerView === "conversation" ? (
                    <button
                      aria-label={i18n.t("chat.openChatInfo", {
                        title: model.activeConversationTitle,
                      })}
                      className="agenthub-chat-title-button"
                      onClick={openChatInfo}
                      type="button"
                    >
                      <strong>{model.activeConversationTitle}</strong>
                      <small>{model.workspace.workspaceName}</small>
                    </button>
                  ) : (
                    <div>
                      <strong>
                        {centerView === "settings"
                          ? i18n.t("nav.settings", { fallback: "Settings" })
                          : centerView === "agents"
                            ? i18n.t("agents.agents")
                            : i18n.t("connections.connections")}
                      </strong>
                      <small>{model.workspace.workspaceName}</small>
                    </div>
                  )}
                </div>
                <div className="agenthub-header-actions">
                  <div
                    className="agenthub-mobile-panel-actions"
                    aria-label={i18n.t("nav.mobilePanelControls")}
                  >
                    <HoverButton
                      aria-label={i18n.t("nav.openWorkspaceNavigation", {
                        fallback: "Open workspace navigation",
                      })}
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
                      aria-label={i18n.t("nav.openConversationDetails", {
                        fallback: "Open conversation details",
                      })}
                      className="agenthub-icon-button"
                      disabled={managementPage}
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
                      aria-label={i18n.t("nav.expandInspector", {
                        fallback: "Expand Context Inspector",
                      })}
                      className="agenthub-icon-button"
                      disabled={managementPage}
                      onClick={() => setRightCollapsed(false)}
                      type="button"
                    >
                      <Icon icon={PanelRightClose} />
                    </HoverButton>
                  ) : null}
                  <HoverButton
                    aria-label={
                      theme === "dark"
                        ? i18n.t("actions.switchToLight", { fallback: "Switch to light mode" })
                        : i18n.t("actions.switchToDark", { fallback: "Switch to dark mode" })
                    }
                    className="agenthub-icon-button"
                    onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                    type="button"
                  >
                    <Icon icon={theme === "dark" ? Sun : Moon} />
                  </HoverButton>
                </div>
              </header>
              {centerView === "agents" ? (
                <AgentsPage
                  model={model}
                  selectedAgentId={selectedAgentId}
                  {...(props.onCreateAgentRole
                    ? { onCreateAgentRole: props.onCreateAgentRole }
                    : {})}
                  {...(props.onUpdateAgentRole
                    ? { onUpdateAgentRole: props.onUpdateAgentRole }
                    : {})}
                  {...(props.onArchiveAgentRole
                    ? { onArchiveAgentRole: props.onArchiveAgentRole }
                    : {})}
                  {...(props.onCreateAgentConversation
                    ? {
                        onCreateAgentConversation: (agentId: string) => {
                          return Promise.resolve(props.onCreateAgentConversation?.(agentId)).then(
                            () => {
                              setActiveConversationIdOverride(null);
                              setCenterView("conversation");
                              setSelection(null);
                              setMobileLeftOpen(false);
                            },
                          );
                        },
                      }
                    : {})}
                />
              ) : centerView === "connections" ? (
                <ConnectionsPage
                  onResizeProviders={(event) =>
                    beginHorizontalResize(event, {
                      startWidth: directoryPanelWidth,
                      min: 260,
                      max: 500,
                      onResize: setDirectoryPanelWidth,
                    })
                  }
                  model={model}
                  {...(props.onRefreshConnections
                    ? { onRefreshConnections: props.onRefreshConnections }
                    : {})}
                />
              ) : centerView === "settings" ? (
                <SettingsPage
                  enterToSend={enterToSend}
                  locale={activeLocale}
                  model={model}
                  onLocaleChange={setLocale}
                  onSelect={(nextSelection) => {
                    setCenterView("conversation");
                    setSelection(nextSelection);
                  }}
                  onToggleEnterToSend={setEnterToSend}
                  onToggleTheme={() =>
                    setTheme((current) => (current === "dark" ? "light" : "dark"))
                  }
                  theme={theme}
                />
              ) : (
                <>
                  <ChatTimeline
                    items={model.timeline}
                    selected={selection}
                    onSelect={setSelection}
                    onOpenAgent={(agentId) => {
                      setSelectedAgentId(agentId);
                      setCenterView("agents");
                    }}
                  />
                  <AgentMentionComposer
                    disabled={model.composer.disabled}
                    disabledReason={model.composer.disabledReason}
                    enterToSend={enterToSend}
                    locale={activeLocale}
                    modeLabel={model.composer.modeLabel}
                    {...(props.onSend ? { onSend: props.onSend } : {})}
                    selectedTarget={model.composer.selectedTarget}
                    targets={model.composer.targets}
                  />
                </>
              )}
            </section>
            {renderInspector ? (
              <div
                aria-hidden={rightCollapsed ? "true" : undefined}
                className="agenthub-motion-right-panel"
              >
                <ContextInspector
                  collapsed={rightCollapsed}
                  model={model}
                  {...(props.onAddAgentToChat ? { onAddAgentToChat: props.onAddAgentToChat } : {})}
                  {...(props.onRemoveAgentFromChat
                    ? { onRemoveAgentFromChat: props.onRemoveAgentFromChat }
                    : {})}
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
              {renderOverlayInspector ? (
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
                    {...(props.onAddAgentToChat
                      ? { onAddAgentToChat: props.onAddAgentToChat }
                      : {})}
                    {...(props.onRemoveAgentFromChat
                      ? { onRemoveAgentFromChat: props.onRemoveAgentFromChat }
                      : {})}
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
              <section
                aria-label={i18n.t("nav.fullScreenDiffReview")}
                className="agenthub-fullscreen-diff"
              >
                <header>
                  <strong>{i18n.t("nav.fullScreenDiffReview")}</strong>
                  <HoverButton onClick={() => setFullScreenDiffId(null)} type="button">
                    {i18n.t("actions.returnToConversation", { fallback: "Return to conversation" })}
                  </HoverButton>
                </header>
                <DiffDetail
                  diff={fullScreenDiff}
                  fullScreen
                  onOpenFullScreen={() => setFullScreenDiffId(null)}
                />
              </section>
            ) : null}
          </main>
        </MotionConfig>
      </AgentHubThemeProvider>
    </AgentHubI18nProvider>
  );
}

function WorkbenchStyle(): React.ReactElement {
  return <style>{workbenchCss}</style>;
}
