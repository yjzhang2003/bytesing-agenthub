import { createRoot } from "react-dom/client";
import {
  AgentHubButton,
  AgentHubLoginPage,
  AgentHubWorkbench,
  createAgentHubI18n,
} from "@agenthub/ui";
import { type WorkbenchSnapshot } from "@agenthub/contracts";
import {
  applyAgentHubEventToSnapshot,
  connectionCheckTimestamps,
  createRunRequestFromSnapshot,
  hasFreshConnectionCheckResults,
} from "./app-state.js";
import {
  createAuthenticatedWebControlPlaneClient,
  type WebControlPlaneClient,
} from "./control-plane-client.js";
import {
  AuthenticationRequiredError,
  defaultWebOAuthRedirectTo,
  readWebAuthMode,
  signInWithGitHub,
  signOutOfWebAuth,
} from "./auth-session.js";
import { notifyForAgentHubEvent, requestAgentHubNotificationPermission } from "./notifications.js";
import { createAgentHubDesktopProjectActions } from "./desktop-api.js";
import { createWebSupabaseClient } from "./supabase.js";
import React from "react";

const CONNECTION_CHECK_POLL_INTERVAL_MS = 500;
const CONNECTION_CHECK_MAX_POLLS = 20;

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function eventRequiresSnapshotRefresh(type: string): boolean {
  return type.startsWith("collaboration.");
}

