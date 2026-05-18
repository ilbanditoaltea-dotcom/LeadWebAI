import { ActivityFeed } from "@/app/components/dashboard/activity-feed";
import { DemoPreviewCard } from "@/app/components/dashboard/demo-preview-card";
import { AgentFlow } from "@/app/components/dashboard/agent-flow";
import { LeadsTable } from "@/app/components/dashboard/leads-table";
import { MessageCard } from "@/app/components/dashboard/message-card";
import { PerformanceChart } from "@/app/components/dashboard/performance-chart";
import { StatCard } from "@/app/components/ui/stat-card";
import { agentActivity, performanceData, recentLeads, stats } from "@/app/lib/mock-data";
import { statLabel, t, type Locale } from "@/app/lib/i18n";

type DashboardOverviewProps = {
  locale: Locale;
};

export function DashboardOverview({ locale }: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#e5e7eb] bg-white px-5 py-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#0f172a]">
              {t(locale, "dashboardWelcome")}
            </h2>
            <p className="mt-1 text-sm text-[#64748b]">
              {t(locale, "dashboardSummary")}
            </p>
          </div>
          <span className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-3 py-1.5 text-xs font-medium text-[#64748b]">
            {t(locale, "last30Days")}
          </span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={statLabel(locale, stat.title)}
            value={stat.value}
            variation={stat.variation}
            trend={stat.trend}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="space-y-6 xl:col-span-2">
          <LeadsTable leads={recentLeads} />
        </div>
        <ActivityFeed items={agentActivity} />
      </section>

      <AgentFlow />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <DemoPreviewCard />
        <MessageCard />
      </section>

      <PerformanceChart data={performanceData} />
    </div>
  );
}
