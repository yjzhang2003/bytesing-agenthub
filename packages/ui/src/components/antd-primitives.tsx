import {
  Avatar as AntAvatar,
  Badge as AntBadge,
  Button as AntButton,
  Checkbox as AntCheckbox,
  ConfigProvider,
  Dropdown as AntDropdown,
  Empty as AntEmpty,
  Form,
  Input,
  Modal as AntModal,
  Select as AntSelect,
  Skeleton,
  Spin,
  Switch as AntSwitch,
  Tabs as AntTabs,
  Tooltip as AntTooltip,
  message,
  theme as antTheme,
  type ThemeConfig,
} from "antd";
import type { ButtonProps, InputProps, MenuProps } from "antd";
import type { SizeType } from "antd/es/config-provider/SizeContext.js";
import type { TextAreaProps, TextAreaRef } from "antd/es/input/TextArea.js";
import React from "react";

export type AgentHubThemeMode = "dark" | "light";

export function createAgentHubAntdTheme(mode: AgentHubThemeMode): ThemeConfig {
  const dark = mode === "dark";
  return {
    algorithm: dark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      borderRadius: 6,
      borderRadiusLG: 8,
      borderRadiusSM: 4,
      colorBgBase: dark ? "#0f1110" : "#f6f7f4",
      colorBgContainer: dark ? "#151714" : "#ffffff",
      colorBgElevated: dark ? "#1d201c" : "#ffffff",
      colorBorder: dark ? "#30342f" : "#d8ddd3",
      colorError: "#ef4444",
      colorInfo: "#60a5fa",
      colorPrimary: "#62d98b",
      colorSuccess: "#62d98b",
      colorText: dark ? "#f3f5ef" : "#171a16",
      colorTextDisabled: dark ? "#686e65" : "#a0a89a",
      colorTextSecondary: dark ? "#a8afa3" : "#626b5f",
      colorWarning: "#f59e0b",
      controlHeight: 34,
      controlHeightLG: 38,
      controlHeightSM: 28,
      fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: 13,
      lineWidth: 1,
      motionDurationFast: "0.12s",
      motionDurationMid: "0.18s",
      wireframe: false,
    },
    components: {
      Button: {
        borderRadius: 6,
        controlHeight: 32,
        paddingInline: 10,
      },
      Form: {
        itemMarginBottom: 14,
        labelColor: dark ? "#a8afa3" : "#626b5f",
        verticalLabelPadding: "0 0 6px",
      },
      Input: {
        activeBorderColor: "#62d98b",
        hoverBorderColor: dark ? "#454c43" : "#c7d0c0",
      },
      Select: {
        activeBorderColor: "#62d98b",
        optionSelectedBg: dark ? "#273128" : "#e7f7e8",
      },
      Tabs: {
        itemSelectedColor: dark ? "#f3f5ef" : "#171a16",
      },
    },
  };
}

export function AgentHubThemeProvider(props: {
  readonly children: React.ReactNode;
  readonly mode: AgentHubThemeMode;
}): React.ReactElement {
  return (
    <ConfigProvider componentSize="middle" theme={createAgentHubAntdTheme(props.mode)}>
      {props.children}
    </ConfigProvider>
  );
}

export function AgentHubButton(
  props: Omit<ButtonProps, "danger" | "htmlType" | "type"> & {
    readonly children: React.ReactNode;
    readonly htmlType?: "button" | "submit" | "reset";
    readonly kind?: "default" | "primary" | "text" | "danger";
  },
): React.ReactElement {
  const { children, className, htmlType, kind = "text", ...buttonProps } = props;
  const htmlProps = htmlType ? { htmlType } : {};
  return (
    <AntButton
      {...buttonProps}
      {...htmlProps}
      className={["agenthub-antd-button", className].filter(Boolean).join(" ")}
      danger={kind === "danger"}
      type={kind === "primary" ? "primary" : kind === "default" || kind === "danger" ? "default" : "text"}
    >
      {children}
    </AntButton>
  );
}

export function AgentHubIconButton(
  props: Omit<ButtonProps, "danger" | "htmlType" | "type"> & {
    readonly children: React.ReactNode;
    readonly label: string;
  },
): React.ReactElement {
  const { children, label, ...buttonProps } = props;
  return (
    <AgentHubButton {...buttonProps} aria-label={label} className={["agenthub-icon-button", buttonProps.className].filter(Boolean).join(" ")}>
      {children}
    </AgentHubButton>
  );
}

