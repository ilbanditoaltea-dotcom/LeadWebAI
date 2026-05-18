import { PremiumPage } from "@/app/components/pages/premium-page";

export default function ClientsPage() {
  return (
    <PremiumPage
      title="Clientes"
      description="Vista de cierre y expansión de cuentas con señales de retención y upsell."
      metricLabel="Clientes cerrados"
      metricValue="37"
      metricDelta="+4.2%"
      highlights={[
        "Ticket medio sube en clientes con onboarding guiado.",
        "Nuevas oportunidades de upsell detectadas por actividad.",
        "Satisfacción alta en segmentos con demos personalizadas.",
      ]}
    />
  );
}
