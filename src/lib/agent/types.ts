import type {
  AnalyzeBusinessInput,
  AnalyzeBusinessOutput,
} from "@/src/lib/ai/analyze-business";
import type {
  GenerateCustomWebsiteInput,
  GenerateCustomWebsiteOutput,
} from "@/src/lib/ai/generate-custom-website";
import type {
  GenerateSalesMessageInput,
  GenerateSalesMessageOutput,
} from "@/src/lib/ai/generate-sales-message";

export type AgentMode = "live_agent" | "mock_fallback";

export type AgentAnalyzeBusinessInput = AnalyzeBusinessInput;
export type AgentAnalyzeBusinessOutput = AnalyzeBusinessOutput & { mode: AgentMode };

export type AgentGenerateWebsiteInput = GenerateCustomWebsiteInput;
export type AgentGenerateWebsiteOutput = GenerateCustomWebsiteOutput & { mode: AgentMode };

export type AgentRegenerationMode = "style" | "copy" | "sections" | "hero";
export type AgentRegenerateWebsiteInput = {
  generatedWebsiteId: string;
  currentWebsiteJson: GenerateCustomWebsiteOutput;
  instruction: string;
  mode: AgentRegenerationMode;
};
export type AgentRegenerateWebsiteOutput = GenerateCustomWebsiteOutput & { mode: AgentMode };

export type AgentGenerateMessageInput = GenerateSalesMessageInput;
export type AgentGenerateMessageOutput = GenerateSalesMessageOutput & { mode: AgentMode };

export type AgentNextActionInput = {
  leadId: string;
  status?: string;
  opportunityScore?: number | null;
  websiteQualityScore?: number | null;
  hasGeneratedWebsite?: boolean;
  hasMessage?: boolean;
};

export type AgentNextActionOutput = {
  mode: AgentMode;
  nextAction:
    | "analyze_business"
    | "generate_website"
    | "regenerate_website"
    | "generate_message"
    | "approve_and_contact"
    | "follow_up";
  reason: string;
  priority: "low" | "medium" | "high";
};
