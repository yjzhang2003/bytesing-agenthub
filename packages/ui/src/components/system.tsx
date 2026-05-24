import React from "react";

export type AgentHubThemeMode = "dark" | "light";
export type AgentHubControlSize = "small" | "middle" | "large";
export type AgentHubComponentSize = "sm" | "md" | "lg";
export type AgentHubDensity = "compact" | "comfortable";
export type AgentHubTone = "neutral" | "accent" | "danger" | "warning" | "success" | "muted";
export type AgentHubVariant = "solid" | "outline" | "ghost" | "subtle";

function joinClassNames(...values: readonly (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}

function mapSize(size?: AgentHubControlSize | AgentHubComponentSize): AgentHubComponentSize {
  if (size === "small") {
    return "sm";
  }
  if (size === "large") {
    return "lg";
  }
  if (size === "sm" || size === "lg") {
    return size;
  }
  return "md";
}

export function createAgentHubTheme(mode: AgentHubThemeMode): {
  readonly mode: AgentHubThemeMode;
  readonly tokens: Record<string, string | number>;
} {
  const dark = mode === "dark";
  return {
    mode,
    tokens: {
      background: dark ? "#10110f" : "#f4f4f1",
      surface: dark ? "#171815" : "#ffffff",
      surface2: dark ? "#1f211d" : "#f8f8f6",
      surfaceHover: dark ? "#282a26" : "#eeeeeb",
      border: dark ? "#30322e" : "#deded9",
      borderStrong: dark ? "#565a51" : "#b9bbb4",
      text: dark ? "#f2f2ee" : "#171817",
      textSecondary: dark ? "#bebfb7" : "#4f565f",
      textMuted: dark ? "#8d9188" : "#747b83",
      accent: dark ? "#f2f2ee" : "#20242c",
      accentText: dark ? "#11120f" : "#ffffff",
      status: dark ? "#7fd29a" : "#287348",
      warning: dark ? "#d6b25e" : "#9a6400",
      danger: dark ? "#ff8a8a" : "#a62a2a",
      controlHeight: 34,
      radius: 7,
      bubbleRadius: 13,
    },
  };
}

function createAgentHubCssVariables(mode: AgentHubThemeMode): React.CSSProperties {
  const tokens = createAgentHubTheme(mode).tokens;
  return {
    "--agenthub-bg": String(tokens.background),
    "--agenthub-surface": String(tokens.surface),
    "--agenthub-surface-2": String(tokens.surface2),
    "--agenthub-surface-hover": String(tokens.surfaceHover),
    "--agenthub-border": String(tokens.border),
    "--agenthub-border-strong": String(tokens.borderStrong),
    "--agenthub-text": String(tokens.text),
    "--agenthub-text-secondary": String(tokens.textSecondary),
    "--agenthub-text-muted": String(tokens.textMuted),
    "--agenthub-accent": String(tokens.accent),
    "--agenthub-accent-text": String(tokens.accentText),
    "--agenthub-status": String(tokens.status),
    "--agenthub-warning": String(tokens.warning),
    "--agenthub-danger": String(tokens.danger),
    "--agenthub-radius": `${tokens.radius}px`,
    "--agenthub-bubble-radius": `${tokens.bubbleRadius}px`,
    "--agenthub-motion-fast": "140ms ease",
    "--agenthub-motion-medium": "220ms cubic-bezier(.2, .8, .2, 1)",
    "--agenthub-font":
      'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    "--agenthub-mono": '"SFMono-Regular", "SF Mono", Consolas, "Liberation Mono", monospace',
    "--agenthub-type-xs": "11px",
    "--agenthub-type-sm": "12px",
    "--agenthub-type-md": "13px",
    "--agenthub-type-lg": "14px",
    "--agenthub-type-title": "16px",
  } as React.CSSProperties;
}

export function AgentHubThemeProvider(props: {
  readonly children: React.ReactNode;
  readonly density?: AgentHubDensity;
  readonly mode: AgentHubThemeMode;
  readonly className?: string;
}): React.ReactElement {
  return (
    <div
      className={joinClassNames("agenthub-theme-root", props.className)}
      data-density={props.density ?? "compact"}
      data-theme={props.mode}
      style={createAgentHubCssVariables(props.mode)}
    >
      {props.children}
    </div>
  );
}

export type AgentHubButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & {
  readonly children: React.ReactNode;
  readonly ariaLabel?: string;
  readonly density?: AgentHubDensity;
  readonly htmlType?: "button" | "submit" | "reset";
  readonly kind?: "default" | "primary" | "text" | "danger";
  readonly loading?: boolean;
  readonly size?: AgentHubControlSize | AgentHubComponentSize;
  readonly tone?: AgentHubTone;
  readonly type?: "button" | "submit" | "reset";
  readonly variant?: AgentHubVariant;
};

export function AgentHubButton(props: AgentHubButtonProps): React.ReactElement {
  const {
    children,
    ariaLabel,
    className,
    density = "compact",
    disabled,
    htmlType,
    kind = "text",
    loading = false,
    size,
    tone: explicitTone,
    type,
    variant: explicitVariant,
    ...buttonProps
  } = props;
  const tone = explicitTone ?? (kind === "danger" ? "danger" : kind === "primary" ? "accent" : "neutral");
  const variant =
    explicitVariant ??
    (kind === "default" || kind === "danger" ? "outline" : kind === "primary" ? "solid" : "ghost");
  return (
    <button
      {...buttonProps}
      aria-busy={loading || undefined}
      aria-label={ariaLabel ?? props["aria-label"]}
      className={joinClassNames("agenthub-button", className)}
      data-density={density}
      data-disabled={disabled || loading ? "true" : undefined}
      data-loading={loading ? "true" : undefined}
      data-size={mapSize(size)}
      data-tone={tone}
      data-variant={variant}
      disabled={disabled || loading}
      type={type ?? htmlType ?? "button"}
    >
      {children}
    </button>
  );
}

export function AgentHubIconButton(
  props: Omit<AgentHubButtonProps, "aria-label"> & {
    readonly ariaLabel?: string;
    readonly label?: string;
    readonly "aria-label"?: string;
  },
): React.ReactElement {
  const { children, label, ...buttonProps } = props;
  const resolvedAriaLabel = props.ariaLabel ?? props["aria-label"] ?? label;
  const ariaLabelProps = resolvedAriaLabel ? { ariaLabel: resolvedAriaLabel } : {};
  return (
    <AgentHubButton
      {...buttonProps}
      {...ariaLabelProps}
      className={joinClassNames("agenthub-icon-button", buttonProps.className)}
    >
      {children}
    </AgentHubButton>
  );
}

export function AgentHubTextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
): React.ReactElement {
  const { className, ...inputProps } = props;
  return <input {...inputProps} className={joinClassNames("agenthub-input", className)} />;
}

