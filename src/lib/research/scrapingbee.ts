export async function crawlWithScrapingBee(url: string): Promise<string | null> {
  const key = process.env.SCRAPINGBEE_API_KEY;
  if (!key || !url || url === "unknown") return null;
  try {
    const endpoint = `https://app.scrapingbee.com/api/v1/?api_key=${key}&url=${encodeURIComponent(url)}&render_js=false`;
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) return null;
    const html = await response.text();
    return html.slice(0, 25000);
  } catch {
    return null;
  }
}
