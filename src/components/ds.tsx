"use client";

import React from "react";
import { Icon } from "./Icon";

/* Design-system components ported 1:1 from the handoff bundle
   (_ds_bundle.js) — pill Button, circular icon button, chip,
   floating-label TextField, Textarea, Checkbox, TopAppBar,
   BottomFixedButton, Divider, Dialog. Light theme only. */

type CSS = React.CSSProperties;

/* ---------- Button ---------- */

const BTN_SIZES = {
  sm: { height: 40, padX: 16, font: "var(--body-sm-size)", line: "var(--body-sm-line)", gap: 6, icon: 20 },
  md: { height: 48, padX: 20, font: "var(--button-label-size)", line: "var(--button-label-line)", gap: 6, icon: 24 },
  lg: { height: 56, padX: 24, font: "var(--button-label-size)", line: "var(--button-label-line)", gap: 6, icon: 24 },
};

export function Button({
  variant = "filled",
  size = "lg",
  disabled = false,
  fullWidth = false,
  leadingIcon = null,
  trailingIcon = null,
  onClick,
  children,
  style = {},
  ...rest
}: {
  variant?: "filled" | "outlined" | "text" | "tonal";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onClick?: React.MouseEventHandler;
  children?: React.ReactNode;
  style?: CSS;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "style">) {
  const s = BTN_SIZES[size] || BTN_SIZES.lg;
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const hot = !disabled && (hover || press);
  const base: CSS = {
    display: "inline-flex", flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: s.gap, height: s.height, padding: `0 ${s.padX}px`, borderRadius: "var(--radius-full)",
    border: "none", outline: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: s.font, lineHeight: s.line,
    width: fullWidth ? "100%" : "auto", whiteSpace: "nowrap",
    transition: "background-color .15s ease, box-shadow .15s ease, color .15s ease, opacity .15s ease",
    boxSizing: "border-box",
  };
  const skins: Record<string, CSS> = {
    filled: {
      background: disabled ? "var(--bg-disabled)" : press ? "var(--brand-800)" : hover ? "var(--brand-700)" : "var(--bg-brand-solid)",
      color: disabled ? "var(--fg-disabled)" : "var(--text-white)",
      boxShadow: press && !disabled ? "var(--shadow-xs)" : "none",
    },
    tonal: {
      background: disabled ? "var(--bg-disabled)" : hot ? "var(--brand-50)" : "var(--gray-light-50)",
      color: disabled ? "var(--fg-disabled)" : hot ? "var(--text-brand-secondary)" : "var(--text-primary)",
    },
    outlined: {
      background: "var(--bg-primary)",
      color: disabled ? "var(--fg-disabled)" : "var(--text-primary)",
      boxShadow: `inset 0 0 0 1px ${disabled ? "var(--border-disabled)" : hot ? "var(--border-brand)" : "var(--border-primary)"}`,
    },
    text: {
      background: "transparent",
      color: disabled ? "var(--fg-disabled)" : "var(--text-primary)",
      opacity: hot ? 0.7 : 1,
      padding: `0 ${Math.max(s.padX - 12, 4)}px`,
    },
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{ ...base, ...skins[variant], ...style }}
      {...rest}
    >
      {leadingIcon && <span style={{ display: "inline-flex", width: s.icon, height: s.icon }}>{leadingIcon}</span>}
      <span>{children}</span>
      {trailingIcon && <span style={{ display: "inline-flex", width: s.icon, height: s.icon }}>{trailingIcon}</span>}
    </button>
  );
}

/* ---------- IconButtonCircle ---------- */

const IBC_SIZES = { xs: 32, sm: 40, md: 48, lg: 56 };
const IBC_ICON = { xs: 18, sm: 20, md: 24, lg: 28 };

