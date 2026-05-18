import { PremiumPage } from "@/app/components/pages/premium-page";

export default function DemosPage() {
  return (
    <PremiumPage
      title="Demos"
      description="Repositorio de demos creadas por el agente con foco en venta consultiva y cierre rápido."
      metricLabel="Demos publicadas"
      metricValue="392"
      metricDelta="+12.1%"
      highlights={[
        "El formato landing corta mejora la respuesta inicial.",
        "Las demos con video breve convierten un 21% más.",
        "Se priorizan diseños con CTA doble para móvil y desktop.",
      ]}
    />
  );
}
