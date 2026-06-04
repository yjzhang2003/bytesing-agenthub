import React from "react";
import type { LoginSurfaceProps, ProductHomepageProps } from "../types.js";
import { AgentHubButton, AgentHubThemeProvider } from "./system.js";
import { createAgentHubI18n, type AgentHubLocale } from "../i18n.js";

function normalizeLoginLocale(locale: LoginSurfaceProps["locale"]): AgentHubLocale {
  return locale === "zh-CN" || locale === "zh" ? "zh-CN" : "en-US";
}

export function AgentHubProductHomepage(props: ProductHomepageProps): React.ReactElement {
  const i18n = createAgentHubI18n(normalizeLoginLocale(props.locale));
  const evidence = [
    {
      key: "runtime",
      title: i18n.t("homepage.runtimeCard"),
      detail: i18n.t("homepage.runtimeCardDetail"),
    },
    {
      key: "permissions",
      title: i18n.t("homepage.permissionCard"),
      detail: i18n.t("homepage.permissionCardDetail"),
    },
    {
      key: "artifacts",
      title: i18n.t("homepage.artifactCard"),
      detail: i18n.t("homepage.artifactCardDetail"),
    },
    {
      key: "agent",
      title: i18n.t("homepage.agentCard"),
      detail: i18n.t("homepage.agentCardDetail"),
    },
  ] as const;

  return (
    <AgentHubThemeProvider mode="light">
      <main className="agenthub-home-shell">
        <nav className="agenthub-home-nav" aria-label="AgentHub">
          <span className="agenthub-home-mark" aria-hidden="true">
            AH
          </span>
          <div className="agenthub-home-nav-links">
            <a href="#product">{i18n.t("homepage.navProduct")}</a>
            <a href="#control">{i18n.t("homepage.navSecurity")}</a>
          </div>
          <AgentHubButton kind="default" onClick={props.onOpenLogin} size="small">
            {i18n.t("homepage.openLogin")}
          </AgentHubButton>
        </nav>

        <section className="agenthub-home-hero" id="product">
          <div className="agenthub-home-copy">
            <p className="agenthub-home-kicker">{i18n.t("homepage.category")}</p>
            <h1>{i18n.t("homepage.title")}</h1>
            <p>{i18n.t("homepage.description")}</p>
            <div className="agenthub-home-actions">
              <AgentHubButton kind="primary" onClick={props.onOpenLogin} size="large">
                {i18n.t("homepage.primaryCta")}
              </AgentHubButton>
              <a href="#workflow">{i18n.t("homepage.secondaryCta")}</a>
            </div>
            <small className="agenthub-home-provider">{i18n.t("homepage.providerNote")}</small>
          </div>

          <div className="agenthub-home-product" aria-label="AgentHub product workflow">
            <div className="agenthub-home-product-header">
              <span>AgentHub</span>
              <strong>Workspace</strong>
            </div>
            <div className="agenthub-home-product-grid">
              {evidence.map((item) => (
                <article className="agenthub-home-product-cell" data-cell={item.key} key={item.key}>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="agenthub-home-features" id="workflow">
          <h2>{i18n.t("homepage.featuresTitle")}</h2>
          <ul>
            <li>{i18n.t("homepage.featureRuntime")}</li>
            <li>{i18n.t("homepage.featurePermissions")}</li>
            <li>{i18n.t("homepage.featureArtifacts")}</li>
          </ul>
        </section>

        <footer className="agenthub-home-footer" id="control">
          {i18n.t("homepage.footer")}
        </footer>
      </main>
    </AgentHubThemeProvider>
  );
}

export function AgentHubLoginPage(props: LoginSurfaceProps): React.ReactElement {
  const i18n = createAgentHubI18n(normalizeLoginLocale(props.locale));
  const busy = props.authState.status === "authenticating" || props.authState.status === "callback";
  const configurationError = props.authState.status === "configuration-error";
  const error = props.authState.status === "error" ? props.authState.message : null;
  const configurationMessage = configurationError ? props.authState.message : null;
  const title =
    props.authState.status === "callback" ? i18n.t("auth.callbackTitle") : i18n.t("auth.title");
  const description =
    props.authState.status === "callback"
      ? i18n.t("auth.callbackDescription")
      : configurationError
        ? i18n.t("auth.configurationErrorMessage")
        : i18n.t("auth.description");

  return (
    <AgentHubThemeProvider mode="light">
      <main className="agenthub-auth-shell" data-auth-state={props.authState.status}>
        <section className="agenthub-auth-panel" aria-labelledby="agenthub-auth-title">
          <div className="agenthub-auth-brand" aria-hidden="true">
            AH
          </div>
          <div className="agenthub-auth-copy">
            <h1 id="agenthub-auth-title">{title}</h1>
            <p>{description}</p>
            <small>{i18n.t("auth.loginTrust")}</small>
          </div>
          <AgentHubButton
            disabled={busy || configurationError}
            kind="primary"
            loading={busy}
            onClick={props.onSignInWithGitHub}
            size="large"
          >
            {busy ? i18n.t("auth.signingIn") : i18n.t("auth.continueWithGitHub")}
          </AgentHubButton>
          {configurationMessage ? (
            <div className="agenthub-auth-error" role="alert">
              <strong>{i18n.t("auth.configurationErrorTitle")}</strong>
              <span>
                {i18n.t("auth.configurationErrorMessage")} <code>{configurationMessage}</code>
              </span>
            </div>
          ) : null}
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
          {props.onOpenHomepage ? (
            <AgentHubButton kind="default" onClick={props.onOpenHomepage} size="small">
              {i18n.t("auth.backToHomepage")}
            </AgentHubButton>
          ) : null}
        </section>
      </main>
    </AgentHubThemeProvider>
  );
}