export function AgentHubTextInput(props: InputProps): React.ReactElement {
  const { className, ...inputProps } = props;
  return <Input {...inputProps} className={["agenthub-antd-input", className].filter(Boolean).join(" ")} />;
}

export function AgentHubSearchInput(props: InputProps): React.ReactElement {
  const { className, onChange, ...inputProps } = props;
  return (
    <Input.Search
      {...inputProps}
      allowClear
      className={["agenthub-antd-input", className].filter(Boolean).join(" ")}
      onChange={onChange}
    />
  );
}

export const AgentHubTextArea = React.forwardRef<TextAreaRef, TextAreaProps>(function AgentHubTextArea(
  props,
  ref,
): React.ReactElement {
  const { className, ...textareaProps } = props;
  return (
    <Input.TextArea
      {...textareaProps}
      ref={ref}
      className={["agenthub-antd-input", className].filter(Boolean).join(" ")}
    />
  );
});

export function AgentHubSelect<T extends string>(props: {
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly onChange?: (value: T) => void;
  readonly options: readonly { readonly label: React.ReactNode; readonly value: T }[];
  readonly value: T;
}): React.ReactElement {
  const changeProps = props.onChange ? { onChange: props.onChange } : {};
  return (
    <AntSelect
      {...changeProps}
      {...(props["aria-label"] ? { "aria-label": props["aria-label"] } : {})}
      className={["agenthub-antd-select", props.className].filter(Boolean).join(" ")}
      options={[...props.options]}
      value={props.value}
    />
  );
}

export function AgentHubCheckbox(props: React.ComponentProps<typeof AntCheckbox>): React.ReactElement {
  return <AntCheckbox {...props} className={["agenthub-antd-checkbox", props.className].filter(Boolean).join(" ")} />;
}

export function AgentHubSwitch(props: React.ComponentProps<typeof AntSwitch>): React.ReactElement {
  return <AntSwitch {...props} className={["agenthub-antd-switch", props.className].filter(Boolean).join(" ")} />;
}

export function AgentHubFormItem(props: React.ComponentProps<typeof Form.Item>): React.ReactElement {
  return <Form.Item {...props} className={["agenthub-antd-form-item", props.className].filter(Boolean).join(" ")} />;
}

export function AgentHubTooltip(props: React.ComponentProps<typeof AntTooltip>): React.ReactElement {
  return <AntTooltip {...props} />;
}

export function AgentHubDropdown(props: {
  readonly children: React.ReactElement;
  readonly items: NonNullable<MenuProps["items"]>;
  readonly onClick?: MenuProps["onClick"];
}): React.ReactElement {
  const menu = props.onClick ? { items: props.items, onClick: props.onClick } : { items: props.items };
  return <AntDropdown menu={menu} trigger={["click"]}>{props.children}</AntDropdown>;
}

export const AgentHubModal = AntModal;
export const AgentHubTabs = AntTabs;

export function AgentHubBadge(props: React.ComponentProps<typeof AntBadge>): React.ReactElement {
  return <AntBadge {...props} className={["agenthub-antd-badge", props.className].filter(Boolean).join(" ")} />;
}

export function AgentHubAvatar(props: React.ComponentProps<typeof AntAvatar>): React.ReactElement {
  return <AntAvatar {...props} className={["agenthub-antd-avatar", props.className].filter(Boolean).join(" ")} />;
}

export function AgentHubEmptyState(props: {
  readonly description: React.ReactNode;
}): React.ReactElement {
  return <AntEmpty className="agenthub-antd-empty" description={props.description} image={AntEmpty.PRESENTED_IMAGE_SIMPLE} />;
}

export function AgentHubLoadingState(props: {
  readonly active?: boolean;
  readonly rows?: number;
  readonly size?: SizeType;
}): React.ReactElement {
  if (props.active === false) {
    return <Spin size={props.size === "small" ? "small" : "default"} />;
  }
  return <Skeleton active paragraph={{ rows: props.rows ?? 3 }} title={false} />;
}

export const agentHubMessage: {
  readonly error: (content: React.ReactNode) => void;
  readonly info: (content: React.ReactNode) => void;
  readonly success: (content: React.ReactNode) => void;
  readonly warning: (content: React.ReactNode) => void;
} = {
  error: (content) => {
    void message.error(content);
  },
  info: (content) => {
    void message.info(content);
  },
  success: (content) => {
    void message.success(content);
  },
  warning: (content) => {
    void message.warning(content);
  },
};
