// POST /api/interview — Module 2: STAR unpacker. Generates one clarifying
// question at a time, hard-capped at MAX_INTERVIEW_QUESTIONS.
import { NextRequest, NextResponse } from "next/server";
import { complete, extractJson } from "@/lib/anthropic";
import { interviewSystem, MODEL } from "@/lib/prompts";
import {
  MAX_INTERVIEW_QUESTIONS,
  type InterviewRequest,
  type InterviewResponse,
  type ApiError,
} from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { profile, history } = (await req.json()) as InterviewRequest;
    const turns = Array.isArray(history) ? history : [];

    // Hard cap: не дёргаем модель, если лимит вопросов уже исчерпан.
    if (turns.length >= MAX_INTERVIEW_QUESTIONS) {
      return NextResponse.json<InterviewResponse>({
        done: true,
        question: null,
      });
    }

    const raw = await complete({
      system: interviewSystem(profile, turns),
      user: "Сгенерируй следующий вопрос или заверши.",
      model: MODEL,
      maxTokens: 1024,
    });

    const parsed = extractJson<InterviewResponse>(raw);

    // Defensive: пустой вопрос трактуем как завершение интервью.
    if (!parsed.question || parsed.question.trim() === "") {
      return NextResponse.json<InterviewResponse>({
        done: true,
        question: null,
      });
    }

    return NextResponse.json<InterviewResponse>({
      done: !!parsed.done,
      question: parsed.question,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown interview error.";
    return NextResponse.json<ApiError>({ error: message }, { status: 500 });
  }
}
