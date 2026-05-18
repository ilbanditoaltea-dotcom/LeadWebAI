"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Rocket, Sparkles } from "lucide-react";
import { sidebarItems } from "@/app/lib/mock-data";
import { sidebarLabel, t } from "@/app/lib/i18n";
import { useLocale } from "@/app/components/layout/locale-provider";

export function Sidebar() {
  const pathname = usePathname();
  const { locale } = useLocale();

  const isActive = (href: string) => {
    if (pathname === href) {
      return true;
    }

    if (href !== "/dashboard" && pathname.startsWith(`${href}/`)) {
      return true;
    }

    return false;
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[18.5rem] border-r border-[#1e293b] bg-gradient-to-b from-[#07111f] via-[#0b1324] to-[#07111f] px-4 py-5 text-slate-100 lg:flex lg:flex-col">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 p-2 text-white shadow-lg shadow-violet-950/40">
          <Rocket className="h-4 w-4" />
        </div>
        <div>
          <p className="text-base font-semibold tracking-tight text-white">LeadWeb AI</p>
        </div>
      </div>

      <nav className="space-y-1.5">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                active
                  ? "bg-gradient-to-r from-violet-600/95 to-indigo-600/90 text-white shadow-sm shadow-indigo-950/40"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">{sidebarLabel(locale, item.href, item.label)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">Alejandro</p>
              <p className="text-xs text-slate-300">{t(locale, "proPlan")}</p>
            </div>
            <ChevronDown className="ml-auto h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="rounded-2xl border border-violet-400/30 bg-gradient-to-b from-violet-600/35 to-indigo-700/35 p-4">
          <div className="mb-2 inline-flex rounded-lg bg-white/20 p-1.5 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold text-white">{t(locale, "proPlan")}</p>
          <p className="mt-1 text-xs text-violet-100">
            {t(locale, "proPlanBody")}
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-lg bg-white px-3 py-2 text-xs font-semibold text-indigo-700"
          >
            {t(locale, "seeBenefits")}
          </button>
        </div>
      </div>
    </aside>
  );
}
