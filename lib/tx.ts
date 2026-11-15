import type { Locale } from "./i18n";

/** Tiny inline translation helper for tool-specific strings. */
export function tx(locale: Locale, copy: { ar: string; fr: string; en: string }): string {
  return copy[locale];
}
