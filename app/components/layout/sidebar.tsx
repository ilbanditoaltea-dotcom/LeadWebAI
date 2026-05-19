"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, LogOut, Rocket } from "lucide-react";
import { useState } from "react";
import { sidebarItems } from "@/app/lib/mock-data";
import { sidebarLabel, t } from "@/app/lib/i18n";
import { useLocale } from "@/app/components/layout/locale-provider";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (href: string) => {
    if (pathname === href) {
      return true;
    }

    if (href !== "/dashboard" && pathname.startsWith(`${href}/`)) {
      return true;
    }

    return false;
  };

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

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
              <p className="truncate text-sm font-semibold text-white">Equipo LeadWeb</p>
              <p className="text-xs text-slate-300">Acceso interno</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            {isLoggingOut ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
            Cerrar sesión
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-slate-300">{t(locale, "agentStatus")}</p>
          <p className="mt-1 text-sm font-semibold text-white">{t(locale, "aiEngineOn")}</p>
        </div>
      </div>
    </aside>
  );
}
