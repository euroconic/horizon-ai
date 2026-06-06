import { GoogleGenAI } from "@google/genai";

// Core Intelligence Layer. Swapped from Anthropic to Google Gemini.
// The complete()/extractJson() interface is kept stable so the API routes and
// prompts (lib/prompts.ts) did not need to change beyond the model id.

let client: GoogleGenAI | null = null;

export function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local (see .env.example)."
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

// Calls Gemini and returns the response text.
export async function complete(opts: {
  system: string;
  user: string;
  model: string;
  maxTokens: number;
}): Promise<string> {
  // Gemini occasionally returns 503 UNAVAILABLE ("high demand") or 429.
  // Retry a few times with backoff so the wizard doesn't fail on a transient blip.
  const maxAttempts = 4;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await getClient().models.generateContent({
        model: opts.model,
        contents: opts.user,
        config: {
          systemInstruction: opts.system,
          maxOutputTokens: opts.maxTokens,
          temperature: 0.6,
          // Disable Gemini 2.5 "thinking" so the full output budget goes to the
          // answer (long Markdown resumes were otherwise at risk of truncation).
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
      const text = res.text;
      if (!text) throw new Error("Empty response from Gemini.");
      return text.trim();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const transient = /\b(503|UNAVAILABLE|429|RESOURCE_EXHAUSTED|overloaded|high demand)\b/i.test(msg);
      if (!transient || attempt === maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, attempt * 2500));
    }
  }
  throw lastErr;
}

// Extracts the first balanced JSON object from a model response that may be
// wrapped in prose or ```json fences.
export function extractJson<T>(raw: string): T {
  let s = raw.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model output.");
  }
  return JSON.parse(s.slice(start, end + 1)) as T;
}
