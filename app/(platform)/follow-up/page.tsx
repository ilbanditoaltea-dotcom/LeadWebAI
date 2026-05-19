import { PremiumPage } from "@/app/components/pages/premium-page";
import { getServerLocale } from "@/app/lib/i18n-server";

export default async function FollowUpPage() {
  const locale = await getServerLocale();
  return (
    <PremiumPage
      locale={locale}
      title={locale === "en" ? "Follow-up" : "Seguimiento"}
      description={
        locale === "en"
          ? "Smart control of pending replies and next contacts in the pipeline."
          : "Control inteligente de respuestas pendientes y próximos contactos en pipeline."
      }
      metricLabel={locale === "en" ? "Follow-ups today" : "Seguimientos hoy"}
      metricValue="63"
      metricDelta="+6.9%"
      highlights={
        locale === "en"
          ? [
              "22 leads with partial reply require a second touch.",
              "Automatic reminders with optimal send windows.",
              "High priority on opportunities with demo already opened.",
            ]
          : [
              "22 leads con respuesta parcial requieren segundo toque.",
              "Recordatorios automáticos con ventanas óptimas de envío.",
              "Prioridad alta en oportunidades con demo ya abierta.",
            ]
      }
    />
  );
}
