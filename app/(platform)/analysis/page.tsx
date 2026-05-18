import { PremiumPage } from "@/app/components/pages/premium-page";

export default function AnalysisPage() {
  return (
    <PremiumPage
      title="Análisis Web"
      description="Motor de auditoría visual y técnica para detectar fricciones de conversión en cada negocio."
      metricLabel="Webs auditadas"
      metricValue="328"
      metricDelta="+14.2%"
      highlights={[
        "Tiempo de carga alto detectado en 41% de los leads.",
        "Solo 33% tiene CTA principal visible en móvil.",
        "El 58% carece de prueba social clara en portada.",
      ]}
    />
  );
}
