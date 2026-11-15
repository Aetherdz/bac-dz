"use client";

import { usePathname } from "next/navigation";

/**
 * App-like page transition: the subtree is keyed on the pathname so the quiet
 * entrance replays on every navigation. Purely visual — no routing logic — and
 * disabled by the global reduced-motion rule.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
