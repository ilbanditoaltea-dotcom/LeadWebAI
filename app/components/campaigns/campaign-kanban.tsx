import { CampaignsKanban, type CampaignLead } from "@/app/components/campaigns/campaigns-kanban";

type CampaignKanbanProps = {
  initialLeads: CampaignLead[];
  useSupabase: boolean;
};

export function CampaignKanban({ initialLeads, useSupabase }: CampaignKanbanProps) {
  return <CampaignsKanban initialLeads={initialLeads} useSupabase={useSupabase} />;
}