function AgentHubConnectedApp(props: {
  readonly client: WebControlPlaneClient;
  readonly onAuthenticationFailure?: (() => void) | undefined;
  readonly onSignOut?: (() => void) | undefined;
}): React.ReactElement {
  const { client, onAuthenticationFailure, onSignOut } = props;
  const [snapshot, setSnapshot] = React.useState<WorkbenchSnapshot | undefined>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const snapshotRef = React.useRef<WorkbenchSnapshot | undefined>(undefined);
  const desktopProjectActions = React.useMemo(() => createAgentHubDesktopProjectActions(), []);

  const loadSnapshot = React.useCallback(
    async (options: { readonly showLoading?: boolean } = {}) => {
      if (options.showLoading) {
        setLoading(true);
      }
      setError(null);
      try {
        const nextSnapshot = await client.getSnapshot();
        snapshotRef.current = nextSnapshot;
        setSnapshot(nextSnapshot);
        return nextSnapshot;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to reach Control Plane");
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [client],
  );

  React.useEffect(() => {
    void loadSnapshot({ showLoading: true });
    const stream = client.openEvents((event) => {
      if (snapshotRef.current) {
        notifyForAgentHubEvent(snapshotRef.current, event);
      }
      if (eventRequiresSnapshotRefresh(event.type)) {
        void loadSnapshot();
        return;
      }
      setSnapshot((current) => {
        if (!current) {
          return current;
        }
        const nextSnapshot = applyAgentHubEventToSnapshot(current, event);
        snapshotRef.current = nextSnapshot;
        return nextSnapshot;
      });
    });
    stream.onerror = () => {
      stream.close();
      if (onAuthenticationFailure) {
        onAuthenticationFailure();
        return;
      }
      setError("Control Plane event stream disconnected");
    };
    return () => stream.close();
  }, [client, loadSnapshot, onAuthenticationFailure]);

  return (
    <>
      {onSignOut ? (
        <div className="agenthub-web-auth-actions">
          <AgentHubButton kind="default" onClick={onSignOut} size="small">
            {createAgentHubI18n("en-US").t("auth.signOut")}
          </AgentHubButton>
        </div>
      ) : null}
      <AgentHubWorkbench
        error={error}
        loading={loading}
        onRetry={() => void loadSnapshot({ showLoading: true })}
        onSend={(message, target, claudeCode) => {
          const active = snapshot;
          if (!active) {
            return;
          }
          void client
            .createRun(createRunRequestFromSnapshot(active, target, message, claudeCode))
            .then(() => loadSnapshot());
        }}
        onCreateAgentRole={(input) => {
          const active = snapshot;
          if (!active) {
            return;
          }
          void client
            .createAgent({
              workspaceId: active.activeWorkspaceId,
              displayName: input.displayName,
              role: input.role,
              systemPrompt: input.systemPrompt,
              capabilityTags: input.capabilityTags,
              policy: input.policy,
            })
            .then(() => loadSnapshot());
        }}
        onUpdateAgentRole={(input) => {
          void client
            .updateAgent(input.agentId, {
              displayName: input.displayName,
              role: input.role,
              systemPrompt: input.systemPrompt,
              capabilityTags: input.capabilityTags,
              policy: input.policy,
            })
            .then(() => loadSnapshot());
        }}
        onArchiveAgentRole={(agentId) => {
          void client.archiveAgent(agentId).then(() => loadSnapshot());
        }}
        onCreateAgentConversation={(agentId) => {
          const active = snapshot;
          if (!active) {
            return;
          }
          const activeConversation = active.conversations.find(
            (conversation) => conversation.id === active.activeConversationId,
          );
          const projectId = activeConversation?.projectId ?? active.projects[0]?.id;
          if (!projectId) {
            return;
          }
          return client
            .createAgentConversation({
              workspaceId: active.activeWorkspaceId,
              projectId,
              agentIds: [agentId],
            })
            .then(async () => {
              await loadSnapshot();
            });
        }}
        onCreateConversation={(input) => {
          return client.createAgentConversation(input).then(async () => {
            await loadSnapshot();
          });
        }}
        {...(desktopProjectActions.chooseProjectDirectory ||
        desktopProjectActions.createDefaultProject
          ? {
              ...(desktopProjectActions.chooseProjectDirectory
                ? { onChooseProjectDirectory: desktopProjectActions.chooseProjectDirectory }
                : {}),
              ...(desktopProjectActions.createDefaultProject
                ? { onCreateDefaultProject: desktopProjectActions.createDefaultProject }
                : {}),
            }
          : {})}
        desktopProjectActionsUnavailable={desktopProjectActions.bridgeUnavailable}
        onOpenConversation={(conversationId) => {
          setSnapshot((current) =>
            current ? { ...current, activeConversationId: conversationId } : current,
          );
          void client.setActiveConversation(conversationId).then(() => loadSnapshot());
        }}
        onUpdateConversation={(conversationId, input) => {
          if (input.notificationsMuted === false) {
            void requestAgentHubNotificationPermission();
          }
          void client.updateConversation(conversationId, input).then(() => loadSnapshot());
        }}
        onDeleteConversation={(conversationId) => {
          void client.deleteConversation(conversationId).then(() => loadSnapshot());
        }}
        onAddAgentToChat={(conversationId, agentId) => {
          void client.addAgentToConversation(conversationId, agentId).then(() => loadSnapshot());
        }}
        onRemoveAgentFromChat={(conversationId, agentId) => {
          void client
            .removeAgentFromConversation(conversationId, agentId)
            .then(() => loadSnapshot());
        }}
        onUpdateConversationAgentSettings={(conversationId, agentId, input) => {
          void client
            .updateConversationAgentSettings(conversationId, agentId, input)
            .then(() => loadSnapshot());
        }}
        onCheckConnections={(targets) => {
          const active = snapshot;
          if (!active) {
            return;
          }
          const previous = connectionCheckTimestamps(active, targets);
          return client
            .checkConnections({
              workspaceId: active.activeWorkspaceId,
              targets,
            })
            .then(async () => {
              for (let attempt = 0; attempt < CONNECTION_CHECK_MAX_POLLS; attempt += 1) {
                const nextSnapshot = await loadSnapshot();
                if (
                  nextSnapshot &&
                  hasFreshConnectionCheckResults(nextSnapshot, previous, targets)
                ) {
                  return;
                }
                await wait(CONNECTION_CHECK_POLL_INTERVAL_MS);
              }
              await loadSnapshot();
            });
        }}
        onRefreshConnections={() => void loadSnapshot()}
        {...(snapshot ? { snapshot } : {})}
      />
    </>
  );
}

function AgentHubWebApp(): React.ReactElement {
  const [client, setClient] = React.useState<WebControlPlaneClient | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [authenticating, setAuthenticating] = React.useState(false);
  const authMode = React.useMemo(() => readWebAuthMode(), []);
  const supabase = React.useMemo(() => createWebSupabaseClient(), []);
  const desktopAuthActions = React.useMemo(() => createAgentHubDesktopProjectActions(), []);

  const clearAuthenticatedState = React.useCallback((message: string | null = null) => {
    setClient(null);
    setError(message);
    setLoading(false);
    setAuthenticating(false);
  }, []);

  const handleAuthenticationFailure = React.useCallback(() => {
    if (supabase) {
      void signOutOfWebAuth(supabase).catch(() => undefined);
    }
    clearAuthenticatedState("Sign in to access AgentHub.");
  }, [clearAuthenticatedState, supabase]);

  const initializeClient = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setClient(
        await createAuthenticatedWebControlPlaneClient(import.meta.env, {
          onAuthenticationFailure: handleAuthenticationFailure,
        }),
      );
    } catch (caught) {
      setClient(null);
      setError(
        caught instanceof AuthenticationRequiredError
          ? "Sign in to access AgentHub."
          : caught instanceof Error
            ? caught.message
            : "Unable to initialize AgentHub.",
      );
    } finally {
      setLoading(false);
    }
  }, [handleAuthenticationFailure]);

  const signIn = React.useCallback(async () => {
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    setAuthenticating(true);
    setError(null);
    try {
      if (desktopAuthActions.startGitHubLogin) {
        await desktopAuthActions.startGitHubLogin();
      } else {
        await signInWithGitHub({
          redirectTo: defaultWebOAuthRedirectTo(),
          supabase,
        });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start GitHub sign-in.");
      setAuthenticating(false);
    }
  }, [desktopAuthActions, supabase]);

  const signOut = React.useCallback(async () => {
    if (supabase) {
      await signOutOfWebAuth(supabase);
    }
    clearAuthenticatedState();
  }, [clearAuthenticatedState, supabase]);

  React.useEffect(() => {
    void initializeClient();
  }, [initializeClient]);

  if (!client) {
    if (authMode === "supabase") {
      return (
        <AgentHubLoginPage
          authState={
            authenticating
              ? { status: "authenticating" }
              : error
                ? { status: "error", message: error }
                : { status: "unauthenticated" }
          }
          onRetry={() => void initializeClient()}
          onSignInWithGitHub={() => void signIn()}
        />
      );
    }
    return (
      <AgentHubWorkbench error={error} loading={loading} onRetry={() => void initializeClient()} />
    );
  }

  return (
    <AgentHubConnectedApp
      client={client}
      onAuthenticationFailure={authMode === "supabase" ? handleAuthenticationFailure : undefined}
      onSignOut={authMode === "supabase" ? signOut : undefined}
    />
  );
}

const root = document.querySelector("#root");

if (root) {
  const globalRoot = globalThis as typeof globalThis & {
    __agentHubRoot?: ReturnType<typeof createRoot>;
  };
  globalRoot.__agentHubRoot ??= createRoot(root);
  globalRoot.__agentHubRoot.render(<AgentHubWebApp />);
}
