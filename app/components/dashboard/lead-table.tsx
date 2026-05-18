import { LeadsTable, type LeadTableRow } from "@/app/components/dashboard/leads-table";

type LeadTableProps = {
  leads: LeadTableRow[];
};

export function LeadTable({ leads }: LeadTableProps) {
  return <LeadsTable leads={leads} />;
}
