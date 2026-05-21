const FIRECRAWL_URL = "https://api.firecrawl.dev/v1/scrape";

export async function crawlWithFirecrawl(url: string): Promise<string | null> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key || !url || url === "unknown") return null;
  try {
    const response = await fetch(FIRECRAWL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown", "html"],
        onlyMainContent: true,
      }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json = (await response.json()) as {
      data?: { markdown?: string; html?: string };
    };
    return (json.data?.markdown ?? json.data?.html ?? "").slice(0, 25000) || null;
  } catch {
    return null;
  }
}
