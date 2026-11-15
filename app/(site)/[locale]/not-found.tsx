"use client";

import { usePathname } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { NotFoundPage } from "@/components/pages/misc";

export default function NotFound() {
  const pathname = usePathname() ?? "";
  const first = pathname.split("/").filter(Boolean)[0];
  const locale: Locale = isLocale(first) ? first : "ar";
  return <NotFoundPage locale={locale} />;
}