export function AgentHubSearchInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    readonly ariaLabel?: string;
    readonly clearLabel?: string;
    readonly onValueChange?: (value: string) => void;
  },
): React.ReactElement {
  const { ariaLabel, className, clearLabel = "Clear search", onChange, onValueChange, type, value, ...inputProps } = props;
  const currentValue = typeof value === "string" ? value : "";
  return (
    <span className={joinClassNames("agenthub-search-control", className)}>
      <input
        {...inputProps}
        aria-label={ariaLabel ?? props["aria-label"]}
        className="agenthub-input agenthub-search-input"
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.currentTarget.value);
        }}
        type={type ?? "search"}
        value={value}
      />
      {currentValue ? (
        <button
          aria-label={clearLabel}
          className="agenthub-search-clear"
          onClick={() => onValueChange?.("")}
          type="button"
        >
          x
        </button>
      ) : null}
    </span>
  );
}

export type AgentHubTextAreaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "style"
> & {
  readonly autoSize?: { readonly maxRows?: number; readonly minRows?: number } | boolean;
  readonly variant?: "borderless" | "outlined";
};

export const AgentHubTextArea = React.forwardRef<HTMLTextAreaElement, AgentHubTextAreaProps>(
  function AgentHubTextArea(props, ref): React.ReactElement {
    const { autoSize, className, rows, variant, ...textareaProps } = props;
    const minRows = typeof autoSize === "object" ? autoSize.minRows : undefined;
    const maxRows = typeof autoSize === "object" ? autoSize.maxRows : undefined;
    const style = {
      ...(minRows ? { minHeight: `${minRows * 22 + 18}px` } : {}),
      ...(maxRows ? { maxHeight: `${maxRows * 22 + 18}px` } : {}),
    };
    return (
      <textarea
        {...textareaProps}
        className={joinClassNames("agenthub-input", "agenthub-textarea", className)}
        data-variant={variant ?? "outlined"}
        ref={ref}
        rows={rows}
        style={style}
      />
    );
  },
);

