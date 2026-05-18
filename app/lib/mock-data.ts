import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bot,
  ChartLine,
  LayoutDashboard,
  Mail,
  MessagesSquare,
  SearchCheck,
  Settings,
  Target,
  Users,
  WandSparkles,
  Webhook,
} from "lucide-react";
import { demoBusinessCases } from "@/app/lib/demo-business-cases";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Análisis Web", href: "/analysis", icon: SearchCheck },
  { label: "Generar Demo", href: "/ai-generator", icon: WandSparkles },
  { label: "Demos", href: "/demos", icon: Webhook },
  { label: "Mensajes", href: "/messages", icon: MessagesSquare },
  { label: "Campañas", href: "/campaigns", icon: Target },
  { label: "Seguimiento", href: "/follow-up", icon: Activity },
  { label: "Clientes", href: "/clients", icon: ChartLine },
  { label: "Ajustes", href: "/settings", icon: Settings },
];

export type Stat = {
  title: string;
  value: string;
  variation: string;
  trend: "up" | "down";
};

export const stats: Stat[] = [
  { title: "Leads encontrados", value: "1,284", variation: "+18.6%", trend: "up" },
  { title: "Demos generadas", value: "392", variation: "+12.1%", trend: "up" },
  { title: "Mensajes preparados", value: "745", variation: "+9.4%", trend: "up" },
  { title: "Respuestas", value: "216", variation: "+5.7%", trend: "up" },
  { title: "Clientes cerrados", value: "37", variation: "-2.3%", trend: "down" },
];

export type Lead = {
  id: string;
  company: string;
  sector: string;
  city: string;
  websiteScore: number;
  demoStatus: "Lista" | "En progreso" | "Pendiente";
  priority: "Alta" | "Media" | "Baja";
};

export const recentLeads: Lead[] = [
  ...demoBusinessCases.map((item) => {
    const demoStatus: Lead["demoStatus"] =
      item.campaignStatus === "website_generated" ||
      item.campaignStatus === "approved" ||
      item.campaignStatus === "contacted" ||
      item.campaignStatus === "responded" ||
      item.campaignStatus === "client"
        ? "Lista"
        : item.campaignStatus === "analyzed" || item.campaignStatus === "pending_approval"
          ? "En progreso"
          : "Pendiente";

    const priority: Lead["priority"] =
      item.opportunityScore >= 80 ? "Alta" : item.opportunityScore >= 60 ? "Media" : "Baja";

    return {
      id: item.leadId,
      company: item.businessName,
      sector: item.category,
      city: item.city,
      websiteScore: item.websiteQualityScore,
      demoStatus,
      priority,
    };
  }),
];

export type AgentActivityItem = {
  title: string;
  time: string;
  detail: string;
  icon: LucideIcon;
};

export const agentActivity: AgentActivityItem[] = [
  {
    title: "Rastreo completado",
    time: "Hace 8 min",
    detail: "Se detectaron 34 negocios con web desactualizada.",
    icon: SearchCheck,
  },
  {
    title: "Demo generada",
    time: "Hace 16 min",
    detail: "Landing premium para Clínica Sonrisa+ lista para envío.",
    icon: Bot,
  },
  {
    title: "Mensaje personalizado",
    time: "Hace 23 min",
    detail: "Secuencia de outreach creada para AutoNova Taller.",
    icon: Mail,
  },
];

export type PerformancePoint = {
  name: string;
  leads: number;
  responses: number;
  clients: number;
};

export const performanceData: PerformancePoint[] = [
  { name: "Lun", leads: 48, responses: 14, clients: 3 },
  { name: "Mar", leads: 56, responses: 21, clients: 4 },
  { name: "Mié", leads: 61, responses: 25, clients: 5 },
  { name: "Jue", leads: 58, responses: 22, clients: 4 },
  { name: "Vie", leads: 72, responses: 31, clients: 7 },
  { name: "Sáb", leads: 39, responses: 15, clients: 2 },
  { name: "Dom", leads: 44, responses: 17, clients: 3 },
];
