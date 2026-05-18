import { DashboardOverview } from "@/app/components/dashboard/dashboard-overview";
import { getServerLocale } from "@/app/lib/i18n-server";

export default async function DashboardPage() {
  const locale = await getServerLocale();
  return <DashboardOverview locale={locale} />;
}