export function AgentHubSelect<T extends string>(props: {
  readonly "aria-label"?: string;
  readonly ariaLabel?: string;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly onChange?: (value: T) => void;
  readonly onValueChange?: (value: T) => void;
  readonly options: readonly { readonly label: React.ReactNode; readonly value: T }[];
  readonly value: T;
}): React.ReactElement {
  return (
    <select
      aria-label={props.ariaLabel ?? props["aria-label"]}
      className={joinClassNames("agenthub-select", props.className)}
      disabled={props.disabled}
      onChange={(event) => {
        const value = event.currentTarget.value as T;
        props.onChange?.(value);
        props.onValueChange?.(value);
      }}
      value={props.value}
    >
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function AgentHubCheckbox(
  props: React.InputHTMLAttributes<HTMLInputElement>,
): React.ReactElement {
  const { className, type, ...checkboxProps } = props;
  return (
    <input
      {...checkboxProps}
      className={joinClassNames("agenthub-checkbox", className)}
      type={type ?? "checkbox"}
    />
  );
}

export function AgentHubSwitch(props: {
  readonly "aria-label"?: string;
  readonly "aria-labelledby"?: string;
  readonly ariaLabel?: string;
  readonly checked: boolean;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly onChange?: (checked: boolean) => void;
  readonly onCheckedChange?: (checked: boolean) => void;
}): React.ReactElement {
  const toggle = () => {
    const nextChecked = !props.checked;
    props.onChange?.(nextChecked);
    props.onCheckedChange?.(nextChecked);
  };
  return (
    <button
      aria-checked={props.checked}
      aria-label={props.ariaLabel ?? props["aria-label"]}
      aria-labelledby={props["aria-labelledby"]}
      className={joinClassNames("agenthub-switch", props.className)}
      data-state={props.checked ? "checked" : "unchecked"}
      disabled={props.disabled}
      onClick={toggle}
      role="switch"
      type="button"
    >
      <span aria-hidden="true" />
    </button>
  );
}

export function AgentHubFormItem(props: {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly label?: React.ReactNode;
}): React.ReactElement {
  return (
    <label className={joinClassNames("agenthub-form-field", props.className)}>
      {props.label ? <span>{props.label}</span> : null}
      {props.children}
    </label>
  );
}

export function AgentHubTooltip(props: {
  readonly children: React.ReactElement;
  readonly title?: React.ReactNode;
}): React.ReactElement {
  return React.cloneElement(props.children, {
    title: typeof props.title === "string" ? props.title : undefined,
  } as Partial<React.HTMLAttributes<HTMLElement>>);
}

export function AgentHubDropdown(props: {
  readonly children: React.ReactElement;
  readonly items: readonly { readonly key?: string; readonly label?: React.ReactNode }[];
  readonly onClick?: (event: { readonly key: string }) => void;
}): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const trigger = props.children as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  return (
    <span className="agenthub-dropdown" data-state={open ? "open" : "closed"}>
      {React.cloneElement(trigger, {
        "aria-expanded": open,
        onClick: (event: React.MouseEvent) => {
          trigger.props.onClick?.(event as React.MouseEvent<HTMLElement>);
          setOpen((current) => !current);
        },
      } as Partial<React.HTMLAttributes<HTMLElement>>)}
      {open ? (
        <span className="agenthub-dropdown-menu" role="menu">
          {props.items.map((item, index) => {
            const key = item.key ?? String(index);
            return (
              <button
                key={key}
                onClick={() => {
                  props.onClick?.({ key });
                  setOpen(false);
                }}
                role="menuitem"
                type="button"
              >
                {item.label ?? key}
              </button>
            );
          })}
        </span>
      ) : null}
    </span>
  );
}

const dialogFocusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function AgentHubModal(props: {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly cancelText?: React.ReactNode;
  readonly closeLabel?: string;
  readonly destroyOnHidden?: boolean;
  readonly getContainer?: false | HTMLElement | (() => HTMLElement);
  readonly okButtonProps?: {
    readonly className?: string;
    readonly disabled?: boolean;
    readonly type?: string;
  };
  readonly okText?: React.ReactNode;
  readonly onCancel?: () => void;
  readonly onOk?: () => void;
  readonly open?: boolean;
  readonly title?: React.ReactNode;
  readonly width?: number;
}): React.ReactElement | null {
  const titleId = React.useId();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const dialogRef = React.useRef<HTMLElement | null>(null);
  const returnFocusRef = React.useRef<HTMLElement | null>(null);
  const open = props.open === true;
  const onCancel = props.onCancel;

  React.useEffect(() => {
    if (!open) {
      return;
    }
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const parent = rootRef.current?.parentElement;
    const siblings = parent
      ? Array.from(parent.children).filter((child) => child !== rootRef.current)
      : [];
    const siblingState = siblings.map((sibling) => {
      const element = sibling as HTMLElement & { inert?: boolean };
      return {
        element,
        ariaHidden: element.getAttribute("aria-hidden"),
        inert: element.inert,
      };
    });
    for (const state of siblingState) {
      state.element.setAttribute("aria-hidden", "true");
      state.element.inert = true;
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      for (const state of siblingState) {
        if (state.ariaHidden === null) {
          state.element.removeAttribute("aria-hidden");
        } else {
          state.element.setAttribute("aria-hidden", state.ariaHidden);
        }
        state.element.inert = state.inert;
      }
      returnFocusRef.current?.focus();
    };
  }, [onCancel, open]);

  const trapFocus = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") {
      return;
    }
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(dialogFocusableSelector) ?? [],
    ).filter((element) => element.offsetParent !== null || element === document.activeElement);
    if (focusable.length === 0) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open && props.destroyOnHidden !== false) {
    return null;
  }
  return (
    <div
      aria-hidden={open ? undefined : "true"}
      className={joinClassNames("agenthub-dialog-root", props.className)}
      data-state={open ? "open" : "closed"}
      ref={rootRef}
    >
      <div className="agenthub-dialog-overlay" onClick={onCancel} />
      <section
        aria-labelledby={props.title ? titleId : undefined}
        aria-modal="true"
        className="agenthub-dialog"
        onKeyDown={trapFocus}
        ref={dialogRef}
        role="dialog"
        style={props.width ? { width: props.width } : undefined}
        tabIndex={-1}
      >
        <header className="agenthub-dialog-header">
          {props.title ? <h2 id={titleId}>{props.title}</h2> : null}
          <button
            aria-label={props.closeLabel ?? "Close"}
            className="agenthub-dialog-close"
            onClick={onCancel}
            type="button"
          >
            x
          </button>
        </header>
        <div className="agenthub-dialog-body">{props.children}</div>
        <footer className="agenthub-dialog-footer">
          <AgentHubButton htmlType="button" kind="default" onClick={onCancel}>
            {props.cancelText ?? "Cancel"}
          </AgentHubButton>
          <AgentHubButton
            className={props.okButtonProps?.className}
            disabled={props.okButtonProps?.disabled}
            htmlType="button"
            kind="primary"
            onClick={props.onOk}
          >
            {props.okText ?? "OK"}
          </AgentHubButton>
        </footer>
      </section>
    </div>
  );
}

