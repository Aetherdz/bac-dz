"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { IconSearch } from "@/components/icons";

type Props = {
  action: string;
  placeholder: string;
  submitLabel: string;
  id: string;
  tone?: "plain" | "pill";
  label?: string;
  className?: string;
  labelClassName?: string;
};

/**
 * The search box submits through the client router, so going from a page to
 * its results is a normal in-page navigation. The form keeps `action`/`name`
 * so it still works without JavaScript.
 */
export function SearchForm({
  action,
  placeholder,
  submitLabel,
  id,
  tone = "plain",
  label,
  className = "",
  labelClassName = "",
}: Props) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = value.trim();
    if (!q) return;
    startTransition(() => router.push(`${action}?q=${encodeURIComponent(q)}`));
  };

  const pill = tone === "pill";

  return (
    <form action={action} onSubmit={submit} role="search" className={className}>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}
      <div
        className={
          pill
            ? "flex items-center gap-2 rounded-full border border-line bg-surface p-1.5 focus-within:border-brand"
            : "flex items-center gap-2 border border-line-strong bg-surface px-1 py-1 focus-within:border-brand"
        }
      >
        <span className={pill ? "ps-2.5 text-muted" : "ps-2 text-muted"} aria-hidden>
          <IconSearch size={pill ? 17 : 16} />
        </span>
        <input
          id={id}
          name="q"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="min-h-9 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted/70"
        />
        <button type="submit" disabled={pending} className="btn btn-primary btn-sm shrink-0">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