export function IconButtonCircle({
  type = "solid",
  size = "md",
  disabled = false,
  onClick,
  children,
  style = {},
  ...rest
}: {
  type?: "solid" | "tonal" | "outline" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: React.MouseEventHandler;
  children?: React.ReactNode;
  style?: CSS;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "style" | "type">) {
  const dim = IBC_SIZES[size] || IBC_SIZES.md;
  const skins: Record<string, CSS> = {
    solid: { background: "var(--bg-brand-solid)", color: "var(--text-white)" },
    tonal: { background: "var(--bg-brand-primary)", color: "var(--fg-brand-primary)" },
    outline: { background: "var(--bg-primary)", color: "var(--fg-primary)", boxShadow: "inset 0 0 0 1px var(--border-primary)" },
    ghost: { background: "transparent", color: "var(--fg-secondary)" },
  };
  const disabledSkin: CSS = {
    background: type === "solid" || type === "tonal" ? "var(--bg-disabled)" : "transparent",
    color: "var(--fg-disabled)",
    boxShadow: type === "outline" ? "inset 0 0 0 1px var(--border-disabled)" : "none",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: dim, height: dim, borderRadius: "var(--radius-full)", border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background-color .15s ease, opacity .15s ease",
        ...(disabled ? disabledSkin : skins[type]),
        ...style,
      }}
      {...rest}
    >
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: IBC_ICON[size], height: IBC_ICON[size],
      }}>{children}</span>
    </button>
  );
}

/* ---------- Chip ---------- */

const CHIP_COLORS = {
  primary: { bg: "var(--brand-50)", fg: "var(--brand-600)", solid: "var(--brand-600)" },
  success: { bg: "var(--success-50)", fg: "var(--success-600)", solid: "var(--success-600)" },
  error: { bg: "var(--error-50)", fg: "var(--error-600)", solid: "var(--error-600)" },
  gray: { bg: "var(--gray-light-200)", fg: "var(--gray-light-700)", solid: "var(--gray-light-600)" },
};

export function Chip({
  color = "primary",
  size = "md",
  selected = false,
  onClick,
  children,
  style = {},
}: {
  color?: keyof typeof CHIP_COLORS;
  size?: "sm" | "md";
  selected?: boolean;
  onClick?: React.MouseEventHandler;
  children?: React.ReactNode;
  style?: CSS;
}) {
  const c = CHIP_COLORS[color] || CHIP_COLORS.primary;
  const h = size === "sm" ? 24 : 30;
  const bg = selected ? c.solid : c.bg;
  const fg = selected ? "var(--text-white)" : c.fg;
  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 2, height: h, padding: "0 4px",
        borderRadius: 7, background: bg, cursor: onClick ? "pointer" : "default", ...style,
      }}
    >
      <span style={{
        padding: "0 8px", fontFamily: "var(--font-body)", fontWeight: 700,
        fontSize: size === "sm" ? 11 : 12, lineHeight: size === "sm" ? "16px" : "18px",
        color: fg, whiteSpace: "nowrap",
      }}>{children}</span>
    </div>
  );
}

/* ---------- TextField (floating label) ---------- */

export function TextField({
  label = "",
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  error = false,
  type = "text",
  leadingIcon = null,
  helpText = "",
  style = {},
  ...rest
}: {
  label?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  type?: string;
  leadingIcon?: React.ReactNode;
  helpText?: string;
  style?: CSS;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "style" | "type" | "value">) {
  const [focused, setFocused] = React.useState(false);
  const hasValue = value != null && String(value).length > 0;
  const float = Boolean(focused || hasValue || placeholder);
  let borderColor = "var(--border-primary)";
  if (disabled) borderColor = "var(--border-disabled)";
  else if (error) borderColor = "var(--border-error)";
  else if (focused) borderColor = "var(--border-brand)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", ...style }}>
      <div style={{
        position: "relative", display: "flex", alignItems: "center", gap: 8, height: 52,
        padding: "0 12px", borderRadius: "var(--radius-md)",
        background: disabled ? "var(--bg-disabled-subtle)" : "var(--bg-primary)",
        boxShadow: `inset 0 0 0 ${focused && !disabled ? 2 : 1}px ${focused && !error && !disabled ? "var(--border-brand)" : borderColor}`,
        transition: "box-shadow .12s ease",
      }}>
        {leadingIcon && (
          <span style={{ display: "inline-flex", color: "var(--fg-quaternary)", width: 20, height: 20 }}>
            {leadingIcon}
          </span>
        )}
        <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
          {label && (
            <label style={{
              position: "absolute", left: 0,
              top: float ? -18 : "50%",
              transform: float ? "none" : "translateY(-50%)",
              fontFamily: "var(--font-body)",
              fontSize: float ? 12 : 16,
              lineHeight: float ? "16px" : "24px",
              color: error ? "var(--text-error-primary)" : "var(--text-secondary)",
              background: float ? "var(--bg-primary)" : "transparent",
              padding: float ? "0 4px" : 0,
              pointerEvents: "none",
              transition: "all .12s ease",
            }}>
              {label}
              {required && <span style={{ color: "var(--text-error-primary)" }}> *</span>}
            </label>
          )}
          <input
            type={type}
            value={value}
            placeholder={float ? placeholder : ""}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={onChange}
            style={{
              width: "100%", border: "none", outline: "none", background: "transparent",
              fontFamily: "var(--font-body)", fontSize: 16, lineHeight: "24px",
              color: disabled ? "var(--text-disabled)" : "var(--text-primary)", padding: 0,
            }}
            {...rest}
          />
        </div>
      </div>
      {helpText && (
        <span style={{
          fontFamily: "var(--font-body)", fontSize: 12, lineHeight: "18px",
          color: error ? "var(--text-error-primary)" : "var(--text-tertiary)",
        }}>{helpText}</span>
      )}
    </div>
  );
}

