import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function SectionCard({ title, subtitle, action, children }: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm shadow-slate-200/50 sm:p-6">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#0f172a] sm:text-lg">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-[#64748b]">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
