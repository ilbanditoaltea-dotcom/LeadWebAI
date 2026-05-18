import type { AgentActivityItem } from "@/app/lib/mock-data";
import { AgentActivity } from "@/app/components/dashboard/agent-activity";

type ActivityFeedProps = {
  items: AgentActivityItem[];
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return <AgentActivity items={items} />;
}