/* ---------- Textarea ---------- */

export function Textarea({
  label = "",
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  error = false,
  rows = 4,
  helpText = "",
  style = {},
  ...rest
}: {
  label?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  rows?: number;
  helpText?: string;
  style?: CSS;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "style" | "value">) {
  const [focused, setFocused] = React.useState(false);
  let borderColor = "var(--border-primary)";
  if (disabled) borderColor = "var(--border-disabled)";
  else if (error) borderColor = "var(--border-error)";
  else if (focused) borderColor = "var(--border-brand)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", ...style }}>
      {label && (
        <label style={{
          fontFamily: "var(--font-body)", fontSize: 14, lineHeight: "20px",
          color: error ? "var(--text-error-primary)" : "var(--text-secondary)",
        }}>
          {label}
          {required && <span style={{ color: "var(--text-error-primary)" }}> *</span>}
        </label>
      )}
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={onChange}
        style={{
          width: "100%", resize: "vertical", padding: "10px 12px", borderRadius: "var(--radius-md)",
          border: "none", outline: "none",
          background: disabled ? "var(--bg-disabled-subtle)" : "var(--bg-primary)",
          boxShadow: `inset 0 0 0 ${focused && !disabled ? 2 : 1}px ${borderColor}`,
          fontFamily: "var(--font-body)", fontSize: 16, lineHeight: "24px",
          color: disabled ? "var(--text-disabled)" : "var(--text-primary)",
          transition: "box-shadow .12s ease", boxSizing: "border-box",
        }}
        {...rest}
      />
      {helpText && (
        <span style={{
          fontFamily: "var(--font-body)", fontSize: 12, lineHeight: "18px",
          color: error ? "var(--text-error-primary)" : "var(--text-tertiary)",
        }}>{helpText}</span>
      )}
    </div>
  );
}

/* ---------- Checkbox ---------- */

export function Checkbox({
  checked = false,
  disabled = false,
  onChange,
  label,
  size = 24,
  style = {},
}: {
  checked?: boolean;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  label?: React.ReactNode;
  size?: number;
  style?: CSS;
}) {
  const box: CSS = {
    width: size, height: size, borderRadius: 6, display: "inline-flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0, boxSizing: "border-box",
    background: disabled ? (checked ? "var(--gray-light-50)" : "var(--bg-primary)")
      : checked ? "var(--bg-brand-solid)" : "var(--bg-primary)",
    boxShadow: checked && !disabled ? "none"
      : `inset 0 0 0 2px ${disabled ? "var(--gray-light-300)" : "var(--gray-light-600)"}`,
    transition: "background-color .12s ease, box-shadow .12s ease",
  };
  const stroke = disabled ? "var(--gray-light-300)" : "var(--text-white)";
  const labelColor = disabled ? "var(--gray-light-400)" : checked ? "var(--brand-600)" : "var(--gray-light-500)";
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", ...style }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
      />
      <span style={box}>
        {checked && (
          <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.2 5 8.5 9.5 3.5" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label && (
        <span style={{
          fontFamily: "var(--font-body)", fontSize: 16, lineHeight: "24px",
          fontWeight: checked ? 700 : 400, color: labelColor,
        }}>{label}</span>
      )}
    </label>
  );
}

/* ---------- Toggle ---------- */

export function Toggle({
  checked = false,
  onChange,
}: {
  checked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange && onChange(!checked)}
      style={{
        width: 52, height: 32, borderRadius: "var(--radius-full)", border: "none",
        padding: 2, cursor: "pointer", boxSizing: "border-box",
        background: checked ? "var(--bg-brand-solid)" : "var(--gray-light-300)",
        transition: "background-color .15s ease", display: "inline-flex", alignItems: "center",
      }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: "var(--radius-full)", background: "#fff",
        boxShadow: "var(--shadow-sm)", transform: checked ? "translateX(20px)" : "translateX(0)",
        transition: "transform .15s ease",
      }} />
    </button>
  );
}

