"use client";

import type { ReactNode } from "react";

/**
 * Thin progress ring. Decorative by default; pass `label` to expose it as an
 * image with an accessible name. Uses stroke-dashoffset so a 500ms tick reads
 * as a smooth sweep without animating a number.
 *
 * The ring is fluid below its nominal `size`: wrap it in a narrower container
 * on phones and it stays circular instead of overflowing the card.
 */
export function TimerRing({
  progress,
  size = 220,
  stroke = 6,
  children,
  label,
  ticks = false,
  className = "",
}: {
  progress: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  label?: string;
  /** Four cardinal marks, so the sweep reads as a clock face, not a gauge. */
  ticks?: boolean;
  className?: string;
}) {
  const clamped = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);

  return (
    <div
      className={`relative inline-grid place-items-center ${className}`}
      style={{ width: size, maxWidth: "100%", aspectRatio: "1 / 1" }}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden className="h-full w-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgb(var(--line))" strokeWidth={stroke} />
        {ticks &&
          [0, 90, 180, 270].map((angle) => (
            <line
              key={angle}
              x1={size / 2}
              y1={stroke}
              x2={size / 2}
              y2={stroke + 7}
              stroke="rgb(var(--line-strong))"
              strokeWidth={1}
              transform={`rotate(${angle} ${size / 2} ${size / 2})`}
            />
          ))}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(var(--brand))"
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 480ms linear" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center px-2">{children}</div>
    </div>
  );
}
