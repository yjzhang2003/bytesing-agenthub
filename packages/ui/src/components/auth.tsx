import React from "react";
import type { AuthFormMode, LoginSurfaceProps, ProductHomepageProps } from "../types.js";
import { ASCIIText } from "./ascii-text.js";
import { BorderGlow } from "./border-glow.js";
import { PixelBlast } from "./pixel-blast.js";
import { AgentHubButton, AgentHubThemeProvider } from "./system.js";
import { createAgentHubI18n, type AgentHubLocale } from "../i18n.js";
import { AGENTHUB_LOGO_URL } from "../brand.js";

const AGENTHUB_GITHUB_URL = "https://github.com/yjzhang2003/bytesing-agenthub";

function normalizeLoginLocale(locale: LoginSurfaceProps["locale"]): AgentHubLocale {
  return locale === "zh-CN" || locale === "zh" ? "zh-CN" : "en-US";
}

function AgentHubLogoMark(props: { readonly className: string }): React.ReactElement {
  return (
    <span className={props.className} aria-hidden="true">
      <img alt="" src={AGENTHUB_LOGO_URL} />
    </span>
  );
}

function GitHubIcon(): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      className="agenthub-home-github-icon"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.24 3.35.95.1-.74.4-1.24.73-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18.91-.25 1.89-.38 2.86-.39.97.01 1.95.14 2.86.39 2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.83 1.18 3.08 0 4.42-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export function AgentHubProductHomepage(props: ProductHomepageProps): React.ReactElement {
  const i18n = createAgentHubI18n(normalizeLoginLocale(props.locale));
  const githubUrl = props.githubUrl ?? AGENTHUB_GITHUB_URL;

  return (
    <AgentHubThemeProvider mode="light">
      <main className="agenthub-home-shell">
        <PixelBlast
          className="agenthub-home-pixel-field"
          color="#b497cf"
          edgeFade={0.18}
          patternDensity={1.16}
          patternScale={2.8}
          pixelSize={5}
          pixelSizeJitter={0.42}
          rippleIntensityScale={1.1}
          rippleSpeed={0.26}
          rippleThickness={0.12}
          speed={0.34}
          variant="circle"
        />
        <span className="agenthub-home-motion" aria-hidden="true" />
        <nav className="agenthub-home-nav" aria-label="AgentHub">
          <div className="agenthub-home-brand">
            <AgentHubLogoMark className="agenthub-home-mark" />
            <span>AgentHub</span>
          </div>
          <div className="agenthub-home-nav-links">
            <a href="#product">{i18n.t("homepage.navProduct")}</a>
            <a href="#control">{i18n.t("homepage.navSecurity")}</a>
          </div>
          <div className="agenthub-home-nav-actions">
            <a
              className="agenthub-home-github-link"
              href={githubUrl}
              rel="noreferrer"
              target="_blank"
            >
              <GitHubIcon />
              {i18n.t("homepage.githubCta")}
            </a>
          </div>
        </nav>

        <section className="agenthub-home-hero" id="product">
          <div className="agenthub-home-copy">
            <div className="agenthub-home-ascii-wrap">
              <ASCIIText text="AgentHub" />
              <h1>{i18n.t("homepage.brandTitle")}</h1>
            </div>
            <p>{i18n.t("homepage.description")}</p>
            <div className="agenthub-home-actions">
              <AgentHubButton kind="primary" onClick={props.onOpenLogin} size="large">
                {i18n.t("homepage.primaryCta")}
              </AgentHubButton>
            </div>
          </div>
        </section>
      </main>
    </AgentHubThemeProvider>
  );
}

