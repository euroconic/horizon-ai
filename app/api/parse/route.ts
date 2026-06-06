// POST /api/parse — Module 1: parse raw resume (file or text) into ResumeProfile.
// Node runtime: pdf-parse/mammoth need Node APIs (Buffer), not the edge runtime.
import { NextRequest, NextResponse } from "next/server";
import { complete, extractJson } from "@/lib/llm";
import { extractText } from "@/lib/extract";
import { PARSE_SYSTEM, MODEL, MAX_TOKENS } from "@/lib/prompts";
import type { ParseResponse, ResumeProfile, ApiError } from "@/lib/types";

export const runtime = "nodejs";

const MIN_TEXT_LENGTH = 30;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let resumeText = "";

    if (contentType.includes("multipart/form-data")) {
      // Файл из формы: PDF / DOCX / txt -> Buffer -> extractText.
      const form = await req.formData();
      const file = form.get("file");
      if (!file || !(file instanceof File)) {
        return NextResponse.json<ApiError>(
          { error: "No file provided in 'file' field." },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      resumeText = await extractText(buffer, file.name, file.type);
    } else {
      // JSON путь: { text }.
      const body = (await req.json()) as { text?: string };
      resumeText = (body.text || "").trim();
    }

    if (resumeText.length < MIN_TEXT_LENGTH) {
      return NextResponse.json<ApiError>(
        { error: "Resume text is empty or too short to parse." },
        { status: 400 }
      );
    }

    const raw = await complete({
      system: PARSE_SYSTEM,
      user: resumeText,
      model: MODEL,
      maxTokens: MAX_TOKENS,
    });

    const profile = extractJson<ResumeProfile>(raw);

    // Defensive defaults — модель может вернуть неполный объект.
    if (!Array.isArray(profile.experience)) {
      profile.experience = [];
    }
    if (!profile.target_market) {
      profile.target_market = { country: "", target_role: "" };
    }

    return NextResponse.json<ParseResponse>({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown parse error.";
    return NextResponse.json<ApiError>({ error: message }, { status: 500 });
  }
}
