const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const baseUrl = "http://localhost:3000";

function loadEnvFromLocalFile() {
  const envRaw = fs.readFileSync(".env.local", "utf8");
  for (const line of envRaw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function mapGoalByCategory(category) {
  const value = String(category || "").toLowerCase();
  if (value.includes("rest") || value.includes("hotel")) return "get_reservations";
  if (value.includes("clinic") || value.includes("beauty") || value.includes("barber")) {
    return "get_appointments";
  }
  if (value.includes("shop") || value.includes("tienda")) return "sell_products";
  if (value.includes("auto") || value.includes("motor")) return "get_calls";
  return "capture_leads";
}

async function postJson(path, payload) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  return { response, json };
}

async function main() {
  loadEnvFromLocalFile();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id,business_name,category,city,description,website_url")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Lead query failed: ${error.message}`);
  }
  if (!leads || leads.length === 0) {
    throw new Error("No leads available for E2E test");
  }

  let ok = 0;
  let fail = 0;
  const failures = [];

  for (const lead of leads) {
    try {
      const analyzePayload = {
        leadId: lead.id,
        businessName: lead.business_name || "Business",
        category: lead.category || "generic",
        city: lead.city || "unknown",
        description: lead.description || "unknown",
        websiteUrl: lead.website_url || "unknown",
      };
      const { response: analyzeResponse, json: analyzeJson } = await postJson(
        "/api/agent/analyze-business",
        analyzePayload,
      );
      if (!analyzeResponse.ok) {
        throw new Error(`analyze failed: ${analyzeJson.error || analyzeResponse.status}`);
      }

      const generatePayload = {
        leadId: lead.id,
        businessName: lead.business_name || "Business",
        category: lead.category || "generic",
        city: lead.city || "unknown",
        description: lead.description || "unknown",
        phone: "unknown",
        email: "unknown",
        whatsapp: "unknown",
        address: "unknown",
        websiteUrl: lead.website_url || "unknown",
        detectedProblems: analyzeJson.detectedProblems || [],
        recommendations: analyzeJson.recommendations || [],
        targetGoal: mapGoalByCategory(lead.category),
      };
      const { response: generateResponse, json: generateJson } = await postJson(
        "/api/agent/generate-website",
        generatePayload,
      );
      if (!generateResponse.ok) {
        throw new Error(`generate failed: ${generateJson.error || generateResponse.status}`);
      }

      const messagePayload = {
        lead: {
          id: lead.id,
          businessName: lead.business_name || "Business",
          city: lead.city || "unknown",
          category: lead.category || "generic",
          detectedProblems: analyzeJson.detectedProblems || [],
        },
        generatedWebsite: {
          id: generateJson.generatedWebsiteId,
          demo_slug: generateJson.demoSlug,
          demoUrl: generateJson.demoSlug ? `${baseUrl}/demo/${generateJson.demoSlug}` : "unknown",
        },
        channel: "email",
      };
      const { response: messageResponse, json: messageJson } = await postJson(
        "/api/agent/generate-message",
        messagePayload,
      );
      if (!messageResponse.ok) {
        throw new Error(`message failed: ${messageJson.error || messageResponse.status}`);
      }

      const nextPayload = {
        leadId: lead.id,
        status: "pending_approval",
        opportunityScore: analyzeJson.opportunityScore,
        websiteQualityScore: analyzeJson.websiteQualityScore,
        hasGeneratedWebsite: true,
        hasMessage: true,
      };
      const { response: nextResponse, json: nextJson } = await postJson(
        "/api/agent/next-action",
        nextPayload,
      );
      if (!nextResponse.ok) {
        throw new Error(`next-action failed: ${nextJson.error || nextResponse.status}`);
      }

      ok += 1;
      console.log(
        `OK | ${lead.business_name} | demo=${generateJson.demoSlug || "n/a"} | next=${nextJson.nextAction}`,
      );
    } catch (errorItem) {
      fail += 1;
      const reason = errorItem instanceof Error ? errorItem.message : String(errorItem);
      failures.push({ lead: lead.business_name, reason });
      console.log(`FAIL | ${lead.business_name} | ${reason}`);
    }
  }

  console.log(`E2E_RESULT ${JSON.stringify({ tested: leads.length, ok, fail })}`);
  if (failures.length > 0) {
    console.log(`E2E_FAILURES ${JSON.stringify(failures)}`);
  }
}

main().catch((error) => {
  console.error(`E2E_ABORTED ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
