import React from "react";
import type { LoginSurfaceProps } from "../types.js";
import { AgentHubButton, AgentHubThemeProvider } from "./system.js";
import { createAgentHubI18n, type AgentHubLocale } from "../i18n.js";

function normalizeLoginLocale(locale: LoginSurfaceProps["locale"]): AgentHubLocale {
  return locale === "zh-CN" || locale === "zh" ? "zh-CN" : "en-US";
}

export function AgentHubLoginPage(props: LoginSurfaceProps): React.ReactElement {
  const i18n = createAgentHubI18n(normalizeLoginLocale(props.locale));
  const busy = props.authState.status === "authenticating";
  const error = props.authState.status === "error" ? props.authState.message : null;

  return (
    <AgentHubThemeProvider mode="light">
      <main className="agenthub-auth-shell" data-auth-state={props.authState.status}>
        <section className="agenthub-auth-panel" aria-labelledby="agenthub-auth-title">
          <div className="agenthub-auth-brand" aria-hidden="true">
            AH
          </div>
          <div className="agenthub-auth-copy">
            <h1 id="agenthub-auth-title">{i18n.t("auth.title")}</h1>
            <p>{i18n.t("auth.description")}</p>
          </div>
          <AgentHubButton
            disabled={busy}
            kind="primary"
            loading={busy}
            onClick={props.onSignInWithGitHub}
            size="large"
          >
            {busy ? i18n.t("auth.signingIn") : i18n.t("auth.continueWithGitHub")}
          </AgentHubButton>
          {error ? (
            <div className="agenthub-auth-error" role="alert">
              <strong>{i18n.t("auth.errorTitle")}</strong>
              <span>
                {i18n.t("auth.errorMessage")} <code>{error}</code>
              </span>
              {props.onRetry ? (
                <AgentHubButton kind="default" onClick={props.onRetry} size="small">
                  {i18n.t("auth.retry")}
                </AgentHubButton>
              ) : null}
            </div>
          ) : null}
        </section>
      </main>
    </AgentHubThemeProvider>
  );
}