export function AgentHubTabs(props: {
  readonly items?: readonly { readonly children?: React.ReactNode; readonly key: string; readonly label: React.ReactNode }[];
  readonly activeKey?: string;
  readonly onChange?: (key: string) => void;
}): React.ReactElement {
  const activeKey = props.activeKey ?? props.items?.[0]?.key;
  const changeByOffset = (currentKey: string | undefined, offset: number) => {
    const items = props.items ?? [];
    if (items.length === 0) {
      return;
    }
    const currentIndex = Math.max(
      0,
      items.findIndex((item) => item.key === currentKey),
    );
    const nextIndex = (currentIndex + offset + items.length) % items.length;
    const nextKey = items[nextIndex]?.key;
    if (nextKey) {
      props.onChange?.(nextKey);
    }
  };
  return (
    <div className="agenthub-tabs">
      <div role="tablist">
        {props.items?.map((item) => (
          <button
            aria-selected={item.key === activeKey}
            data-state={item.key === activeKey ? "active" : "inactive"}
            key={item.key}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                changeByOffset(item.key, 1);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                changeByOffset(item.key, -1);
              }
            }}
            onClick={() => props.onChange?.(item.key)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      {props.items?.map((item) =>
        item.key === activeKey ? (
          <div key={item.key} role="tabpanel">
            {item.children}
          </div>
        ) : null,
      )}
    </div>
  );
}

export function AgentHubBadge(props: {
  readonly className?: string;
  readonly count?: React.ReactNode;
  readonly size?: AgentHubControlSize;
  readonly status?: "success" | "warning" | "error" | "default";
  readonly text?: React.ReactNode;
}): React.ReactElement {
  const tone =
    props.status === "success"
      ? "success"
      : props.status === "warning"
        ? "warning"
        : props.status === "error"
          ? "danger"
          : "neutral";
  return (
    <span className={joinClassNames("agenthub-badge", props.className)} data-size={mapSize(props.size)} data-tone={tone}>
      {props.count ?? props.text}
    </span>
  );
}

export function AgentHubAvatar(props: {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly icon?: React.ReactNode;
  readonly shape?: "circle" | "square";
  readonly size?: number | AgentHubControlSize;
}): React.ReactElement {
  const numericSize = typeof props.size === "number" ? props.size : undefined;
  const style = numericSize ? { height: numericSize, width: numericSize } : undefined;
  return (
    <span
      className={joinClassNames("agenthub-avatar", props.className)}
      data-shape={props.shape ?? "circle"}
      data-size={typeof props.size === "string" ? mapSize(props.size) : undefined}
      style={style}
    >
      {props.icon ?? props.children}
    </span>
  );
}

export function AgentHubEmptyState(props: {
  readonly description: React.ReactNode;
}): React.ReactElement {
  return <p className="agenthub-empty-state">{props.description}</p>;
}

export function AgentHubLoadingState(props: {
  readonly active?: boolean;
  readonly label?: string;
  readonly rows?: number;
  readonly size?: AgentHubControlSize;
}): React.ReactElement {
  const label = props.label ?? "Loading";
  if (props.active === false) {
    return (
      <span className="agenthub-loading-spinner" data-size={mapSize(props.size)} role="status">
        {label}
      </span>
    );
  }
  return (
    <span aria-label={label} className="agenthub-loading-skeleton" data-rows={props.rows ?? 3} role="status">
      {Array.from({ length: props.rows ?? 3 }, (_, index) => (
        <span key={index} />
      ))}
    </span>
  );
}

export const agentHubMessage: {
  readonly error: (content: React.ReactNode) => void;
  readonly info: (content: React.ReactNode) => void;
  readonly success: (content: React.ReactNode) => void;
  readonly warning: (content: React.ReactNode) => void;
} = {
  error: (content) => dispatchAgentHubFeedback("error", content),
  info: (content) => dispatchAgentHubFeedback("info", content),
  success: (content) => dispatchAgentHubFeedback("success", content),
  warning: (content) => dispatchAgentHubFeedback("warning", content),
};

function dispatchAgentHubFeedback(tone: "error" | "info" | "success" | "warning", content: React.ReactNode): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent("agenthub:feedback", {
      detail: {
        content,
        tone,
      },
    }),
  );
}

export {
  AgentHubAvatar as Avatar,
  AgentHubBadge as Badge,
  AgentHubButton as Button,
  AgentHubCheckbox as Checkbox,
  AgentHubDropdown as DropdownMenu,
  AgentHubEmptyState as EmptyState,
  AgentHubFormItem as FormField,
  AgentHubIconButton as IconButton,
  AgentHubLoadingState as LoadingState,
  AgentHubModal as Dialog,
  AgentHubSearchInput as SearchInput,
  AgentHubSelect as Select,
  AgentHubSwitch as Switch,
  AgentHubTabs as Tabs,
  AgentHubTextArea as TextArea,
  AgentHubTextInput as TextInput,
  AgentHubThemeProvider as ThemeRoot,
  AgentHubTooltip as Tooltip,
  agentHubMessage as Toast,
};
