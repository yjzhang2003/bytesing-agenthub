import { createRoot } from "react-dom/client";
import {
  AgentHubButton,
  AgentHubLoginPage,
  AgentHubProductHomepage,
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
  defaultWebEmailAuthRedirectTo,
  classifyWebAuthError,
  completeOAuthCallback,
  createGitHubOAuthUrl,
  defaultDesktopOAuthRedirectTo,
  defaultWebOAuthRedirectTo,
  defaultWebPasswordResetRedirectTo,
  readWebAuthMode,
  requestEmailPasswordReset,
  resolvePublicWebLocale,
  resolveWebEntryView,
  signInWithEmailPassword,
  signInWithGitHub,
  signOutOfWebAuth,
  signUpWithEmailPassword,
  updateEmailPassword,
  webPathFromLocation,
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

export function AgentHubConnectedApp(props: {
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
  const [currentPath, setCurrentPath] = React.useState(() => webPathFromLocation());
  const authMode = React.useMemo(() => readWebAuthMode(), []);
  const publicLocale = React.useMemo(() => resolvePublicWebLocale(), []);
  const supabase = React.useMemo(() => createWebSupabaseClient(), []);
  const desktopAuthActions = React.useMemo(() => createAgentHubDesktopProjectActions(), []);
  const entryView = resolveWebEntryView({
    authenticated: Boolean(client),
    pathname: currentPath,
  });

  const navigateTo = React.useCallback((path: string) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
  }, []);

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
      if (
        currentPath === "/" ||
        currentPath === "/login" ||
        currentPath === "/auth/callback" ||
        currentPath === "/auth/reset-password"
      ) {
        window.history.replaceState(null, "", "/");
        setCurrentPath("/");
      }
    } catch (caught) {
      const errorKind = classifyWebAuthError(caught);
      setClient(null);
      if (caught instanceof AuthenticationRequiredError && currentPath !== "/auth/callback") {
        setError(null);
      } else if (errorKind === "session-required" && currentPath === "/auth/callback") {
        setError("GitHub sign-in could not be completed. Try again.");
      } else if (errorKind === "control-plane") {
        setError("Signed in, but the Control Plane is unreachable.");
      } else {
        setError(caught instanceof Error ? caught.message : "Unable to initialize AgentHub.");
      }
    } finally {
      setLoading(false);
    }
  }, [currentPath, handleAuthenticationFailure]);

  const signIn = React.useCallback(async () => {
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    setAuthenticating(true);
    setError(null);
    try {
      if (desktopAuthActions.startGitHubLogin) {
        const authUrl = await createGitHubOAuthUrl({
          redirectTo: defaultDesktopOAuthRedirectTo(),
          supabase,
        });
        await desktopAuthActions.startGitHubLogin(authUrl);
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

  React.useEffect(() => {
    if (!desktopAuthActions.onAuthCallback || !supabase) {
      return undefined;
    }
    return desktopAuthActions.onAuthCallback((callbackUrl) => {
      setAuthenticating(true);
      setError(null);
      void completeOAuthCallback({ callbackUrl, supabase })
        .then(() => initializeClient())
        .catch((caught: unknown) => {
          setError(caught instanceof Error ? caught.message : "GitHub sign-in could not be completed.");
          setAuthenticating(false);
        });
    });
  }, [desktopAuthActions, initializeClient, supabase]);

  const signInWithEmail = React.useCallback(
    async (input: { readonly email: string; readonly password: string }) => {
      if (!supabase) {
        setError("Supabase is not configured.");
        return;
      }
      setError(null);
      await signInWithEmailPassword({
        email: input.email,
        password: input.password,
        supabase,
      });
      await initializeClient();
    },
    [initializeClient, supabase],
  );

  const signUpWithEmail = React.useCallback(
    async (input: { readonly email: string; readonly password: string }) => {
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }
      setError(null);
      const result = await signUpWithEmailPassword({
        email: input.email,
        password: input.password,
        redirectTo: defaultWebEmailAuthRedirectTo(),
        supabase,
      });
      if (result.status === "signed-in") {
        await initializeClient();
      }
      return result;
    },
    [initializeClient, supabase],
  );

  const requestPasswordReset = React.useCallback(
    async (input: { readonly email: string }) => {
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }
      setError(null);
      await requestEmailPasswordReset({
        email: input.email,
        redirectTo: defaultWebPasswordResetRedirectTo(),
        supabase,
      });
    },
    [supabase],
  );

  const updatePassword = React.useCallback(
    async (input: { readonly password: string }) => {
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }
      setError(null);
      await updateEmailPassword({
        password: input.password,
        supabase,
      });
      await initializeClient();
    },
    [initializeClient, supabase],
  );

  const signOut = React.useCallback(async () => {
    if (supabase) {
      await signOutOfWebAuth(supabase);
    }
    clearAuthenticatedState();
  }, [clearAuthenticatedState, supabase]);

  React.useEffect(() => {
    void initializeClient();
  }, [initializeClient]);

  React.useEffect(() => {
    const handlePopState = () => setCurrentPath(webPathFromLocation());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (!client) {
    if (authMode === "supabase") {
      if (entryView === "homepage") {
        return (
          <AgentHubProductHomepage
            locale={publicLocale}
            onOpenLogin={() => navigateTo("/login")}
          />
        );
      }
      return (
        <AgentHubLoginPage
          authState={
            !supabase
              ? { status: "configuration-error", message: "Missing Supabase web configuration." }
              : currentPath === "/auth/callback" && loading
                ? { status: "callback" }
                : authenticating
                  ? { status: "authenticating" }
                  : error
                    ? { status: "error", message: error }
                    : { status: "unauthenticated" }
          }
          locale={publicLocale}
          onOpenHomepage={() => navigateTo("/")}
          initialMode={entryView === "auth-reset-password" ? "reset-password" : "sign-in"}
          onRequestPasswordReset={requestPasswordReset}
          onRetry={() => void initializeClient()}
          onSignInWithEmail={signInWithEmail}
          onSignInWithGitHub={() => void signIn()}
          onSignUpWithEmail={signUpWithEmail}
          onUpdatePassword={updatePassword}
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
