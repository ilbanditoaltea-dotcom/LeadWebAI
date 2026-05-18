import { PremiumPage } from "@/app/components/pages/premium-page";

export default function FollowUpPage() {
  return (
    <PremiumPage
      title="Seguimiento"
      description="Control inteligente de respuestas pendientes y próximos contactos en pipeline."
      metricLabel="Seguimientos hoy"
      metricValue="63"
      metricDelta="+6.9%"
      highlights={[
        "22 leads con respuesta parcial requieren segundo toque.",
        "Recordatorios automáticos con ventanas óptimas de envío.",
        "Prioridad alta en oportunidades con demo ya abierta.",
      ]}
    />
  );
}
