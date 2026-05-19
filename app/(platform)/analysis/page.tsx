import { PremiumPage } from "@/app/components/pages/premium-page";
import { getServerLocale } from "@/app/lib/i18n-server";

export default async function AnalysisPage() {
  const locale = await getServerLocale();
  return (
    <PremiumPage
      locale={locale}
      title={locale === "en" ? "Web Analysis" : "Análisis Web"}
      description={
        locale === "en"
          ? "Visual and technical audit engine to detect conversion friction in each business."
          : "Motor de auditoría visual y técnica para detectar fricciones de conversión en cada negocio."
      }
      metricLabel={locale === "en" ? "Audited websites" : "Webs auditadas"}
      metricValue="328"
      metricDelta="+14.2%"
      highlights={
        locale === "en"
          ? [
              "High load time detected in 41% of leads.",
              "Only 33% have the primary CTA visible on mobile.",
              "58% lack clear social proof on the homepage.",
            ]
          : [
              "Tiempo de carga alto detectado en 41% de los leads.",
              "Solo 33% tiene CTA principal visible en móvil.",
              "El 58% carece de prueba social clara en portada.",
            ]
      }
    />
  );
}
