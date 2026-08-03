"use client";

import type { ReactNode } from "react";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 11,
          letterSpacing: "0.18em",
          color: "#8A8A93",
        }}
      >
        {label}
      </span>
      {children}
      {hint && (
        <span style={{ fontSize: 12, color: "#4E4E58" }}>{hint}</span>
      )}
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="admin-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className="admin-input"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      className="admin-textarea"
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className="admin-card"
      style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 12,
          letterSpacing: "0.22em",
          color: "#E8192C",
        }}
      >
        {title}
      </div>
      {children}
    </section>
  );
}

export function SaveBar({
  saving,
  saved,
  onSave,
  error,
}: {
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  error?: string | null;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "sticky",
        bottom: 16,
        background: "rgba(9,9,12,0.95)",
        border: "1px solid rgba(255,255,255,0.12)",
        padding: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="admin-btn" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && !error && (
          <span
            style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 12,
              color: "#8B5CF6",
              letterSpacing: "0.12em",
            }}
          >
            PUSHED LIVE
          </span>
        )}
      </div>
      {error && (
        <div
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 12,
            color: "#FF3B3B",
            lineHeight: 1.4,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
