import { PremiumPage } from "@/app/components/pages/premium-page";
import { getServerLocale } from "@/app/lib/i18n-server";

export default async function MessagesPage() {
  const locale = await getServerLocale();
  return (
    <PremiumPage
      locale={locale}
      title={locale === "en" ? "Messages" : "Mensajes"}
      description={
        locale === "en"
          ? "AI-generated outreach library with contextual personalization per lead."
          : "Librería de outreach generado por IA con personalización contextual por lead."
      }
      metricLabel={locale === "en" ? "Messages ready" : "Mensajes listos"}
      metricValue="745"
      metricDelta="+9.4%"
      highlights={
        locale === "en"
          ? [
              "3-step sequences with a clear consultative tone.",
              "Dynamic variables by lead sector and city.",
              "Best-performing templates prioritized automatically.",
            ]
          : [
              "Secuencias de 3 pasos con tono consultivo y claro.",
              "Variables dinámicas por sector y ciudad del lead.",
              "Plantillas con mejor rendimiento priorizadas automáticamente.",
            ]
      }
    />
  );
}
