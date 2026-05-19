import { PremiumPage } from "@/app/components/pages/premium-page";
import { getServerLocale } from "@/app/lib/i18n-server";

export default async function ClientsPage() {
  const locale = await getServerLocale();
  return (
    <PremiumPage
      locale={locale}
      title={locale === "en" ? "Clients" : "Clientes"}
      description={
        locale === "en"
          ? "Closing and account expansion view with retention and upsell signals."
          : "Vista de cierre y expansión de cuentas con señales de retención y upsell."
      }
      metricLabel={locale === "en" ? "Closed clients" : "Clientes cerrados"}
      metricValue="37"
      metricDelta="+4.2%"
      highlights={
        locale === "en"
          ? [
              "Average ticket increases in clients with guided onboarding.",
              "New upsell opportunities detected from activity.",
              "High satisfaction in segments with personalized demos.",
            ]
          : [
              "Ticket medio sube en clientes con onboarding guiado.",
              "Nuevas oportunidades de upsell detectadas por actividad.",
              "Satisfacción alta en segmentos con demos personalizadas.",
            ]
      }
    />
  );
}
