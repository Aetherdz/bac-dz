"use client";

import { useEffect, useRef, useState } from "react";

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[11.5px] leading-5 text-muted">{hint}</p>}
    </div>
  );
}

export function Select({
  id,
  value,
  onChange,
  children,
  className = "",
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={`select ${className}`}>
      {children}
    </select>
  );
}

export function GradeInput({
  id,
  value,
  onChange,
  invalid,
  label,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      aria-label={label}
      aria-invalid={invalid || undefined}
      inputMode="decimal"
      autoComplete="off"
      dir="ltr"
      placeholder="—"
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`num h-11 w-[76px] rounded-lg border bg-surface px-2 text-center text-[15px] font-medium text-ink outline-none transition-colors focus:ring-1 disabled:cursor-not-allowed ${
        invalid ? "border-accent focus:border-accent focus:ring-accent" : "border-line focus:border-brand focus:ring-brand"
      }`}
    />
  );
}

export function ResultPanel({
  label,
  value,
  suffix,
  tone = "brand",
  children,
}: {
  label: string;
  value: string;
  suffix?: string;
  tone?: "brand" | "neutral" | "accent";
  children?: React.ReactNode;
}) {
  const toneClass =
    tone === "brand" ? "border-brand/25 bg-brand/[0.06]" : tone === "accent" ? "border-accent/25 bg-accent/[0.05]" : "border-line bg-raised";
  return (
    <div className={`rounded-card border p-5 ${toneClass}`} aria-live="polite">
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="num text-4xl font-semibold tracking-tight text-ink" dir="ltr">
          {value}
        </span>
        {suffix && <span className="text-sm text-muted">{suffix}</span>}
      </div>
      {children}
    </div>
  );
}

export function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw) as T);
    } catch {
      /* ignore corrupted state */
    } finally {
      loaded.current = true;
    }
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
  }, [key, state]);

  return [state, setState] as const;
}

export function CopyButton({
  text,
  labels,
  className = "btn btn-sm",
}: {
  text: string;
  labels: { copy: string; copied: string };
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={copy} className={className} aria-live="polite">
      {copied ? labels.copied : labels.copy}
    </button>
  );
}

export function Bar({ value, max = 100 }: { value: number; max?: number }) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/70" aria-hidden>
      <div className="h-full rounded-full bg-brand/70" style={{ width: `${width}%` }} />
    </div>
  );
}

export function formatGrade(value: number | null): string {
  return value === null ? "—" : value.toFixed(2);
}
