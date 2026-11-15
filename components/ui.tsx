import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  intro,
  action,
  as: As = "h2",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  action?: ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <As className="text-[1.55rem] font-semibold leading-tight tracking-tight text-ink sm:text-[1.9rem]">{title}</As>
        {intro && <p className="mt-2 text-[14.5px] leading-7 text-muted">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "gold" | "accent";
}) {
  const tones = {
    neutral: "border-line bg-raised text-muted",
    brand: "border-brand/30 bg-brand/[0.08] text-brand",
    gold: "border-gold/30 bg-gold/[0.08] text-gold",
    accent: "border-accent/30 bg-accent/[0.07] text-accent",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-card border px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.1em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-s border-line ps-4 first:border-s-0 first:ps-0">
      <div className="num text-xl font-semibold text-ink sm:text-2xl">{value}</div>
      <div className="mt-0.5 text-[11.5px] leading-5 text-muted">{label}</div>
    </div>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn" | "official" | "brand";
  title?: string;
  children: ReactNode;
}) {
  const tones = {
    info: "border-line bg-raised",
    warn: "border-accent/35 bg-accent/[0.05]",
    official: "border-gold/35 bg-gold/[0.06]",
    brand: "border-brand/30 bg-brand/[0.05]",
  } as const;
  return (
    <div className={`rounded-card border p-4 text-[14px] leading-7 sm:p-5 ${tones[tone]}`}>
      {title && <div className="mb-1 text-[13px] font-semibold text-ink">{title}</div>}
      <div className="text-ink/85">{children}</div>
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="text-[15px] font-semibold text-ink">{title}</div>
      {hint && <p className="max-w-md text-sm leading-6 text-muted">{hint}</p>}
      {action}
    </div>
  );
}

export function NextLink({ href, children, className = "btn btn-sm" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function MetaRow({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <dt className="uppercase tracking-wide">{item.label}</dt>
          <dd className="font-medium text-ink/80">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
