// POST /api/generate — Module 3: the downleveling engine. Turns a CIS top-manager
// profile + STAR answers into a Senior IC resume in target-market Markdown.
import { NextRequest, NextResponse } from "next/server";
import { complete } from "@/lib/llm";
import {
  downlevelSystem,
  downlevelUserMessage,
  MODEL,
  MAX_TOKENS,
} from "@/lib/prompts";
import type {
  GenerateRequest,
  GenerateResponse,
  ResumeProfile,
  ApiError,
} from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { profile, qa, country, target_role } =
      (await req.json()) as GenerateRequest;
    const answers = Array.isArray(qa) ? qa : [];

    // Merge target country/role into the profile so downstream stays consistent.
    const profileWithTarget: ResumeProfile = {
      ...profile,
      target_market: { country, target_role },
    };

    const raw = await complete({
      system: downlevelSystem(country, target_role),
      user: downlevelUserMessage(profileWithTarget, answers),
      model: MODEL,
      maxTokens: MAX_TOKENS,
    });

    // Strip any leading/trailing ```markdown / ``` fences the model may add.
    const markdown = stripFences(raw);

    return NextResponse.json<GenerateResponse>({ markdown });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown generate error.";
    return NextResponse.json<ApiError>({ error: message }, { status: 500 });
  }
}

function stripFences(text: string): string {
  let s = text.trim();
  // Opening fence: ``` or ```markdown / ```md
  s = s.replace(/^```(?:markdown|md)?\s*\n?/i, "");
  // Closing fence.
  s = s.replace(/\n?```\s*$/i, "");
  return s.trim();
}
