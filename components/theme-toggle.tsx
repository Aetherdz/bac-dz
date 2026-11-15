"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "./icons";

export function ThemeToggle({ label }: { label: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("bacdz-theme", next ? "dark" : "light");
    } catch {
      /* storage may be unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={mounted ? dark : undefined}
      className="grid h-10 w-10 place-items-center rounded-card border border-line-strong bg-surface text-ink transition-colors hover:border-ink hover:text-brand lg:h-9 lg:w-9"
    >
      {mounted && dark ? <IconSun size={17} /> : <IconMoon size={17} />}
    </button>
  );
}
