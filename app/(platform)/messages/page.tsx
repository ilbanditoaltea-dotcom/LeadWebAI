import { PremiumPage } from "@/app/components/pages/premium-page";

export default function MessagesPage() {
  return (
    <PremiumPage
      title="Mensajes"
      description="Librería de outreach generado por IA con personalización contextual por lead."
      metricLabel="Mensajes listos"
      metricValue="745"
      metricDelta="+9.4%"
      highlights={[
        "Secuencias de 3 pasos con tono consultivo y claro.",
        "Variables dinámicas por sector y ciudad del lead.",
        "Plantillas con mejor rendimiento priorizadas automáticamente.",
      ]}
    />
  );
}
