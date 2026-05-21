import OpenAI from "openai";
import { z } from "zod";

function hasKey() {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(key && key.startsWith("sk-") && key !== "tu_api_key");
}

function extractJsonChunk(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return raw;
  return raw.slice(start, end + 1);
}

export async function callOpenAiJson<T>(params: {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  jsonSchemaName: string;
  jsonSchemaDefinition?: Record<string, unknown>;
  model?: string;
}): Promise<T | null> {
  if (!hasKey()) return null;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const tryParse = (raw: string) => {
    const first = params.schema.safeParse(JSON.parse(raw));
    if (first.success) return first.data;
    const repairedRaw = extractJsonChunk(raw);
    const second = params.schema.safeParse(JSON.parse(repairedRaw));
    return second.success ? second.data : null;
  };

  try {
    const completion = await client.chat.completions.create({
      model: params.model ?? "gpt-4.1-mini",
      temperature: 0.25,
      response_format: params.jsonSchemaDefinition
        ? {
            type: "json_schema",
            json_schema: {
              name: params.jsonSchemaName,
              schema: params.jsonSchemaDefinition,
            },
          }
        : { type: "json_object" },
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    return tryParse(raw);
  } catch {
    try {
      const fallback = await client.chat.completions.create({
        model: params.model ?? "gpt-4.1-mini",
        temperature: 0.25,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user },
        ],
      });
      const raw = fallback.choices[0]?.message?.content;
      if (!raw) return null;
      return tryParse(raw);
    } catch {
      return null;
    }
  }
}