/* ---------- TopAppBar ---------- */

export function TopAppBar({
  title,
  leading = null,
  trailing = null,
  style = {},
}: {
  title?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  style?: CSS;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, height: 44, padding: "8px 16px",
      background: "var(--bg-primary)", boxSizing: "border-box", ...style,
    }}>
      <div style={{ width: 40, display: "flex", justifyContent: "flex-start" }}>{leading}</div>
      <div style={{
        flex: 1, textAlign: "center", fontFamily: "var(--font-heading)", fontWeight: 700,
        fontSize: 18, lineHeight: "28px", color: "var(--text-primary)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{title}</div>
      <div style={{ width: 40, display: "flex", justifyContent: "flex-end" }}>{trailing}</div>
    </div>
  );
}

/* ---------- BottomFixedButton ---------- */

export function BottomFixedButton({
  primaryLabel = "ยืนยัน",
  secondaryLabel = "",
  onPrimary,
  onSecondary,
  primaryProps = {},
  secondaryProps = {},
  style = {},
}: {
  primaryLabel?: React.ReactNode;
  secondaryLabel?: React.ReactNode;
  onPrimary?: React.MouseEventHandler;
  onSecondary?: React.MouseEventHandler;
  primaryProps?: Record<string, unknown>;
  secondaryProps?: Record<string, unknown>;
  style?: CSS;
}) {
  const barStyle: CSS = {
    background: "var(--bg-primary)", borderTop: "1px solid var(--border-primary)",
    padding: "16px 16px 0", display: "flex", flexDirection: "column", alignItems: "center",
    boxSizing: "border-box", flexShrink: 0, ...style,
  };
  const content = (
    <>
      <div style={{ display: "flex", gap: 16, width: "100%" }}>
        {secondaryLabel ? (
          <Button variant="outlined" fullWidth onClick={onSecondary} {...secondaryProps}>{secondaryLabel}</Button>
        ) : null}
        <Button variant="filled" fullWidth onClick={onPrimary} {...primaryProps}>{primaryLabel}</Button>
      </div>
      <div style={{ height: 16 }} />
      <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
    </>
  );
  return (
    <>
      {/* spacer: keeps the same footprint in normal flow so scrolling content
          isn't hidden behind the fixed bar below */}
      <div aria-hidden style={{ ...barStyle, visibility: "hidden", pointerEvents: "none" }}>{content}</div>
      {/* the sheet's own transform (see DetailSheet) makes it the containing
          block here, so this pins to the sheet's bottom instead of the
          viewport's when rendered inside it */}
      <div style={{ ...barStyle, position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30 }}>{content}</div>
    </>
  );
}

/* ---------- Divider ---------- */

export function Divider({ style = {} }: { style?: CSS }) {
  return <div role="separator" style={{ height: 1, width: "100%", background: "var(--border-secondary)", ...style }} />;
}

/* ---------- Dialog ---------- */

export function Dialog({
  onClose,
  icon = null,
  title,
  children,
  actions = null,
}: {
  onClose?: () => void;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24, background: "rgba(16,24,40,0.55)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 340, background: "var(--bg-primary)",
          borderRadius: "var(--radius-5xl)", boxShadow: "var(--shadow-dialog)", padding: 24,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center",
        }}
      >
        {icon && <span style={{ display: "inline-flex", width: 48, height: 48, color: "var(--fg-brand-primary)" }}>{icon}</span>}
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20, lineHeight: "30px", color: "var(--text-primary)" }}>
          {title}
        </div>
        {children && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: "22px", color: "var(--text-tertiary)" }}>
            {children}
          </div>
        )}
        {actions && <div style={{ display: "flex", gap: 12, width: "100%", marginTop: 4 }}>{actions}</div>}
      </div>
    </div>
  );
}

/* ---------- Logo ---------- */

export function Logo({ height = 44, style = {} }: { height?: number; style?: CSS }) {
  /* eslint-disable-next-line @next/next/no-img-element */
  return <img src="/images/9believe-logo-horizontal.png" alt="9believe" style={{ height, width: "auto", display: "block", ...style }} />;
}
