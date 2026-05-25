import React from "react";
import { createPortal } from "react-dom";
import { componentSystemCss } from "../styles.js";

export type AgentHubThemeMode = "dark" | "light";
export type AgentHubControlSize = "small" | "middle" | "large";
export type AgentHubComponentSize = "sm" | "md" | "lg";
export type AgentHubDensity = "compact" | "comfortable";
export type AgentHubTone = "neutral" | "accent" | "danger" | "warning" | "success" | "muted";
export type AgentHubVariant = "solid" | "outline" | "ghost" | "subtle";

const dialogFocusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const AgentHubThemeContext = React.createContext<{
  readonly density: AgentHubDensity;
  readonly mode: AgentHubThemeMode;
  readonly style: React.CSSProperties;
} | null>(null);

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

function callRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref && "current" in ref) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}

function isDevelopmentRuntime(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
}

function mergeDescribedBy(...ids: readonly (string | false | null | undefined)[]): string | undefined {
  const merged = ids.filter(Boolean).join(" ").trim();
  return merged || undefined;
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

function useAgentHubThemeContext(): {
  readonly density: AgentHubDensity;
  readonly mode: AgentHubThemeMode;
  readonly style: React.CSSProperties;
} {
  return (
    React.useContext(AgentHubThemeContext) ?? {
      density: "compact",
      mode: "light",
      style: createAgentHubCssVariables("light"),
    }
  );
}

export function AgentHubThemeProvider(props: {
  readonly children: React.ReactNode;
  readonly density?: AgentHubDensity;
  readonly mode: AgentHubThemeMode;
  readonly className?: string;
}): React.ReactElement {
  const density = props.density ?? "compact";
  const style = createAgentHubCssVariables(props.mode);
  return (
    <AgentHubThemeContext.Provider value={{ density, mode: props.mode, style }}>
      <div
        className={joinClassNames("agenthub-theme-root", props.className)}
        data-density={density}
        data-theme={props.mode}
        style={style}
      >
        <style>{componentSystemCss}</style>
        {props.children}
      </div>
    </AgentHubThemeContext.Provider>
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
  const tone =
    explicitTone ?? (kind === "danger" ? "danger" : kind === "primary" ? "accent" : "neutral");
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
  if (isDevelopmentRuntime() && !resolvedAriaLabel) {
    console.warn("AgentHub IconButton requires ariaLabel or aria-label.");
  }
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
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    readonly ariaLabel?: string;
    readonly density?: AgentHubDensity;
    readonly inputRef?: React.Ref<HTMLInputElement>;
    readonly invalid?: boolean;
    readonly size?: AgentHubControlSize | AgentHubComponentSize;
  },
): React.ReactElement {
  const { ariaLabel, className, density, inputRef, invalid, size, ...inputProps } = props;
  return (
    <input
      {...inputProps}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      aria-label={ariaLabel ?? props["aria-label"]}
      className={joinClassNames("agenthub-input", className)}
      data-density={density}
      data-invalid={invalid ? "true" : undefined}
      data-size={mapSize(size)}
      ref={inputRef}
    />
  );
}

export function AgentHubSearchInput(
  props: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> & {
    readonly ariaLabel?: string;
    readonly clearLabel?: string;
    readonly density?: AgentHubDensity;
    readonly onChange?: React.ChangeEventHandler<HTMLInputElement>;
    readonly onValueChange?: (value: string) => void;
    readonly size?: AgentHubControlSize | AgentHubComponentSize;
  },
): React.ReactElement {
  const {
    ariaLabel,
    className,
    clearLabel = "Clear search",
    defaultValue,
    density,
    disabled,
    onChange,
    onValueChange,
    size,
    type,
    value,
    ...inputProps
  } = props;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const controlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    typeof defaultValue === "string" ? defaultValue : "",
  );
  const currentValue = controlled ? String(value ?? "") : uncontrolledValue;
  const updateValue = (nextValue: string) => {
    if (!controlled) {
      setUncontrolledValue(nextValue);
      if (inputRef.current) {
        inputRef.current.value = nextValue;
      }
    }
    onValueChange?.(nextValue);
  };
  return (
    <span
      className={joinClassNames("agenthub-search-control", className)}
      data-density={density}
      data-size={mapSize(size)}
    >
      <input
        {...inputProps}
        aria-label={ariaLabel ?? props["aria-label"]}
        className="agenthub-input agenthub-search-input"
        defaultValue={controlled ? undefined : defaultValue}
        disabled={disabled}
        onChange={(event) => {
          if (!controlled) {
            setUncontrolledValue(event.currentTarget.value);
          }
          onChange?.(event);
          onValueChange?.(event.currentTarget.value);
        }}
        ref={inputRef}
        type={type ?? "search"}
        value={controlled ? currentValue : undefined}
      />
      {currentValue && !disabled ? (
        <button
          aria-label={clearLabel}
          className="agenthub-search-clear"
          onClick={() => {
            updateValue("");
            inputRef.current?.focus();
          }}
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
  readonly ariaLabel?: string;
  readonly autoSize?: { readonly maxRows?: number; readonly minRows?: number } | boolean;
  readonly density?: AgentHubDensity;
  readonly invalid?: boolean;
  readonly maxRows?: number;
  readonly minRows?: number;
  readonly onSubmitShortcut?: () => void;
  readonly size?: AgentHubControlSize | AgentHubComponentSize;
  readonly variant?: "borderless" | "outlined";
};

export const AgentHubTextArea = React.forwardRef<HTMLTextAreaElement, AgentHubTextAreaProps>(
  function AgentHubTextArea(props, ref): React.ReactElement {
    const {
      ariaLabel,
      autoSize,
      className,
      density,
      invalid,
      maxRows: maxRowsProp,
      minRows: minRowsProp,
      onKeyDown,
      onSubmitShortcut,
      rows,
      size,
      variant,
      ...textareaProps
    } = props;
    const minRows = minRowsProp ?? (typeof autoSize === "object" ? autoSize.minRows : undefined);
    const maxRows = maxRowsProp ?? (typeof autoSize === "object" ? autoSize.maxRows : undefined);
    const style = {
      ...(minRows ? { minHeight: `${minRows * 22 + 18}px` } : {}),
      ...(maxRows ? { maxHeight: `${maxRows * 22 + 18}px` } : {}),
    };
    return (
      <textarea
        {...textareaProps}
        aria-invalid={invalid || props["aria-invalid"] || undefined}
        aria-label={ariaLabel ?? props["aria-label"]}
        className={joinClassNames("agenthub-input", "agenthub-textarea", className)}
        data-density={density}
        data-invalid={invalid ? "true" : undefined}
        data-size={mapSize(size)}
        data-variant={variant ?? "outlined"}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            onSubmitShortcut?.();
          }
          onKeyDown?.(event);
        }}
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
  readonly density?: AgentHubDensity;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly onChange?: (value: T) => void;
  readonly onValueChange?: (value: T) => void;
  readonly options: readonly { readonly label: React.ReactNode; readonly value: T }[];
  readonly placeholder?: React.ReactNode;
  readonly size?: AgentHubControlSize | AgentHubComponentSize;
  readonly value: T;
}): React.ReactElement {
  return (
    <select
      aria-invalid={props.invalid || undefined}
      aria-label={props.ariaLabel ?? props["aria-label"]}
      className={joinClassNames("agenthub-select", props.className)}
      data-density={props.density}
      data-invalid={props.invalid ? "true" : undefined}
      data-size={mapSize(props.size)}
      disabled={props.disabled}
      onChange={(event) => {
        const value = event.currentTarget.value as T;
        props.onChange?.(value);
        props.onValueChange?.(value);
      }}
      value={props.value}
    >
      {props.placeholder ? (
        <option disabled value="">
          {props.placeholder}
        </option>
      ) : null}
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function AgentHubCheckbox(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    readonly invalid?: boolean;
    readonly onCheckedChange?: (checked: boolean) => void;
  },
): React.ReactElement {
  const { className, invalid, onChange, onCheckedChange, type, ...checkboxProps } = props;
  return (
    <input
      {...checkboxProps}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={joinClassNames("agenthub-checkbox", className)}
      data-invalid={invalid ? "true" : undefined}
      onChange={(event) => {
        onChange?.(event);
        onCheckedChange?.(event.currentTarget.checked);
      }}
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
  readonly label?: React.ReactNode;
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
      onClick={() => {
        if (!props.disabled) {
          toggle();
        }
      }}
      role="switch"
      type="button"
    >
      <span aria-hidden="true" />
      {props.label ? <span className="agenthub-switch-label">{props.label}</span> : null}
    </button>
  );
}

export function AgentHubFormItem(props: {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly error?: React.ReactNode;
  readonly hint?: React.ReactNode;
  readonly htmlFor?: string;
  readonly label?: React.ReactNode;
  readonly required?: boolean;
}): React.ReactElement {
  const errorId = React.useId();
  const hintId = React.useId();
  const describedBy = mergeDescribedBy(props.hint ? hintId : undefined, props.error ? errorId : undefined);
  const child =
    React.isValidElement<React.HTMLAttributes<HTMLElement>>(props.children) && describedBy
      ? React.cloneElement(props.children, {
          "aria-describedby": mergeDescribedBy(
            props.children.props["aria-describedby"],
            describedBy,
          ),
        })
      : props.children;
  return (
    <label className={joinClassNames("agenthub-form-field", props.className)} htmlFor={props.htmlFor}>
      {props.label ? (
        <span>
          {props.label}
          {props.required ? " *" : ""}
        </span>
      ) : null}
      {child}
      {props.hint ? <small id={hintId}>{props.hint}</small> : null}
      {props.error ? (
        <small className="agenthub-form-error" id={errorId}>
          {props.error}
        </small>
      ) : null}
    </label>
  );
}

export function AgentHubTooltip(props: {
  readonly children: React.ReactElement;
  readonly content?: React.ReactNode;
  readonly delay?: number;
  readonly disabled?: boolean;
  readonly side?: "top" | "right" | "bottom" | "left";
  readonly title?: React.ReactNode;
}): React.ReactElement {
  const tooltipId = React.useId();
  const content = props.content ?? props.title;
  if (props.disabled || !content) {
    return props.children;
  }
  const childProps = props.children.props as React.HTMLAttributes<HTMLElement>;
  return (
    <span
      className="agenthub-tooltip"
      data-side={props.side ?? "top"}
      style={{ "--agenthub-tooltip-delay": `${props.delay ?? 400}ms` } as React.CSSProperties}
    >
      {React.cloneElement(props.children, {
        "aria-describedby": mergeDescribedBy(childProps["aria-describedby"], tooltipId),
      } as Partial<React.HTMLAttributes<HTMLElement>>)}
      <span className="agenthub-tooltip-content" id={tooltipId} role="tooltip">
        {content}
      </span>
    </span>
  );
}

export type DropdownMenuItem = {
  readonly disabled?: boolean | undefined;
  readonly id?: string;
  readonly key?: string;
  readonly label: React.ReactNode;
  readonly onSelect?: () => void;
  readonly tone?: Extract<AgentHubTone, "neutral" | "danger" | "warning">;
};

export function DropdownMenu(props: {
  readonly align?: "start" | "center" | "end";
  readonly defaultOpen?: boolean;
  readonly items: readonly DropdownMenuItem[];
  readonly onOpenChange?: (open: boolean) => void;
  readonly onSelect?: (id: string) => void;
  readonly open?: boolean;
  readonly trigger: React.ReactElement;
}): React.ReactElement {
  const controlled = props.open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(props.defaultOpen ?? false);
  const open = controlled ? props.open === true : uncontrolledOpen;
  const trigger = props.trigger as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const menuRef = React.useRef<HTMLSpanElement | null>(null);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const wasOpenRef = React.useRef(open);
  const enabledIndexes = props.items
    .map((item, index) => (item.disabled ? -1 : index))
    .filter((index) => index >= 0);
  const setOpen = (nextOpen: boolean) => {
    if (!controlled) {
      setUncontrolledOpen(nextOpen);
    }
    props.onOpenChange?.(nextOpen);
  };
  const focusItem = (index: number) => itemRefs.current[index]?.focus();

  React.useEffect(() => {
    if (!open || typeof window === "undefined") {
      return;
    }
    const firstEnabled = enabledIndexes[0];
    if (firstEnabled !== undefined) {
      focusItem(firstEnabled);
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [enabledIndexes, open]);

  React.useEffect(() => {
    if (wasOpenRef.current && !open) {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  const moveFocus = (currentIndex: number, offset: number) => {
    if (enabledIndexes.length === 0) {
      return;
    }
    const enabledPosition = Math.max(0, enabledIndexes.indexOf(currentIndex));
    const nextEnabledPosition = (enabledPosition + offset + enabledIndexes.length) % enabledIndexes.length;
    const nextIndex = enabledIndexes[nextEnabledPosition];
    if (nextIndex !== undefined) {
      focusItem(nextIndex);
    }
  };

  return (
    <span className="agenthub-dropdown" data-state={open ? "open" : "closed"}>
      {React.cloneElement(trigger, {
        "aria-expanded": open,
        "aria-haspopup": "menu",
        onClick: (event: React.MouseEvent) => {
          trigger.props.onClick?.(event as React.MouseEvent<HTMLElement>);
          setOpen(!open);
        },
        onKeyDown: (event: React.KeyboardEvent) => {
          trigger.props.onKeyDown?.(event as React.KeyboardEvent<HTMLElement>);
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        },
        ref: (node: HTMLElement | null) => {
          triggerRef.current = node;
          callRef((trigger as { readonly ref?: React.Ref<HTMLElement> }).ref, node);
        },
      } as Partial<React.HTMLAttributes<HTMLElement>>)}
      {open ? (
        <span
          className="agenthub-dropdown-menu"
          data-align={props.align ?? "start"}
          onKeyDown={(event) => {
            const activeIndex = itemRefs.current.findIndex((item) => item === document.activeElement);
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              moveFocus(activeIndex, 1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              moveFocus(activeIndex, -1);
            } else if (event.key === "Home") {
              event.preventDefault();
              const firstEnabled = enabledIndexes[0];
              if (firstEnabled !== undefined) {
                focusItem(firstEnabled);
              }
            } else if (event.key === "End") {
              event.preventDefault();
              const lastEnabled = enabledIndexes[enabledIndexes.length - 1];
              if (lastEnabled !== undefined) {
                focusItem(lastEnabled);
              }
            }
          }}
          ref={menuRef}
          role="menu"
        >
          {props.items.map((item, index) => {
            const key = item.id ?? item.key ?? String(index);
            return (
              <button
                data-disabled={item.disabled ? "true" : undefined}
                data-tone={item.tone ?? "neutral"}
                disabled={item.disabled}
                key={key}
                onClick={() => {
                  item.onSelect?.();
                  props.onSelect?.(key);
                  setOpen(false);
                }}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                role="menuitem"
                tabIndex={index === enabledIndexes[0] ? 0 : -1}
                type="button"
              >
                {item.label}
              </button>
            );
          })}
        </span>
      ) : null}
    </span>
  );
}

export function AgentHubDropdown(props: {
  readonly children: React.ReactElement;
  readonly items: readonly { readonly disabled?: boolean; readonly key?: string; readonly label?: React.ReactNode }[];
  readonly onClick?: (event: { readonly key: string }) => void;
}): React.ReactElement {
  return (
    <DropdownMenu
      items={props.items.map((item, index) => ({
        disabled: item.disabled,
        id: item.key ?? String(index),
        label: item.label ?? item.key ?? String(index),
      }))}
      onSelect={(key) => props.onClick?.({ key })}
      trigger={props.children}
    />
  );
}

export function Dialog(props: {
  readonly cancelLabel?: React.ReactNode;
  readonly children: React.ReactNode;
  readonly className?: string | undefined;
  readonly closeLabel?: string | undefined;
  readonly closeOnEscape?: boolean | undefined;
  readonly closeOnOverlayClick?: boolean | undefined;
  readonly confirmClassName?: string | undefined;
  readonly confirmDisabled?: boolean | undefined;
  readonly confirmLabel?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly destroyOnHidden?: boolean | undefined;
  readonly footer?: React.ReactNode;
  readonly footerClassName?: string | undefined;
  readonly initialFocusRef?: React.RefObject<HTMLElement | null> | undefined;
  readonly onConfirm?: (() => void) | undefined;
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  readonly open?: boolean | undefined;
  readonly title?: React.ReactNode;
  readonly width?: number | string | undefined;
}): React.ReactElement | null {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const dialogRef = React.useRef<HTMLElement | null>(null);
  const returnFocusRef = React.useRef<HTMLElement | null>(null);
  const open = props.open === true;
  const theme = useAgentHubThemeContext();
  const [portalElement, setPortalElement] = React.useState<HTMLDivElement | null>(null);
  const close = React.useCallback(() => props.onOpenChange?.(false), [props.onOpenChange]);

  React.useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }
    const element = document.createElement("div");
    element.className = "agenthub-dialog-portal";
    document.body.appendChild(element);
    setPortalElement(element);
    return () => {
      setPortalElement(null);
      element.remove();
    };
  }, [open]);

  React.useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }
    if (!portalElement) {
      return;
    }
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTarget =
      props.initialFocusRef?.current ??
      dialogRef.current?.querySelector<HTMLElement>(dialogFocusableSelector) ??
      dialogRef.current;
    focusTarget?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && props.closeOnEscape !== false) {
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const portalRoot = portalElement ?? rootRef.current;
    const siblings = portalRoot
      ? Array.from(document.body.children).filter((child) => child !== portalRoot)
      : [];
    const siblingState = siblings.map((sibling) => {
      const element = sibling as HTMLElement & { inert?: boolean };
      return {
        ariaHidden: element.getAttribute("aria-hidden"),
        element,
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
  }, [close, open, portalElement, props.closeOnEscape, props.initialFocusRef]);

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

  const footer =
    props.footer !== undefined ? (
      props.footer
    ) : props.confirmLabel !== undefined || props.onConfirm !== undefined || props.cancelLabel !== undefined ? (
      <>
        <AgentHubButton htmlType="button" kind="default" onClick={close}>
          {props.cancelLabel ?? "Cancel"}
        </AgentHubButton>
        <AgentHubButton
          className={props.confirmClassName}
          disabled={props.confirmDisabled}
          htmlType="button"
          kind="primary"
          onClick={props.onConfirm}
        >
          {props.confirmLabel ?? "OK"}
        </AgentHubButton>
      </>
    ) : null;
  const dialogMarkup = (
    <div
      aria-hidden={open ? undefined : "true"}
      className={joinClassNames("agenthub-dialog-root", props.className, "agenthub-theme-root")}
      data-density={theme.density}
      data-state={open ? "open" : "closed"}
      data-theme={theme.mode}
      ref={rootRef}
      style={theme.style}
    >
      <div
        className="agenthub-dialog-overlay"
        onClick={() => {
          if (props.closeOnOverlayClick !== false) {
            close();
          }
        }}
      />
      <section
        aria-describedby={props.description ? descriptionId : undefined}
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
            onClick={close}
            type="button"
          >
            x
          </button>
        </header>
        {props.description ? (
          <p className="agenthub-dialog-description" id={descriptionId}>
            {props.description}
          </p>
        ) : null}
        <div className="agenthub-dialog-body">{props.children}</div>
        {footer ? (
          <footer className={joinClassNames("agenthub-dialog-footer", props.footerClassName)}>
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );

  if (typeof document === "undefined" || !portalElement) {
    return dialogMarkup;
  }
  return createPortal(dialogMarkup, portalElement);
}

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
  return (
    <Dialog
      cancelLabel={props.cancelText}
      className={props.className}
      closeLabel={props.closeLabel}
      confirmClassName={props.okButtonProps?.className}
      confirmDisabled={props.okButtonProps?.disabled}
      confirmLabel={props.okText}
      destroyOnHidden={props.destroyOnHidden}
      footerClassName="agenthub-dialog-footer"
      onConfirm={props.onOk}
      onOpenChange={(open) => {
        if (!open) {
          props.onCancel?.();
        }
      }}
      open={props.open === true}
      title={props.title}
      width={props.width}
    >
      {props.children}
    </Dialog>
  );
}

export function AgentHubTabs(props: {
  readonly activeKey?: string;
  readonly items?: readonly {
    readonly children?: React.ReactNode;
    readonly key: string;
    readonly label: React.ReactNode;
    readonly value?: string;
  }[];
  readonly onChange?: (key: string) => void;
  readonly onValueChange?: (value: string) => void;
  readonly value?: string;
}): React.ReactElement {
  const items = props.items ?? [];
  const activeKey = props.value ?? props.activeKey ?? items[0]?.value ?? items[0]?.key;
  const idPrefix = React.useId();
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const selectKey = (key: string) => {
    props.onChange?.(key);
    props.onValueChange?.(key);
  };
  const changeByOffset = (currentKey: string | undefined, offset: number) => {
    if (items.length === 0) {
      return;
    }
    const currentIndex = Math.max(
      0,
      items.findIndex((item) => (item.value ?? item.key) === currentKey),
    );
    const nextIndex = (currentIndex + offset + items.length) % items.length;
    const nextKey = items[nextIndex]?.value ?? items[nextIndex]?.key;
    if (nextKey) {
      tabRefs.current[nextIndex]?.focus();
      selectKey(nextKey);
    }
  };
  return (
    <div className="agenthub-tabs">
      <div role="tablist">
        {items.map((item, index) => {
          const itemValue = item.value ?? item.key;
          const selected = itemValue === activeKey;
          const tabId = `${idPrefix}-agenthub-tab-${itemValue}`;
          const panelId = `${idPrefix}-agenthub-tabpanel-${itemValue}`;
          return (
            <button
              aria-controls={panelId}
              aria-selected={selected}
              data-state={selected ? "active" : "inactive"}
              id={tabId}
              key={itemValue}
              onClick={() => selectKey(itemValue)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  changeByOffset(itemValue, 1);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  changeByOffset(itemValue, -1);
                } else if (event.key === "Home") {
                  event.preventDefault();
                  const firstValue = items[0]?.value ?? items[0]?.key;
                  if (firstValue) {
                    tabRefs.current[0]?.focus();
                    selectKey(firstValue);
                  }
                } else if (event.key === "End") {
                  event.preventDefault();
                  const lastIndex = items.length - 1;
                  const lastValue = items[lastIndex]?.value ?? items[lastIndex]?.key;
                  if (lastValue) {
                    tabRefs.current[lastIndex]?.focus();
                    selectKey(lastValue);
                  }
                }
              }}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => {
        const itemValue = item.value ?? item.key;
        return itemValue === activeKey ? (
          <div
            aria-labelledby={`${idPrefix}-agenthub-tab-${itemValue}`}
            id={`${idPrefix}-agenthub-tabpanel-${itemValue}`}
            key={itemValue}
            role="tabpanel"
          >
            {item.children}
          </div>
        ) : null;
      })}
    </div>
  );
}

export function AgentHubBadge(props: {
  readonly className?: string;
  readonly count?: React.ReactNode;
  readonly size?: AgentHubControlSize | AgentHubComponentSize;
  readonly status?: "success" | "warning" | "error" | "default";
  readonly text?: React.ReactNode;
  readonly title?: string;
  readonly tone?: AgentHubTone;
}): React.ReactElement {
  const tone =
    props.tone ??
    (props.status === "success"
      ? "success"
      : props.status === "warning"
        ? "warning"
        : props.status === "error"
          ? "danger"
          : "neutral");
  return (
    <span
      className={joinClassNames("agenthub-badge", props.className)}
      data-size={mapSize(props.size)}
      data-tone={tone}
      title={props.title}
    >
      {props.count ?? props.text}
    </span>
  );
}

export function AgentHubAvatar(props: {
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly icon?: React.ReactNode;
  readonly shape?: "circle" | "square";
  readonly size?: number | AgentHubControlSize | AgentHubComponentSize;
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
  readonly density?: AgentHubDensity;
  readonly label?: string;
  readonly rows?: number;
  readonly size?: AgentHubControlSize | AgentHubComponentSize;
  readonly tone?: AgentHubTone;
  readonly variant?: "skeleton" | "spinner";
}): React.ReactElement {
  const label = props.label ?? "Loading";
  const variant = props.variant ?? (props.active === false ? "spinner" : "skeleton");
  if (variant === "spinner") {
    return (
      <span
        aria-label={label}
        aria-live="polite"
        className="agenthub-loading-spinner"
        data-density={props.density}
        data-size={mapSize(props.size)}
        data-tone={props.tone ?? "neutral"}
        role="status"
      >
        {label}
      </span>
    );
  }
  return (
    <span
      aria-label={label}
      aria-live="polite"
      className="agenthub-loading-skeleton"
      data-density={props.density}
      data-rows={props.rows ?? 3}
      data-size={mapSize(props.size)}
      data-tone={props.tone ?? "neutral"}
      role="status"
    >
      {Array.from({ length: props.rows ?? 3 }, (_, index) => (
        <span key={index} />
      ))}
    </span>
  );
}

type AgentHubToastTone = "error" | "info" | "success" | "warning";
type AgentHubToastItem = {
  readonly content: React.ReactNode;
  readonly duration?: number | undefined;
  readonly id: string;
  readonly tone: AgentHubToastTone;
};

export function Toast(props: {
  readonly content?: React.ReactNode;
  readonly dismissLabel?: string;
  readonly duration?: number;
  readonly items?: readonly AgentHubToastItem[];
  readonly onDismiss?: (id: string) => void;
  readonly tone?: AgentHubToastTone;
}): React.ReactElement {
  const dismissLabel = props.dismissLabel ?? "Dismiss";
  const [eventItems, setEventItems] = React.useState<readonly AgentHubToastItem[]>([]);
  const [dismissedIds, setDismissedIds] = React.useState<ReadonlySet<string>>(() => new Set());
  const allItems =
    props.items ??
    (props.content
      ? [{ content: props.content, duration: props.duration, id: "static", tone: props.tone ?? "info" }]
      : eventItems);
  const renderedItems = allItems.filter((item) => !dismissedIds.has(item.id));

  const dismiss = React.useCallback(
    (id: string) => {
      setDismissedIds((current) => new Set(current).add(id));
      setEventItems((current) => current.filter((candidate) => candidate.id !== id));
      props.onDismiss?.(id);
    },
    [props.onDismiss],
  );

  React.useEffect(() => {
    if (props.items || props.content || typeof window === "undefined") {
      return;
    }
    const onFeedback = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          readonly content: React.ReactNode;
          readonly duration?: number;
          readonly tone: AgentHubToastTone;
        }>
      ).detail;
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setEventItems((current) => [
        ...current,
        { content: detail.content, duration: detail.duration, id, tone: detail.tone },
      ]);
    };
    window.addEventListener("agenthub:feedback", onFeedback);
    return () => window.removeEventListener("agenthub:feedback", onFeedback);
  }, [props.content, props.items]);

  React.useEffect(() => {
    setDismissedIds(new Set());
  }, [props.content, props.items]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const timers = renderedItems
      .filter((item) => (item.duration ?? 4000) > 0)
      .map((item) =>
        window.setTimeout(() => {
          dismiss(item.id);
        }, item.duration ?? 4000),
      );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [dismiss, renderedItems]);

  return (
    <div aria-live="polite" className="agenthub-toast-region" role="status">
      {renderedItems.map((item) => (
        <div className="agenthub-toast" data-tone={item.tone} key={item.id}>
          <span>{item.content}</span>
          <button
            aria-label={dismissLabel}
            onClick={() => dismiss(item.id)}
            type="button"
          >
            x
          </button>
        </div>
      ))}
    </div>
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

function dispatchAgentHubFeedback(tone: AgentHubToastTone, content: React.ReactNode): void {
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
  AgentHubEmptyState as EmptyState,
  AgentHubFormItem as FormField,
  AgentHubIconButton as IconButton,
  AgentHubLoadingState as LoadingState,
  AgentHubSearchInput as SearchInput,
  AgentHubSelect as Select,
  AgentHubSwitch as Switch,
  AgentHubTabs as Tabs,
  AgentHubTextArea as TextArea,
  AgentHubTextInput as TextInput,
  AgentHubThemeProvider as ThemeRoot,
  AgentHubTooltip as Tooltip,
};