export function AgentHubLoginPage(props: LoginSurfaceProps): React.ReactElement {
  const i18n = createAgentHubI18n(normalizeLoginLocale(props.locale));
  const [mode, setMode] = React.useState<AuthFormMode>(props.initialMode ?? "sign-in");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [pendingMethod, setPendingMethod] = React.useState<"email" | "github" | null>(null);
  const busy =
    pendingMethod !== null ||
    props.authState.status === "authenticating" ||
    props.authState.status === "callback";
  const configurationError = props.authState.status === "configuration-error";
  const error = props.authState.status === "error" ? props.authState.message : null;
  const externalSuccess = props.authState.status === "success" ? props.authState.message : null;
  const configurationMessage = configurationError ? props.authState.message : null;
  const title =
    props.authState.status === "callback"
      ? i18n.t("auth.callbackTitle")
      : mode === "reset-password"
        ? i18n.t("auth.resetPasswordTitle")
        : mode === "signup"
          ? i18n.t("auth.signupTitle")
          : mode === "forgot-password"
            ? i18n.t("auth.forgotPasswordTitle")
            : i18n.t("auth.title");
  const description =
    props.authState.status === "callback"
      ? i18n.t("auth.callbackDescription")
      : configurationError
        ? i18n.t("auth.configurationErrorMessage")
        : mode === "reset-password"
          ? i18n.t("auth.resetPasswordDescription")
          : mode === "signup"
            ? i18n.t("auth.signupDescription")
            : mode === "forgot-password"
              ? i18n.t("auth.forgotPasswordDescription")
              : i18n.t("auth.description");

  React.useEffect(() => {
    if (props.initialMode) {
      setMode(props.initialMode);
      setFormError(null);
      setSuccess(null);
    }
  }, [props.initialMode]);

  function switchMode(nextMode: AuthFormMode): void {
    setMode(nextMode);
    setFormError(null);
    setSuccess(null);
  }

  function normalizeEmail(value: string): string {
    return value.trim();
  }

  function validateEmail(value: string): string | null {
    if (!value.trim()) {
      return i18n.t("auth.validationEmailRequired");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return i18n.t("auth.validationEmailInvalid");
    }
    return null;
  }

  function validatePassword(value: string): string | null {
    if (!value) {
      return i18n.t("auth.validationPasswordRequired");
    }
    if (value.length < 8) {
      return i18n.t("auth.validationPasswordLength");
    }
    return null;
  }

  async function runAuthAction(action: () => Promise<void>): Promise<void> {
    setPendingMethod("email");
    setFormError(null);
    setSuccess(null);
    try {
      await action();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : i18n.t("auth.genericError"));
    } finally {
      setPendingMethod(null);
    }
  }

  function submitEmail(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const normalizedEmail = normalizeEmail(email);
    const emailError = mode === "reset-password" ? null : validateEmail(normalizedEmail);
    const passwordValue = mode === "reset-password" ? newPassword : password;
    const passwordError = mode === "forgot-password" ? null : validatePassword(passwordValue);
    const nextError = emailError ?? passwordError;
    if (nextError) {
      setFormError(nextError);
      return;
    }

    if (mode === "signup" && props.onSignUpWithEmail) {
      void runAuthAction(async () => {
        const result = await props.onSignUpWithEmail?.({
          email: normalizedEmail,
          password,
        });
        if (result?.status === "confirmation-required") {
          setSuccess(i18n.t("auth.signupConfirmation", { email: result.email }));
        }
      });
      return;
    }

    if (mode === "forgot-password" && props.onRequestPasswordReset) {
      void runAuthAction(async () => {
        await props.onRequestPasswordReset?.({ email: normalizedEmail });
        setSuccess(i18n.t("auth.resetRequestSuccess"));
      });
      return;
    }

    if (mode === "reset-password" && props.onUpdatePassword) {
      void runAuthAction(async () => {
        await props.onUpdatePassword?.({ password: newPassword });
        setSuccess(i18n.t("auth.passwordUpdated"));
      });
      return;
    }

    if (props.onSignInWithEmail) {
      void runAuthAction(async () => {
        await props.onSignInWithEmail?.({
          email: normalizedEmail,
          password,
        });
      });
    }
  }

  return (
    <AgentHubThemeProvider mode="light">
      <main className="agenthub-auth-shell" data-auth-state={props.authState.status}>
        <PixelBlast
          className="agenthub-auth-pixel-field"
          color="#b497cf"
          edgeFade={0.2}
          patternDensity={1}
          patternScale={2.7}
          pixelSize={5}
          pixelSizeJitter={0.36}
          rippleIntensityScale={0.85}
          rippleSpeed={0.22}
          rippleThickness={0.12}
          speed={0.24}
          variant="circle"
        />
        <BorderGlow className="agenthub-auth-glow" glowColor="260 78 72" glowIntensity={0.68}>
          <section className="agenthub-auth-panel" aria-labelledby="agenthub-auth-title">
          <AgentHubLogoMark className="agenthub-auth-brand" />
          <div className="agenthub-auth-copy">
            <h1 id="agenthub-auth-title">{title}</h1>
            <p>{description}</p>
            <small>{i18n.t("auth.loginTrust")}</small>
          </div>
          {props.authState.status === "callback" ? null : (
            <form className="agenthub-auth-form" onSubmit={submitEmail}>
              {mode === "reset-password" ? null : (
                <label className="agenthub-auth-field">
                  <span>{i18n.t("auth.emailLabel")}</span>
                  <input
                    autoComplete="email"
                    disabled={busy || configurationError}
                    inputMode="email"
                    onChange={(event) => setEmail(event.currentTarget.value)}
                    placeholder={i18n.t("auth.emailPlaceholder")}
                    type="email"
                    value={email}
                  />
                </label>
              )}
              {mode === "forgot-password" ? null : (
                <label className="agenthub-auth-field">
                  <span>
                    {mode === "reset-password"
                      ? i18n.t("auth.newPasswordLabel")
                      : i18n.t("auth.passwordLabel")}
                  </span>
                  <input
                    autoComplete={mode === "reset-password" ? "new-password" : "current-password"}
                    disabled={busy || configurationError}
                    minLength={8}
                    onChange={(event) =>
                      mode === "reset-password"
                        ? setNewPassword(event.currentTarget.value)
                        : setPassword(event.currentTarget.value)
                    }
                    placeholder={i18n.t("auth.passwordPlaceholder")}
                    type="password"
                    value={mode === "reset-password" ? newPassword : password}
                  />
                </label>
              )}
              <AgentHubButton
                disabled={busy || configurationError}
                kind="primary"
                loading={pendingMethod === "email"}
                size="large"
                type="submit"
              >
                {pendingMethod === "email"
                  ? i18n.t("auth.submitting")
                  : mode === "signup"
                    ? i18n.t("auth.createAccount")
                    : mode === "forgot-password"
                      ? i18n.t("auth.sendResetLink")
                      : mode === "reset-password"
                        ? i18n.t("auth.updatePassword")
                        : i18n.t("auth.signInWithEmail")}
              </AgentHubButton>
              <div className="agenthub-auth-mode-actions">
                {mode === "sign-in" ? (
                  <>
                    <button type="button" onClick={() => switchMode("signup")}>
                      {i18n.t("auth.switchToSignup")}
                    </button>
                    <button type="button" onClick={() => switchMode("forgot-password")}>
                      {i18n.t("auth.forgotPassword")}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => switchMode("sign-in")}>
                    {i18n.t("auth.backToSignIn")}
                  </button>
                )}
              </div>
            </form>
          )}
          <div className="agenthub-auth-divider" role="separator">
            {i18n.t("auth.or")}
          </div>
          <AgentHubButton
            disabled={busy || configurationError}
            kind="primary"
            loading={pendingMethod === "github" || props.authState.status === "authenticating"}
            onClick={() => {
              setPendingMethod("github");
              setFormError(null);
              setSuccess(null);
              props.onSignInWithGitHub();
            }}
            size="large"
          >
            {pendingMethod === "github" || props.authState.status === "authenticating"
              ? i18n.t("auth.signingIn")
              : i18n.t("auth.continueWithGitHub")}
          </AgentHubButton>
          {success || externalSuccess ? (
            <div className="agenthub-auth-success" role="status">
              {success ?? externalSuccess}
            </div>
          ) : null}
          {formError ? (
            <div className="agenthub-auth-error" role="alert">
              <strong>{i18n.t("auth.errorTitle")}</strong>
              <span>{formError}</span>
            </div>
          ) : null}
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
        </BorderGlow>
      </main>
    </AgentHubThemeProvider>
  );
}
