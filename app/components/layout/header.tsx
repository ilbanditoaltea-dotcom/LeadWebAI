"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Bell, CalendarDays, Search } from "lucide-react";
import { sidebarItems } from "@/app/lib/mock-data";
import { sidebarLabel, t, type Locale } from "@/app/lib/i18n";
import { useLocale } from "@/app/components/layout/locale-provider";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const [isPending, startTransition] = useTransition();
  const quickItems = sidebarItems.slice(0, 5);

  const currentItem =
    sidebarItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ??
    sidebarItems[0];

  const currentLabel = sidebarLabel(locale, currentItem.href, currentItem.label);

  function handleLocaleChange(nextLocale: Locale) {
    setLocale(nextLocale);
    startTransition(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#e5e7eb] bg-[#f8fafc]/95 backdrop-blur">
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <p className="mb-2 text-xs font-medium text-[#64748b]">
          LeadWeb AI / <span className="text-[#64748b]">{currentLabel}</span>
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-[#0f172a] sm:text-xl">
              {currentLabel}
            </h1>
            <p className="text-sm text-[#64748b]">
              {t(locale, "appSubtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 text-sm font-medium text-[#64748b]"
            >
              <Search className="h-4 w-4" />
              {t(locale, "searchLead")}
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 text-sm font-medium text-[#64748b]"
            >
              <CalendarDays className="h-4 w-4" />
              {t(locale, "dateRange")}
            </button>
            <button
              type="button"
              onClick={() => handleLocaleChange(locale === "es" ? "en" : "es")}
              disabled={isPending}
              className="inline-flex h-10 items-center rounded-xl border border-[#e5e7eb] bg-white px-3 text-sm font-semibold text-[#64748b]"
            >
              {locale.toUpperCase()}
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-[#64748b]"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {quickItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
                  active
                    ? "border-violet-200 bg-violet-100 text-violet-700"
                    : "border-[#e5e7eb] bg-white text-[#64748b]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {sidebarLabel(locale, item.href, item.label)}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
